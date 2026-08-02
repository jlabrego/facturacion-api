import { pool } from '../db/db.js'

export default class AuthModel {

    static login = async ({ email }) => {

        await using conn = await pool.getConnection()

        const [result] = await conn.execute(`SELECT id, email, password_hash, role from users where email = ? `,[email])

            return result[0]

    }

}