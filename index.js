import express from 'express'
import dotenv from 'dotenv/config'
import { pool } from './src/db/db.js'
import authRoutes from './src/routes/auth.routes.js'
import productRouter from './src/routes/product.routes.js'
import invoiceRouter from './src/routes/invoice.routes.js'

const app = express()
app.use(express.json())


const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('API Facturación funcionando')
})


app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/invoices', invoiceRouter)


try {
    const connection = await pool.getConnection()
    console.log(' Base de datos conectada')
    connection.release()
}
 catch (error) {
    console.error('Error al conectar la base de datos')
    console.error(error.message)
}


app.listen(PORT,() => {
    console.log(`Servidor en marcha en: http://localhost: ${PORT}`)
})

