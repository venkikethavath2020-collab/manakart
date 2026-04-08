<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import useAuthStore from "../store/authStore";
import AdminPanel from "../components/AdminPanel.vue";
import { useFruitsStore } from "../store/fruitsStore";
import AuthModal from "../components/Auth/AuthModal.vue";

const router = useRouter();
const authStore = useAuthStore();
const fruitStore = useFruitsStore();

const showAuthModal = ref(false);

const isAdmin = computed(() => authStore.isLoggedIn && authStore.isAdmin);
const isLoggedIn = computed(() => authStore.isLoggedIn);
const isNonAdmin = computed(() => authStore.isLoggedIn && !authStore.isAdmin);

onMounted(async () => {
  if (isAdmin.value) {
    await fruitStore.fetchFruits();
  }
});

const goHome = () => {
  router.push("/");
};

const logout = () => {
  authStore.logout();
  router.push("/");
};

const openLogin = () => {
  showAuthModal.value = true;
};
</script>

<template>
  <!-- NOT LOGGED IN -->
  <div
    v-if="!isLoggedIn"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
  >
    <div
      class="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
    >
      <h2 class="text-center text-2xl font-bold text-white">
        Admin Access
      </h2>
      <p class="mt-2 text-center text-sm text-slate-400">
        Login with your admin account to continue
      </p>

      <button
        class="mt-6 w-full rounded-xl bg-lime-500 px-4 py-3 font-semibold text-slate-900 hover:bg-lime-400"
        @click="openLogin"
      >
        Login
      </button>

      <button
        class="mt-3 w-full rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
        @click="goHome"
      >
        &larr; Back to Store
      </button>
    </div>

    <AuthModal :model-value="showAuthModal" @update:model-value="showAuthModal = false" />
  </div>

  <!-- LOGGED IN BUT NOT ADMIN -->
  <div
    v-else-if="isNonAdmin"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
  >
    <div
      class="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-center"
    >
      <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-3xl">🔒</span>
      </div>
      <h2 class="text-xl font-bold text-white">Access Denied</h2>
      <p class="mt-2 text-sm text-slate-400">
        Your account does not have admin privileges.
      </p>

      <button
        class="mt-6 w-full rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
        @click="goHome"
      >
        &larr; Back to Store
      </button>
    </div>
  </div>

  <!-- ADMIN PANEL -->
  <div v-else class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
    <div class="mx-auto max-w-7xl space-y-4">
      <div class="flex justify-between items-center">
        <button
          class="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm"
          @click="goHome"
        >
          &larr; Back to Store
        </button>

        <button
          class="rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 shadow-sm"
          @click="logout"
        >
          Logout
        </button>
      </div>

      <AdminPanel />
    </div>
  </div>
</template>
