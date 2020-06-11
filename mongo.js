require('dotenv').config()
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')

const url = process.env.MONGODB_URI
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

mongoose.connect(url, dbOptions)

const authors = [
  {
    name: 'Robert Martin',
    born: 1952,
    books: [],
    _id: '5ed6a99250a3045c26b92caa'
  },
  {
    name: 'Martin Fowler',
    born: 1963,
    books: [],
    _id: '5ed6a99250a3045c26b92cab'
  },
  {
    name: 'Fyodor Dostoevsky',
    born: 1821,
    books: [],
    _id: '5ed6a99250a3045c26b92cac'
  },
  {
    name: 'Joshua Kerievsky',
    books: [],
    _id: '5ed6a99250a3045c26b92cad'
  },
  {
    name: 'Sandi Metz',
    books: [],
    _id: '5ed6a99250a3045c26b92cae'
  }
]

const books = [
  {
    title: 'Clean Code',
    published: 2008,
    genres: ['refactoring'],
    author: '5ed6a99250a3045c26b92caa'
  },
  {
    title: 'Agile software development',
    published: 2002,
    genres: ['agile', 'patterns', 'design'],
    author: '5ed6a99250a3045c26b92caa'
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    genres: ['refactoring'],
    author: '5ed6a99250a3045c26b92cab'
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    genres: ['refactoring', 'patterns'],
    author: '5ed6a99250a3045c26b92cad'
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    genres: ['refactoring', 'design'],
    author: '5ed6a99250a3045c26b92cae'
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    genres: ['classic', 'crime'],
    author: '5ed6a99250a3045c26b92cac'
  },
  {
    title: 'The Demon ',
    published: 1872,
    genres: ['classic', 'revolution'],
    author: '5ed6a99250a3045c26b92cac'
  },
]

const insertDataInDB = async (authorData, bookData) => {
  let author = await Author.findOne({ name: authorData.name })
  if (!author) {
    author = new Author({
      name: authorData.name,
      born: authorData.born,
      books: []
    })
  }

  const data = { ...bookData, author }
  const book = new Book({ ...data })
  author.books = author.books.concat(book._id)

  try {
    await book.save()
    await author.save()
  } catch(error) {
    console.log(error)
  }
}

const populate = async () => {
  console.log('Initializing insertions in database')
  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    const author = authors.find(author => (
      author._id.toString() === book.author.toString()
    ))
    if (author) {
      await insertDataInDB(author, book)
    }
    console.log(`Data ${i} added`)
  }
  mongoose.connection.close()
  console.log('connection to database closed')
}

const populateDB = async (objects, model) => {
  for (let i = 0; i < objects.length; i++) {
    const object= new model(objects[i])
    await object.save()
  }
  console.log('database populated')
}

const populateAll = async () => {
  try {
    await populateDB(authors, Author)
    await populateDB(books, Book)
  } catch(e) {
    console.log('Error:', e)
  }
  mongoose.connection.close()
  console.log('connection to database closed')
}

const viewBooks = async () => {
  const books = await Book.find({}).populate('author')
  console.log(books)
  mongoose.connection.close()
  console.log('connection to database closed')
}

// populateAll()
// viewBooks()
populate()
