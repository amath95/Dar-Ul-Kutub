import { z } from 'zod'

export const shippingAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  line1: z.string().min(1, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2-letter code'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().default('US'),
})

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
})

export const checkoutSchema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+?1?\d{10,15}$/, 'Invalid phone number').optional(),
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema,
  items: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
  shippingRateId: z.string(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

export const validateCartSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
})

export type ValidateCartInput = z.infer<typeof validateCartSchema>
