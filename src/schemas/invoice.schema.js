import { z } from "zod";

export const invoiceSchema = z.object({
    customer_name: z.string().min(1, "El nombre del cliente es obligatorio"),
    customer_rtn_id: z.string().min(2).default("CF"),
    items: z.array(
        z.object({
            product_id: z.number().int().positive(),
            quantity: z.number().int().positive()
        })
    ).min(1, "Debe incluir al menos un producto")
});
