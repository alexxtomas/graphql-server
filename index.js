// Importamos GraphQL Query Language y ApolloServer
import { gql, ApolloServer } from 'apollo-server'
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
// Definir los datos de las personas y de las query con GraphQL con la ! indicamos que es obligatorio
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
`

// Indicamos como se van a resolver los datos cuando se realicen las querys
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    // args son los parametros que le vamos a pasar al metodo
    findPerson: (root, args) => {
      const { name } = args
      return persons.find((person) => person.name === name)
    }
  },
  // Root es tiene el valor previo de lo que se haya resuelto antes
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city
      }
    }
  }
}

// Crear Servidor hay que pasarle las definiciones y los resolvers
const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers
})

// Iniciar servidor

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

// Ahora al incializar el servidor con node index.js nos abrira graphql playground en el link que nos da el .listen()
