const { ApolloServer, gql } = require('apollo-server')
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
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      if (!args.author && !args.genre) {
        return books
      }
      return books.filter(book => {
        if (args.author && args.genre) {
          return book.author === args.author && book.genres.includes(args.genre)
        }
        return !args.genre
          ? book.author === args.author
          : book.genres.includes(args.genre)
      })
    },
    allAuthors: () => {
      return  Author.find({})
      // return [...authors].map(author => {
      //   let bookCount = 0
      //   books.map(book => {
      //     if(book.author === author.name) {
      //       bookCount += 1
      //       author.bookCount = bookCount
      //     }
      //   })
      //   return author
      // })
    }
  },
  Mutation: {
    addBook: (root, args) => {
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      const author = authors.find(author => (
        author.name === book.author
      ))
      if (!author) {
        authors = authors.concat({
          name: book.author,
          born: null,
          id: uuid()
        })
      }
      return book
    },
    editAuthor: (root, args) => {
      const authorToUpdate = authors.find(author => author.name === args.name)
      if (!authorToUpdate) {
        return null
      }
      const updatedAuthor = { ...authorToUpdate, born: args.setBornTo }
      authors = authors.map(author => (
        author.name === args.name ? updatedAuthor : author
      ))
      return updatedAuthor
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
