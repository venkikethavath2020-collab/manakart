// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  RESET_PASSWORD: "/auth/reset-password",

  // Products
  PRODUCTS: "/products",

  // Orders
  ORDERS: "/orders",
  CREATE_ORDER: "/orders/create",
  ALL_ORDERS: "/orders/all",

  // User
  PROFILE: "/users",
  ADDRESSES: "/users/addresses",

  // Admin - Notifications
  NOTIFICATIONS: "/notifications",
  UNREAD_COUNT: "/notifications/unread-count",
} as const;
