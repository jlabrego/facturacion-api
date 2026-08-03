import jwt from 'jsonwebtoken'
import { jsonResponse } from '../../src/helpers/json_response.js'

export const isAuth = async (req, res, next) => {

    // capturar la req y obtener los encabezados
    const token = req.headers.authorization.split(' ')[1]

    //validar la data
    try {
        const { id, permissions } = jwt.verify(token, process.env.JWT_SECRET)

        const user = {
            id, permissions
        }
        req.user = user
        // req.headers.user.permission = permission

        //puede continaur
        next()
    } catch (e) {
        console.log(e)
        return res.status(401).json(jsonResponse({
            status: 401,
            message: 'Debe iniciar sesión',
            data: null
        }))
    }

}