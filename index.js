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
    allUsers: [User]!
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
    addAsFriend(name: String!): User
  }
`

const resolvers = {
  Query: {
    personCount: () => Person.collection.countDocuments(),
    allPersons: async (root, { phone }) => {
      if (!phone) return await Person.find({})

      return await Person.find({ phone: { $exists: phone === 'YES' } })
    },
    findPerson: async (root, args) => {
      const { name } = args
      return await Person.findOne({ name })
    },
    me: (root, args, context) => {
      return context.currentUser
    },
    allUsers: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError('Not Authenticated')
      const users = await User.find({})
      return users
    }
  },
  Mutation: {
    addPerson: async (root, args, context) => {
      const { currentUser } = context
      if (!currentUser) throw new AuthenticationError('Not Authenticated')
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
    },
    addAsFriend: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError('Not Authenticated')
      const person = await Person.findOne({ name: args.name })
      if (!person)
        throw new UserInputError(`Cannot find ${args.name} in database`)
      const nonFriendlyAlredy = (person) =>
        !currentUser.friends.map((p) => p._id).includes(person._id)
      if (!nonFriendlyAlredy(person)) {
        currentUser.friends = currentUser.friends.concat(person)
        await currentUser.save()
      }
      return currentUser
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
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null

    if (auth && auth.toLocaleLowerCase().startsWith('bearer ')) {
      const token = auth.substring(7)
      const { id } = jwt.verify(token, JWT_SECRET)

      const currentUser = await User.findById(id).populate('friends')

      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
