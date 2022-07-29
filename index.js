import { gql, ApolloServer } from 'apollo-server'
// Importamos la conexion a la base de datos
import './db.js'
//Improtamos el modelo de la Persona
import Person from './models/person.js'

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
    // Hacemos que cuenta las personas que tenemos en nuestra base de datos
    personCount: () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {
      // Si no esta el parametro phone devolvemos todas las personas
      if (!args) return await Person.find({})

      // Si nos ha pasado el parametro phone devolvemos las personas que si tienen telefono y si ha indicado que no las que no tengan
      return Person.find({ phone: { $exists: args.phone === 'YES' } })
    },
    findPerson: (root, args) => {
      const { name } = args
      // Que solo nos encuentre el que tenga el nombre igual al name de los args
      return Person.findOne({ name })
    }
  },
  Mutation: {
    addPerson: (root, args) => {
      // Creamos la nueva persona
      const person = new Person({ ...args })

      // retornamos y guardamos la nueva persona
      return person.save()
    },
    editNumber: async (root, args) => {
      // Busamos la persona por el nombre
      const person = await Person.findOne({ name: args.name })
      // Cambiamos el numero
      person.phone = args.phone
      // Lo guardamos y retornamos
      return person.save()
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
