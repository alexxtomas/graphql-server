// UserInputError para decirle al usuario que ha cometido un error
import { gql, UserInputError, ApolloServer } from 'apollo-server'
// Para generar la id
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

// type Mutation definimos la mutacion que va añadir una persona y la va a devolver
const typeDefinitions = gql`
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
    allPersons: [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
  }
`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => {
      const { name } = args
      return persons.find((person) => person.name === name)
    }
  },
  // Le decimos que tiene que hacer el Mutation y cuando lo tiene que resolver
  Mutation: {
    addPerson: (root, args) => {
      // Hacer comprobacion de que el usuario no pueda añadir dos personas con el mismo nombre
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name
        })
      }

      // Sacamos todos los parametros pasados a addPerson que seran el name, phone, street y city. Le generamos la id llamando al uuid()
      const person = { ...args, id: uuid() }

      // Añadimos la persona a la lista de personas
      persons.push(person)

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
