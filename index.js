// Importamos el AuthenticationError
import {
  gql,
  ApolloServer,
  UserInputError,
  AuthenticationError
} from 'apollo-server'
import './db.js'
import Person from './models/person.js'
import User from './models/user.js'
import jwt from 'jsonwebtoken'

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
    },
    // Como tercer parametro tenemos el valor que retorna el context
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    // Modificamos el addPerson para que solo los usuarios logeados puedan crear una persona
    addPerson: async (root, args, context) => {
      const { currentUser } = context
      if (!currentUser) throw new AuthenticationError('Not Authenticated')
      const person = new Person({ ...args })

      try {
        await person.save()
        // Añadimos a los amigos del usuario registrado la persona que ha creado
        currentUser.friends = currentUser.friends.concat(person)
        await currentUser.save()
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
    createUser: (root, args) => {
      const user = new User({ username: args.username })
      return user.save().catch((e) => {
        throw new UserInputError(e.message, {
          invalidArgs: args
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'alexpassword') {
        throw new UserInputError('Wrong Credentials')
      }
      const userForToken = {
        username: user.username,
        id: user._id
      }
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
  resolvers,
  // Creamos el context y recibimos como parametro la request, cada vez que hagamos una request pasara por esta funcions
  context: async ({ req }) => {
    // En auth vamos a ver si tenemos una req guardaremos el req.headers.authorization y si no sera igual a null
    const auth = req ? req.headers.authorization : null

    // Comprobamos que auth no es null y que empieza por bearer que es como le vamos a pasar el token
    if (auth && auth.toLocaleLowerCase().startsWith('bearer ')) {
      // Extraemos el token que estara despues de bearer por eso el substring(7)
      const token = auth.substring(7)
      // Verificamos el token si es correcto tendremos el userForToken con el username y la id
      const { id } = jwt.verify(token, JWT_SECRET)

      // Buscamos el usuario en nuestra base de datos por id y le decimos que nos traiga tambien la informacion de los amigos
      const currentUser = await User.findById(id).populate('friends')

      // Retornamos el currentUser como objeto
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
