const mongoose = require('mongoose')

const authorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4
  },
  born: {
    type: Number
  }
})

module.exports = mongoose.model('Author', authorSchema)
