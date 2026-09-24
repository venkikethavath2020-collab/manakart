export type Category = { id: string; name: string; slug: string; description?: string; image_url?: string; available?: boolean; sort_order?: number };
export type ProductVariant = { id: string; product_id: string; unit_type: 'weight' | 'count' | 'bunch' | 'packet' | 'volume'; unit_quantity: number; unit_label: string; price: number; available: boolean; sort_order: number };
export type Product = { id: string; category_id: string; category: Category; name: string; slug: string; description?: string; image_url?: string; available: boolean; sort_order: number; variants: ProductVariant[] };
export type CartItem = { productId: string; variantId: string; productName: string; variantLabel: string; unitPrice: number; imageUrl?: string; quantity: number };

