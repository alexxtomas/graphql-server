import { gql, UserInputError, ApolloServer } from 'apollo-server'
import { v1 as uuid } from 'uuid'
const persons = [
  {
    name: 'Midu',
    phone: '034-1234568',
    street: 'Calle Frontend',
    city: 'Barcelona',
    id: '3d5454-5454354-543543-543543543-54353'
  },
  {
    name: 'Youseff',
    phone: '044-434343',
    street: 'Avenida Fullstack',
    city: 'Mataro',
    id: '3d5454-4324235-232343242-23222-232233'
  },
  {
    name: 'Itzi',
    street: 'Pasaje Testing',
    city: 'Ibiza',
    id: '3d5454-3232-8788787-654645-5433453'
  }
]

// Añadimos en las Mutations el editNumber
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

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
  }
`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
      if (!args) return persons

      return persons.filter((person) => {
        return args.phone === 'YES' ? person.phone : !person.phone
      })
    },
    findPerson: (root, args) => {
      const { name } = args
      return persons.find((person) => person.name === name)
    }
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name
        })
      }

      const person = { ...args, id: uuid() }

      persons.push(person)

      return person
    },
    // Añadimos la funcionalidad para el editNumber
    editNumber: (root, args) => {
      // Buscamos el indice de la persona a cambiar el numero
      const personIndex = persons.findIndex((p) => p.name === args.name)

      // Si la persona no existe retornamos null
      if (!personIndex === -1) return null

      // Extraemos los datos de la persona buscando en persons con el indice previamente definido
      const person = persons[personIndex]

      // Actualizamos el numero de la persona
      const updatePerson = { ...person, phone: args.phone }

      // Machacamos la persona anterior por la nueva con el nuevo numero de telefono
      persons[personIndex] = updatePerson

      // retornamos la persona con el numero actualizado
      return updatePerson
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
