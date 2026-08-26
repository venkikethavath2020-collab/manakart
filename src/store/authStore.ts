import { defineStore } from "pinia";
import apiClient from "../service/axios";
import router from "../router";

interface User {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
}

const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null as User | null,
  }),

  getters: {
    isLoggedIn: (state) =>
      state.isAuthenticated || localStorage.getItem("token") !== null,

    getUser: (state) =>
      state.user || JSON.parse(localStorage.getItem("user") || "null"),

    isAdmin(): boolean {
      const user = this.getUser;
      return user?.role === "admin";
    },
  },

  actions: {
    /* ==========================================
       LOGIN
    ========================================== */

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

        return {
          success: true,
          user: loggedInUser,
        };
      } catch (error: any) {
        console.error("Login failed:", error);

        return {
          success: false,
          message: error.response?.data?.message || "Login failed",
        };
      }
    },

    /* ==========================================
       SIGNUP
    ========================================== */

    async signUp(user: {
      name: string;
      phone: string;
      email: string;
      password: string;
    }) {
      try {
        const response = await apiClient.post("/auth/signup", user);

        if (!response.status || response.status !== 201) {
          throw new Error(`Error registering user: ${response.statusText}`);
        }

        // Auto-login after signup
        const loginResult = await this.login({
          phone: user.phone,
          password: user.password,
        });

        return loginResult;
      } catch (error: any) {
        console.error("Registration failed:", error);

        return {
          success: false,
          message: error.response?.data?.message || "Registration failed",
        };
      }
    },

    /* ==========================================
       REQUEST PASSWORD RESET OTP
    ========================================== */

    async requestPasswordResetOtp(email: string) {
      try {
        const response = await apiClient.post("/auth/forgot-password", {
          email,
        });

        if (!response.status || response.status !== 200) {
          throw new Error(`Error requesting OTP: ${response.statusText}`);
        }

        return {
          success: true,
          message: response.data.message,
        };
      } catch (error: any) {
        console.error("Password reset OTP request failed:", error);

        return {
          success: false,
          message: error.response?.data?.message || "Unable to send OTP",
        };
      }
    },

    /* ==========================================
       VERIFY PASSWORD RESET OTP
    ========================================== */

    async verifyPasswordResetOtp(data: { email: string; otp: string }) {
      try {
        const response = await apiClient.post("/auth/verify-reset-otp", data);

        if (!response.status || response.status !== 200) {
          throw new Error(`Error verifying OTP: ${response.statusText}`);
        }

        return {
          success: true,
          message: response.data.message,
          resetToken: response.data.resetToken,
        };
      } catch (error: any) {
        console.error("OTP verification failed:", error);

        return {
          success: false,
          message: error.response?.data?.message || "Unable to verify OTP",
        };
      }
    },

    /* ==========================================
       RESET PASSWORD
    ========================================== */

    async resetPassword(data: { resetToken: string; newPassword: string }) {
      try {
        const response = await apiClient.post("/auth/reset-password", data);

        if (!response.status || response.status !== 200) {
          throw new Error(`Error resetting password: ${response.statusText}`);
        }

        return {
          success: true,
          message: response.data.message,
        };
      } catch (error: any) {
        console.error("Password reset failed:", error);

        return {
          success: false,
          message: error.response?.data?.message || "Password reset failed",
        };
      }
    },

    /* ==========================================
       LOGOUT
    ========================================== */

    logout() {
      this.isAuthenticated = false;
      this.user = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push('/')
    },
  },
});

export default useAuthStore;
