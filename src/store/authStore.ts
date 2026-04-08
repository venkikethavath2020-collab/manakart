import { defineStore } from "pinia";
import apiClient from "../service/axios";

const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null as { name: string; phone: string } | null,
  }),
  getters: {
    isLoggedIn: (state) =>
      state.isAuthenticated || localStorage.getItem("token") !== null,
    getUser: (state) =>
      state.user || JSON.parse(localStorage.getItem("user") || "null"),
  },
  actions: {
    async login(user: { phone: string; password: string }) {
      try {
        const response = await apiClient.post("/auth/login", user);
        if (!response.status || response.status !== 200) {
          throw new Error(`Error logging in: ${response.statusText}`);
        }
        const loggedInUser = response.data.user;
        const token = response.data.token;
        this.isAuthenticated = true;
        this.user = loggedInUser;
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        localStorage.setItem("token", token);
        return { success: true };
      } catch (error: any) {
        console.error("Login failed:", error);
        return {
          success: false,
          message: error.response.data.message || "Login failed",
        };
      }
    },

    async signUp(user: { name: string; phone: string; password: string }) {
      try {
        const response = await apiClient.post("/auth/signup", user);
        if (!response.status || response.status !== 201) {
          throw new Error(`Error registering user: ${response.statusText}`);
        }
        const registeredUser = response.data.user;
        this.isAuthenticated = true;
        this.user = registeredUser;
        this.login({ phone: user.phone, password: user.password });
        return { success: true };
      } catch (error: any) {
        console.error("Registration failed:", error);
        return {
          success: false,
          message: error.response.data.message || "Registration failed",
        };
      }
    },

    logout() {
      this.isAuthenticated = false;
      this.user = null;
      localStorage.clear();
    },

    async resetPassword(data: { phone: string; newPassword: string }) {
      try {
        const response = await apiClient.post("/auth/reset-password", data);
        if (!response.status || response.status !== 200) {
          throw new Error(`Error resetting password: ${response.statusText}`);
        }
        return { success: true, message: response.data.message };
      } catch (error: any) {
        console.error("Password reset failed:", error);
        return {
          success: false,
          message: error.response.data.message || "Password reset failed",
        };
      }
    },
  },
});

export default useAuthStore;
