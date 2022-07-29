import { gql, ApolloServer, UserInputError } from 'apollo-server'
import './db.js'
import Person from './models/person.js'
import User from './models/user.js'
// Importamos jsonwebtoken
import jwt from 'jsonwebtoken'

// Extraemos la contraseña para utilizar en los jsonwebtokens en este caso extraida del .env
const { JWT_SECRET } = process.env

const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }
  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type User {
    username: String!
    friends: [Person]!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
    me: User
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
    createUser(username: String!): User
    login(username: String!, password: String!): Token
  }
`

const resolvers = {
  Query: {
    personCount: () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {
      if (!args) return await Person.find({})

      return Person.find({ phone: { $exists: args.phone === 'YES' } })
    },
    findPerson: (root, args) => {
      const { name } = args
      return Person.findOne({ name })
    }
  },
  Mutation: {
    addPerson: async (root, args) => {
      const person = new Person({ ...args })

      try {
        await person.save()
      } catch (e) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      return person
    },
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })

      if (!person) return

      person.phone = args.phone

      try {
        await person.save()
      } catch (e) {
        throw new UserInputError(e.message, {
          invalidArgs: args
        })
      }
      return person
    },
    // Creamos el resolver de createUser en el que creamos el usuario y lo guardamos
    createUser: (root, args) => {
      const user = new User({ username: args.username })
      return user.save().catch((e) => {
        throw new UserInputError(e.message, {
          invalidArgs: args
        })
      })
    },
    // Creamos el resolver de login
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      /* Para esto deberiamos guardar el password en la base de datos en un hash y desencriptarlo con bcrypt y ver si coincide pero para
      ir mas rapido lo hacemos asi que es mas rapido */

      if (!user || args.password !== 'alexpassword') {
        throw new UserInputError('Wrong Credentials')
      }

      // Creamos el usario para token
      const userForToken = {
        username: user.username,
        id: user._id
      }

      // Retornamos y creamos el token con el usarioParaToken y la palabra secreta
      return {
        value: jwt.sign(userForToken, JWT_SECRET)
      }
    }
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
