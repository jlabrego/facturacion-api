import {pool} from '../db/db.js'
export default class InvoicesModel {

   static createInvoice = async (invoice) => {

    await using conn = await pool.getConnection()

    try {

        await conn.beginTransaction()

     if (!invoice.user_id) {
    throw new Error("Usuario inválido")
    }
        
    if (!invoice.items || invoice.items.length === 0) {

    throw new Error("La factura debe contener al menos un producto")

    }
        let subtotal = 0

        // Guardar la información de los productos para no consultarlos dos veces
        const products = []
        // Validar productos y calcular subtotal
        for (const item of invoice.items) {

    if (item.quantity <= 0) {
        throw new Error(
            `La cantidad del producto ${item.product_id} debe ser mayor que cero`
        )
    }
   
    const [rows] = await conn.execute(
        `
        SELECT id, price, stock
        FROM products
        WHERE id = ?
        AND is_active = TRUE
        `,
        [item.product_id]
    )

    const product = rows[0]

    if (!product) {
        throw new Error(`El producto ${item.product_id} no existe`)
    }

    if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto ${item.product_id}`)
    }

            const lineSubtotal = product.price * item.quantity

            subtotal += lineSubtotal

            products.push({
                product_id: product.id,
                quantity: item.quantity,
                unit_price: product.price,
                subtotal: lineSubtotal
            })
        }

        const tax = Number((subtotal * 0.15).toFixed(2))
        const total = Number((subtotal + tax).toFixed(2))

        const invoiceNumber = `FAC-${Date.now()}`

        const [invoiceResult] = await conn.execute( `
        INSERT INTO invoices (invoice_number, user_id, customer_name, customer_rtn_id,
        subtotal, tax,total)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            invoiceNumber,
            invoice.user_id,
            invoice.customer_name,
            invoice.customer_rtn_id,
            subtotal,
            tax,
            total
        ])

        const invoiceId = invoiceResult.insertId
        // Insertar detalles y actualizar stock
        for (const product of products) {

            await conn.execute(
                `
                INSERT INTO invoice_details
                (invoice_id, product_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    invoiceId,
                    product.product_id,
                    product.quantity,
                    product.unit_price,
                    product.subtotal
                ]
            )

            await conn.execute(
                `
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                `,
                [
                    product.quantity,
                    product.product_id
                ]
            )
        }

        await conn.commit()

        return {
        invoiceId,
        invoiceNumber
    }

    } catch (e) {

        await conn.rollback()
        throw e

    }

}

    static getInvoices = async (user) => { 
       await using conn = await pool.getConnection()

       try{

            if(user.role === 'ADMIN') {
            const [rows] = await conn.execute(
                `SELECT i.id, i.invoice_number, i.customer_name, i.customer_rtn_id,
                        i.subtotal, i.tax, i.total, i.status,i.created_at,
                        u.email FROM invoices i
                INNER JOIN users u ON i.user_id = u.id
                ORDER BY i.created_at DESC
                `)
                return rows
            }

            const [rows] = await conn.execute(
            ` SELECT i.id, i.invoice_number, i.customer_name, i.customer_rtn_id,
                        i.subtotal, i.tax, i.total, i.status,i.created_at,
                        u.email FROM invoices i
            INNER JOIN users u
                ON i.user_id = u.id
            WHERE i.user_id = ?
            ORDER BY i.created_at DESC
            `,
            [user.id]
        )

        return rows
       }
       catch(e){
        throw e
       }
        
    }

    static getInvoiceById = async (id) => {

        await using conn = await pool.getConnection()

        try{

            const [invoiceRows] = await conn.execute(
            `SELECT id, invoice_number, customer_name, customer_rtn_id,
                    subtotal, tax, total, status, created_at, user_id
            FROM invoices
            WHERE id = ?`, [id])
        
        if (invoiceRows.length === 0) {
            return null
        }

         const [detailRows] = await conn.execute(
            `
            SELECT
                d.product_id,
                p.code,
                p.name,
                d.quantity,
                d.unit_price,
                d.subtotal
            FROM invoice_details d
            INNER JOIN products p
                ON d.product_id = p.id
            WHERE d.invoice_id = ?
            `,
            [id]
        )
        
        return {
            ...invoiceRows[0],
            items: detailRows
        }


        } catch(e){
            throw e
        }
    }

    static voidInvoice = async(id) => {
          await using conn = await pool.getConnection()
        
        try{
            await conn.beginTransaction()

            const [invoiceRows] = await conn.execute(
                ` SELECT id, status FROM invoices WHERE id = ?`, [id])
                
                if (invoiceRows.length === 0) {
                    throw new Error("Factura no encontrada")}

             const invoice = invoiceRows[0]

            if (invoice.status === 'VOIDED') {
            throw new Error("La factura ya fue anulada")
        }

        const [details] = await conn.execute(
            ` SELECT product_id, quantity FROM invoice_details
              WHERE invoice_id = ?`, [id])

            for (const item of details) {
                await conn.execute(
                    `UPDATE products SET stock = stock + ?
                     WHERE id = ?`,
                    [
                        item.quantity,
                        item.product_id
                    ]
                )
            }
            
            await conn.execute(
                    `UPDATE invoices SET status = 'VOIDED'
                    WHERE id = ? `, [id])

            await conn.commit()

            return {
                id,
                status: 'VOIDED'
            }

        } catch(e){
            await conn.rollback()
            throw e
        }
    }
}   
