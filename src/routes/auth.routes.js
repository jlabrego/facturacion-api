import { Router } from 'express'
import {login} from '../controllers/auth.controller.js'

const authRoutes = Router()

console.log('AuthRoutes cargadas')

authRoutes.post('/login', login)

export default authRoutes