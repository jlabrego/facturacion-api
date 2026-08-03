import jwt from 'jsonwebtoken'
import { jsonResponse } from '../helpers/json_response.js'

export const isAuth = async (req, res, next) => {

    // capturar la req y obtener los encabezados
    if(!req.headers.authorization){
        return res.status(401).json(jsonResponse({
            status: 401,
            message: 'Debe iniciar sesión',
            data: null
        }))
    }
    const token = req.headers.authorization.split(' ')[1]


    //validar la data
    try {
        const payload = jwt.verify( token, process.env.JWT_SECRET)

        req.user = payload
        next()
    } 
    catch (e) {
        console.log(e)
        return res.status(401).json(jsonResponse({
            status: 401,
            message: 'Debe iniciar sesión',
            data: null
        }))
    }

}