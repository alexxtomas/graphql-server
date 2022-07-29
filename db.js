import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

// Añadimos la uri de mongodb
const connectionString = process.env.MONGO_DB_URI

// Nos conectamos a la uri
mongoose
  .connect(connectionString)
  .then(() => console.log('Connected To MongoDB'))
  .catch((err) => console.error('Error Connection To MongoDB', err.message))
