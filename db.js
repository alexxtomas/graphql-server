import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const connectionString = process.env.MONGO_DB_URI

mongoose
  .connect(connectionString)
  .then(() => console.log('Connected To MongoDB'))
  .catch((err) => console.error('Error Connection To MongoDB', err.message))
