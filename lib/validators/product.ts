import { z } from 'zod'

export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  subtitle: z.string().max(255).optional(),
  authors: z.array(z.string()).min(1, 'At least one author is required'),
  publisher: z.string().max(255).optional(),
  publishYear: z.number().int().min(1).max(new Date().getFullYear() + 1).optional(),
  edition: z.string().max(50).optional(),
  language: z.string().default('en'),
  isbn10: z.string().length(10).optional(),
  isbn13: z.string().length(13).optional(),

  binding: z.enum(['HARDCOVER', 'PAPERBACK', 'LEATHER', 'SPIRAL']),
  condition: z.enum(['NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE']).default('NEW'),
  pageCount: z.number().int().positive().optional(),

  weightOz: z.number().positive('Weight must be positive'),
  lengthIn: z.number().positive('Length must be positive'),
  widthIn: z.number().positive('Width must be positive'),
  heightIn: z.number().positive('Height must be positive'),

  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  lowStockThreshold: z.number().int().positive().default(5),

  description: z.string().min(10, 'Description must be at least 10 characters'),
  tableOfContents: z.string().optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),

  topics: z.array(z.string()).default([]),
  subjects: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),

  metaDescription: z.string().max(160).optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema.partial()

export type UpdateProductInput = z.infer<typeof updateProductSchema>

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  language: z.string().optional(),
  topics: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  condition: z.string().optional(),
  binding: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  inStock: z.boolean().optional(),
  state: z.string().length(2).optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'newest']).default('relevance'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(24),
})

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>
