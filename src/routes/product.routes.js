import { Router } from 'express'
import { getProducts, createProduct, updateStock } from '../controllers/product.controller.js'
import { isAuth } from '../middlewares/isAuth.js'


const productRouter = Router()

productRouter.get('/',  getProducts)
productRouter.post('/', isAuth, createProduct)
productRouter.patch('/:id/stock', isAuth, updateStock)

export default productRouter