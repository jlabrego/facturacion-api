import {jsonResponse} from '../helpers/json_response.js'
import ProductsModel from '../models/product.model.js'

export const getProducts = async (req, res) => {
    try{
        const products = await ProductsModel.getProducts()
        return res.status(200).json(jsonResponse({
            status: 200,
            message: 'Productos obtenidos correctamente',
            data: products
        }))
    }
    catch(e){{
        return res.status(500).json(jsonResponse({
            status: 500,
            message: "Error al obtener los productos",
            data: null
        }))
    }
}}

export const createProduct = async (req, res) => {
    try{
        const product = req.body

        if(req.user.role !== 'ADMIN'){
            return res.status(403).json(jsonResponse({
                status: 403,
                message: 'No tienes permisos para crear productos',
                data: null
            }))
        }

        
            
            const productId = await ProductsModel.createProduct(product)
            return res.status(201).json(jsonResponse({
                status: 201,
                message: 'Producto creado correctamente',
                data: {id: productId}
            }))
    }catch(e){
        return res.status(500).json(jsonResponse({
            status: 500,
            message: "Error al crear el producto",
            data: null
        }))
    }
}

export const updateStock = async (req, res) => {

    try{

        const { id } = req.params
        const { stock_to_add } = req.body

        if(req.user.role !== 'ADMIN'){
            return res.status(403).json(jsonResponse({
                status: 403,
                message: 'No tienes permisos para actualizar el stock',
                data: null
            }))
        }

        const updateRows = await ProductsModel.updateStock({ id, stock_to_add })
        if(updateRows === 0){
            return res.status(404).json(jsonResponse({
                status: 404,
                message: 'Producto no encontrado',
                data: null
            }))
        }

        return res.status(200).json(jsonResponse({
            status: 200,
            message: 'Stock actualizado correctamente',
            data: null
        }))


    }
    catch(e){
        return res.status(500).json(jsonResponse({
            status: 500,
            message: "Error al actualizar el stock",
            data: null
        }))
    }
}