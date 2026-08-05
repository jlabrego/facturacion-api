import { z } from 'zod'

export const productSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().nonnegative()
})

export const updateStockSchema = z.object({
    stock_to_add: z.number().int().positive()
})