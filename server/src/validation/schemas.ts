import { z } from 'zod';

const requiredText = (max: number) => z.string().trim().min(1, 'Required').max(max);

export const productInputSchema = z.object({
    name: requiredText(100),
    description: z.string().trim().max(1000).default(''),
    price: z
        .number()
        .nonnegative()
        .max(1_000_000)
        .transform(price => Math.round(price * 100) / 100),
    stock: z.number().int().nonnegative().max(1_000_000),
});

export const placeOrderSchema = z.object({
    items: z
        .array(
            z.object({
                productId: z.string().min(1).max(100),
                quantity: z.number().int().positive().max(1000),
            })
        )
        .min(1)
        .max(100),
    customerDetails: z.object({
        name: requiredText(100),
        address: requiredText(300),
    }),
});

export const loginSchema = z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(200),
});

export const clientMessageSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('auth'), token: z.string().min(1).max(4096) }),
    z.object({ type: z.literal('deauth') }),
]);
