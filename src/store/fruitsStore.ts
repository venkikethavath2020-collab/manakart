import { defineStore } from "pinia";
import apiClient from "../service/axios";
import type { CartItem, Category, Product, ProductVariant } from "../types/catalog";

export const useFruitsStore = defineStore("products", {
  state: () => ({ fruits: [] as Product[], categories: [] as Category[], loading: false, error: null as string | null, cartItems: [] as CartItem[], userOrders: [] as any[], userAddresses: [] as any[] }),
  getters: {
    products: (state) => state.fruits,
    getFruitById: (state) => (id: string) => state.fruits.find((product) => product.id === id),
    getFruits: (state) => state.fruits,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    cartItemCount: (state) => state.cartItems.reduce((total, item) => total + item.quantity, 0),
    cartTotalPrice: (state) => state.cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    getUserDefaulatAddress: (state) => state.userAddresses.find((address) => address.is_default) ?? null,
    getUserAddresses: (state) => state.userAddresses,
  },
  actions: {
    async request(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: unknown) {
      this.loading = true; this.error = null;
      try { const response = method === 'get' || method === 'delete' ? await apiClient[method](url) : await apiClient[method](url, data); return response.data.data; }
      catch (error: any) {
        this.error = error?.response?.data?.error || error?.response?.data?.message || (error instanceof Error ? error.message : String(error));
        throw new Error(this.error || 'Request failed');
      }
      finally { this.loading = false; }
    },
    async fetchFruits() { this.fruits = await this.request('get', '/products'); },
    async fetchCategories() { this.categories = await this.request('get', '/products/categories'); },
    async addFruit(product: Record<string, unknown>) { const created = await this.request('post', '/products', product) as Product; this.fruits.unshift(created); return created; },
    async updateFruit(id: string, product: Record<string, unknown>) { const updated = await this.request('put', `/products/${id}`, product) as Product; const index = this.fruits.findIndex((item) => item.id === id); if (index >= 0) this.fruits[index] = updated; return updated; },
    async deleteFruit(id: string) { await this.request('delete', `/products/${id}`); this.fruits = this.fruits.filter((product) => product.id !== id); },
    async createOrder(orderData: { address_id: string; items: CartItem[] }) { this.loading = true; try { return await apiClient.post('/orders/create', orderData); } finally { this.loading = false; } },
    async fetchOrders() { this.userOrders = (await apiClient.get('/orders')).data; },
    findCartItemIndex(productId: string, variantId: string) { return this.cartItems.findIndex((item) => item.productId === productId && item.variantId === variantId); },
    addToCart(product: Product, variant: ProductVariant, quantity: number) {
      const index = this.findCartItemIndex(product.id, variant.id);
      if (index >= 0) { this.cartItems[index]!.quantity += quantity; return; }
      this.cartItems.push({ productId: product.id, variantId: variant.id, productName: product.name, variantLabel: variant.unit_label, unitPrice: variant.price, imageUrl: product.image_url, quantity });
    },
    updateCartQuantity(productId: string, variantId: string, delta: number) { const index = this.findCartItemIndex(productId, variantId); if (index < 0) return; const item = this.cartItems[index]!; const quantity = item.quantity + delta; if (quantity <= 0) this.cartItems.splice(index, 1); else item.quantity = quantity; },
    removeFromCart(productId: string, variantId: string) { const index = this.findCartItemIndex(productId, variantId); if (index >= 0) this.cartItems.splice(index, 1); },
    clearCart() { this.cartItems = []; },
    async fetchDefaultAddress() { await this.fetchAddresses(); },
    async fetchAddresses() { this.userAddresses = (await apiClient.get('/users/addresses')).data; },
    async createAddress(data: any) { const response = await apiClient.post('/users/addresses', data); await this.fetchAddresses(); return response; },
    async updateAddress(id: string, data: any) { const response = await apiClient.put(`/users/addresses/${id}`, data); await this.fetchAddresses(); return response; },
    async deleteAddress(id: string) { await apiClient.delete(`/users/addresses/${id}`); await this.fetchAddresses(); },
  },
});
