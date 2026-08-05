import { Router } from 'express'
import { isAuth } from '../middlewares/isAuth.js'
import { createInvoice, getInvoices, getInvoiceById, voidInvoice } from '../controllers/invoice.controller.js'

const invoiceRouter = Router()

invoiceRouter.post('/', isAuth, createInvoice)
invoiceRouter.get('/', isAuth, getInvoices)
invoiceRouter.get('/:id', isAuth, getInvoiceById)
invoiceRouter.patch('/:id/void', isAuth, voidInvoice)

export default invoiceRouter