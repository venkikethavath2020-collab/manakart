import { defineStore } from "pinia";
import apiClient from "../service/axios";

export const useFruitsStore = defineStore("fruits", {
  state: () => ({
    fruits: [] as Array<{ id: string; [key: string]: any }>,
    loading: false,
    error: null as string | null,
    units: [
      { label: "250g", grams: 250 },
      { label: "500g", grams: 500 },
      { label: "1kg", grams: 1000 },
    ],
    cartItems: [] as any[],
    userOrders: [] as any[],
    userAddresses: [] as any[],
  }),

  getters: {
    getFruitById: (state) => {
      return (id: string) => state.fruits.find((fruit) => fruit.id === id);
    },

    getFruits: (state) => state.fruits,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,

    cartItemCount: (state) => {
      return state.cartItems.reduce((total) => total + 1, 0);
    },

    cartTotalPrice: (state) => {
      const roundPrice = (value: number) => Math.round(value);

      const priceForUnit = (
        price_per_kg: number,
        grams: number,
        priceOverride?: number,
      ) => roundPrice(priceOverride ?? (price_per_kg * grams) / 1000);

      return state.cartItems.reduce((total, item) => {
        const fruit = state.fruits.find((f) => f.id === item.id);

        const unit = fruit?.units?.find((u: any) => u.grams === item.unitGrams);

        const currentPrice = fruit?.price_per_kg ?? item.pricePerKgAtAdd;

        const unitPrice = priceForUnit(
          currentPrice,
          item.unitGrams,
          unit?.price,
        );

        return total + unitPrice * item.quantity;
      }, 0);
    },

    getUserDefaulatAddress: (state) => {
      const defaultAddress =
        state.userAddresses.length > 0
          ? state.userAddresses.find((addr) => addr.is_default)
          : null;

      return defaultAddress;
    },

    getUserAddresses: (state) => {
      return state.userAddresses;
    },
  },

  actions: {
    async fetchFruits() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get("/products");

        if (!response.status || response.status !== 200) {
          throw new Error(`Error fetching fruits: ${response.statusText}`);
        }

        this.fruits = response.data.data.map((x: any) => ({
          ...x,
          units: this.units,
        }));
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
      } finally {
        this.loading = false;
      }
    },

    async addFruit(fruitData: any) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post("/products", fruitData);

        if (!response.status || response.status !== 201) {
          throw new Error(`Error adding fruit: ${response.statusText}`);
        }

        this.fruits.unshift({
          ...response.data.data,
          units: this.units,
        });
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
      } finally {
        this.loading = false;
      }
    },

    async updateFruit(id: string, fruitData: any) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put(`/products/${id}`, fruitData);

        if (!response.status || response.status !== 200) {
          throw new Error(`Error updating fruit: ${response.statusText}`);
        }

        const index = this.fruits.findIndex((fruit) => fruit.id === id);

        if (index !== -1) {
          this.fruits[index] = {
            ...response.data.data,
            units: this.units,
          };
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
      } finally {
        this.loading = false;
      }
    },

    async deleteFruit(id: string) {
      this.loading = true;
      try {
        const response = await apiClient.delete(`/products/${id}`);

        if (!response.status || response.status !== 200) {
          throw new Error(`Error deleting fruit: ${response.statusText}`);
        }

        this.fruits = this.fruits.filter((fruit) => fruit.id !== id);
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
      } finally {
        this.loading = false;
      }
    },

    async createOrder(orderData: any) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post("/orders/create", orderData);
        if (!response.status || response.status !== 201) {
          throw new Error(`Error creating order: ${response.statusText}`);
        }
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get("/orders");
        if (!response.status || response.status !== 200) {
          throw new Error(`Error fetching orders: ${response.statusText}`);
        } else {
          this.userOrders = response.data;
          return response;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // CART ACTIONS

    findCartItemIndex(id: string, unitGrams: number) {
      return this.cartItems.findIndex(
        (item) => item.id === id && item.unitGrams === unitGrams,
      );
    },

    addToCart(fruit: any, unit: any, quantity: number) {
      const index = this.findCartItemIndex(fruit.id, unit.grams);

      if (index >= 0) {
        this.cartItems[index].quantity += quantity;
        return;
      }

      this.cartItems.push({
        id: fruit.id,
        name: fruit.name,
        unitLabel: unit.label,
        unitGrams: unit.grams,
        pricePerKgAtAdd: fruit.price_per_kg,
        quantity,
      });
    },

    updateCartQuantity(id: string, unitGrams: number, delta: number) {
      const index = this.findCartItemIndex(id, unitGrams);
      if (index === -1) return;
      const nextQuantity = this.cartItems[index].quantity + delta;
      if (nextQuantity <= 0) {
        this.cartItems.splice(index, 1);
        return;
      }
      this.cartItems[index].quantity = nextQuantity;
    },

    removeFromCart(id: string, unitGrams: number) {
      const index = this.findCartItemIndex(id, unitGrams);

      if (index >= 0) {
        this.cartItems.splice(index, 1);
      }
    },

    clearCart() {
      this.cartItems = [];
    },

    async fetchDefaultAddress() {
      await this.fetchAddresses();
    },

    async fetchAddresses() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get("/users/addresses");
        if (!response.status || response.status !== 200) {
          throw new Error(`Error fetching addresses: ${response.statusText}`);
        }
        this.userAddresses = response.data;
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createAddress(addressData: any) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post("/users/addresses", addressData);
        if (!response.status || response.status !== 201) {
          throw new Error(`Error creating address: ${response.statusText}`);
        }
        await this.fetchDefaultAddress();
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateAddress(id: string, addressData: any) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put(
          `/users/addresses/${id}`,
          addressData,
        );
        if (!response.status || response.status !== 200) {
          throw new Error(`Error updating address: ${response.statusText}`);
        }
        await this.fetchDefaultAddress();
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteAddress(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/users/addresses/${id}`);
        await this.fetchDefaultAddress();
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
