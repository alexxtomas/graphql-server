import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  // Vamos hacer que cada usuario pueda tener una lista de amigos estos amigos van a ser personas que esten en la base de datos
  friends: [
    {
      // Hacemos referencia al modelo Person
      ref: 'Person',
      type: mongoose.Schema.Types.ObjectId
    }
  ]
  //   password: {
  //     type: String,
  //     required: true,
  //     unique: true,
  //     minlength: 5
  //   }
})

schema.plugin(uniqueValidator)

export default mongoose.Model('User', schema)
