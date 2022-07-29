import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

// Creamos el schema de la persona
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

// Añadimos el uniqueValidator como plugin al schema
schema.plugin(uniqueValidator)

// Creamos el modelo Person con el schema previamente definido y lo exportamos
export default mongoose.model('Person', schema)
