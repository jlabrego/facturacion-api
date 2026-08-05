import AuthModel from '../models/auth.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { jsonResponse } from '../helpers/json_response.js'
import { loginSchema } from '../schemas/auth.schema.js';


export const login = async (req, res) => {
    
    const validation = loginSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json(jsonResponse({
            status: 400,
            message: "Datos inválidos",
            data: validation.error.flatten()
        }));
    }
   
    try {

        const { email, password } = validation.data;

        const user = await AuthModel.login({ email })
            if(!user) {
            return res.status(401).json(jsonResponse({
            status: 401,
            message: 'Credenciales inválidas',
            data: null
        }))
    }

    const isValidPassword = await bcrypt.compare( password, user.password_hash)


    if (!isValidPassword) {
        return res.status(401).json( jsonResponse({
            status: 401,
            message: 'Credenciales inválidas',
            data: null
        })
        )
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })  

    return res.status(200).json(jsonResponse({
        status: 200,
        message: 'Inicio de sesión exitoso',
        data: { 
            token,
            user: { 
                id: user.id,
                email: user.email, 
                role: user.role 
            } }
    }))

    } catch (error) {
        console.error("Error en login:", error)
        return res.status(500).json(jsonResponse({ 
            status: 500, 
            message: 'Error interno del servidor',
            data: null
         }))
    }

}
