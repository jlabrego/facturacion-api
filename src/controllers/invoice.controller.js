import InvoicesModel from "../models/invoice.model.js"
import { jsonResponse } from "../helpers/json_response.js"
import { invoiceSchema } from "../schemas/invoice.schema.js";

export const createInvoice = async (req, res) => {

    if(req.user.role !== 'ADMIN' && req.user.role !== 'CASHIER'){
        return res.status(403).json(jsonResponse({
            status: 403,
            message: "No tiene permisos para crear facturas",
            data: null
        }))
    }

    const validation = invoiceSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json(jsonResponse({
            status: 400,
            message: "Datos inválidos",
            data: validation.error.flatten()
        }))
    }

    const invoice = {
        ...validation.data,
        user_id: req.user.id
    };

    try {
        const result = await InvoicesModel.createInvoice(invoice)

        return res.status(201).json(jsonResponse({
            status: 201,
            message: "Factura creada exitosamente",
            data: result
        }))
    }
    catch (error){
        if(
            error.message === "Usuario inválido" || 
            error.message === "La factura debe contener al menos un producto" || 
            error.message.includes("Stock insuficiente") ||
            error.message.toLowerCase().includes("no existe")
         ) {

            return res.status(400).json(jsonResponse({
                status: 400,
                message: error.message,
                data: null
            }))

        }

        return res.status(500).json(jsonResponse({
            status: 500,
            message: "Error interno del servidor",
            data: null
        }))
    }
}

export const getInvoices = async (req, res) => {
    const user = req.user

    if(user.role !== 'ADMIN' && user.role !== 'CASHIER'){
        return res.status(403).json(jsonResponse({
            status: 403,
            message: "No tiene permisos para ver las facturas",
            data: null
        }))
    }

    try{
        const invoices = await InvoicesModel.getInvoices(req.user)
        return res.status(200).json(jsonResponse({
            status: 200,
            message: "Facturas obtenidas exitosamente",
            data: invoices
        }))
    }
    catch (error){
    console.log(error)
        
        return res.status(500).json(jsonResponse({
            status: 500,
            message: "Error interno del servidor",
            data: null
        }))
    }

}

export const getInvoiceById = async (req, res) => {
    const { id } = req.params

    if(req.user.role !== 'ADMIN' && req.user.role !== 'CASHIER'){
        return res.status(403).json(jsonResponse({
            status: 403,
            message: "No tiene permisos para ver la factura",
            data: null
        }))
    }

    try{
        const invoice = await InvoicesModel.getInvoiceById(id)
        if(!invoice){
            return res.status(404).json(jsonResponse({
                status: 404,
                message: "Factura no encontrada",
                data: null
            }))
        }
        return res.status(200).json(jsonResponse({
            status: 200,
            message: "Factura obtenida exitosamente",
            data: invoice
        }))
    }
    catch (error){
        return res.status(500).json(jsonResponse({
            status: 500,
            message: "Error interno del servidor",
            data: null
        }))
    }

}

export const voidInvoice = async (req, res) => {
    const { id } = req.params

    if(req.user.role !== 'ADMIN' ){
        return res.status(403).json(jsonResponse({
            status: 403,
            message: "No tiene permisos para anular la factura",
            data: null
        }))
    }

    try{
        const result = await InvoicesModel.voidInvoice(id)
        return res.status(200).json(jsonResponse({
            status: 200,
            message: "Factura anulada exitosamente",
            data: result
        }))
    }
    catch (error){
        if(error.message === "Factura no encontrada") {

            return res.status(404).json(jsonResponse({
                status: 404,
                message: error.message,
                data: null
            }))
        }
        if(error.message === "La factura ya fue anulada") {
            return res.status(400).json(jsonResponse({
                status: 400,
                message: error.message,
                data: null
            }))
        }

        return res.status(500).json(jsonResponse({
            status: 500,
            message: "Error interno del servidor",
            data: null
        }))
    }
}