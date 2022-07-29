import { gql, ApolloServer, UserInputError } from 'apollo-server'
import './db.js'
import Person from './models/person.js'
// Importamos el modelo User
import User from './models/user.js'

/*Definimos el tipo User y Token, en queries añadimos una nueva para consultar los datos del usuario y en mutations el poder crear un 
usuario y el poder logearse*/
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
