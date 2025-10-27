import type { User, Vendor, Product, Order, OrderItem } from '@prisma/client'

// ============================================================================
// API Response Types
// ============================================================================

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

// ============================================================================
// Extended Types with Relations
// ============================================================================

export type VendorWithUser = Vendor & {
  user: User
}

export type ProductWithVendor = Product & {
  vendor: Vendor
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
    vendor: Vendor
  })[]
}

// ============================================================================
// Cart Types
// ============================================================================

export type CartItem = {
  productId: string
  quantity: number
  product: Product
}

export type Cart = {
  items: CartItem[]
  subtotal: number
  itemCount: number
}

// ============================================================================
// Checkout Types
// ============================================================================

export type ShippingAddress = {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
}

export type ShippingRate = {
  carrier: string
  service: string
  rate: number
  estimatedDays: number
  rateId: string
}

export type CheckoutData = {
  email: string
  phone?: string
  shippingAddress: ShippingAddress
  billingAddress: ShippingAddress
  selectedShippingRate: ShippingRate
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export type ProductFilters = {
  search?: string
  language?: string
  topics?: string[]
  subjects?: string[]
  condition?: string
  binding?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  state?: string
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest'
  page?: number
  limit?: number
}

// ============================================================================
// Analytics Types
// ============================================================================

export type DashboardStats = {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topProducts: Array<{
    id: string
    title: string
    sales: number
    revenue: number
  }>
}

export type VendorStats = {
  totalSales: number
  totalOrders: number
  pendingPayouts: number
  activeListings: number
}
