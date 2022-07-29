import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4
  },
  phone: {
    type: String,
    minlength: 5
  },
  street: {
    type: String,
    required: true,
    minlenght: 5
  },
  city: {
    type: String,
    required: true,
    minlenght: 3
  }
})

schema.plugin(uniqueValidator)

export default mongoose.model('Person', schema)
