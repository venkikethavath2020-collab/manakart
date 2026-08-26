import { createRouter, createWebHistory } from "vue-router";
import Landing from "../views/Landing.vue";
import useAuthStore from "../store/authStore.ts"; 

const router = createRouter({
  history: createWebHistory(),

  routes: [
    // Public
    {
      path: "/",
      name: "landing",
      component: Landing,
    },

    // Public
    {
      path: "/products",
      name: "products",
      component: () => import("../views/Products.vue"),
    },

    // Customer account
    {
      path: "/profile",
      name: "profile",
      component: () => import("../components/Profile/Profile.vue"),
      meta: {
        requiresAuth: true,
      },
    },

    // Admin dashboard
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/Admin.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },

    // Legacy
    {
      path: "/home",
      redirect: "/products",
    },
    {
      path: "/rider",
      name: "rider",
      component: () => import("../views/Rider.vue"),
    },
  ],

  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  // Authentication required
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return {
      name: "landing",
    };
  }

  // Admin required
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return {
      name: "products",
    };
  }

  return true;
});

export default router;