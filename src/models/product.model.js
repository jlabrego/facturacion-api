import {pool} from '../db/db.js'

export default class ProductsModel {

    static getProducts = async () => {

        try{
            await using conn = await pool.getConnection();

            const[rows] = await conn.query(`SELECT 
                p.id,
                p.code,
                p.name,
                p.price,
                p.stock
                FROM products p
                 WHERE p.is_active = TRUE;
                `)
                return rows
        }
        catch(e)
    {
        throw e
    }
    }
    

    static createProduct = async (product) => {
        await using conn = await pool.getConnection();

        try{
            const [result] = await conn.execute(`
            INSERT INTO products (code, name, price, stock)
            VALUES (:code, :name, :price, :stock)`, product)


            return result.insertId
        
        }
        catch(e){
            throw e
        }
    }

    static updateStock = async ({ id, stock_to_add }) => {

        await using conn = await pool.getConnection()

        try{
            const [result] = await conn.execute(
                    `UPDATE products 
                    SET stock = stock + :stock_to_add 
                    WHERE id = :id
                    `,
                    {id, stock_to_add}
                )
            return result.affectedRows
        }
        catch(e){
            throw e
        }
    }

}