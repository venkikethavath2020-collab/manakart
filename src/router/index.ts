import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Marketing landing page
    { path: '/', name: 'landing', component: Landing },

    // Customer shopping app (mobile-first)
    { path: '/products', name: 'products', component: () => import('../views/Products.vue') },

    // Customer account
    { path: '/profile', name: 'profile', component: () => import('../components/Profile/Profile.vue') },

    // Admin dashboard
    { path: '/admin', name: 'admin', component: () => import('../views/Admin.vue') },

    // Legacy /home -> products
    { path: '/home', redirect: '/products' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
