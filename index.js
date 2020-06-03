const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const config = require('./config')
const Author = require('./models/author')
const Book = require('./models/book')

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).then(() => {
  console.log('connected to MongoDB')
}).catch(error => {
  console.log('error connecting to MongoDB', error.message)
})

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book,
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]
    allAuthors: [Author!]!
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } })
      }
      return Book.find({})
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      return [...authors].map(async author => {
        const books = await Book.find({})
        let bookCount = 0
        books.map(book => {
          if(book.author.toString() === author._id.toString()) {
            bookCount += 1
            author.bookCount = bookCount
          }
        })
        return author
      })
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        const newAuthor = new Author({
          name: args.author,
          born: null
        })
        try {
          await newAuthor.save()
        } catch(error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
        author = await Author.findOne({ name: newAuthor.name})
      }
      args = { ...args, author }
      const book = new Book({ ...args })
      try {
        await book.save()
      } catch(error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      return book
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        await author.save()
      } catch(error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      return author
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
