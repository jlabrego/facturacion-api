import express from 'express'
import dotenv from 'dotenv/config'
import { pool } from './src/db/db.js'
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/invoices', invoiceRoutes)

const app = express()
app.use(express.json())


const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('API Facturación funcionando')
})
try {
    const connection = await pool.getConnection()
    console.log(' Base de datos conectada')
    connection.release()
} catch (error) {
    console.error('Error al conectar la base de datos')
    console.error(error.message)
}
app.listen(PORT,() => {
    console.log(`Servidor en marcha en: htpp://localhost: ${PORT}`)
})

