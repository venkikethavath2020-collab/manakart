<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ADMIN_PIN, ADMIN_SESSION_KEY } from "../constants/adminAuth";
import AdminPanel from "../components/AdminPanel.vue";
import { useFruitsStore } from "../store/fruitsStore";

const router = useRouter();

const enteredPin = ref("");
const error = ref("");
const isUnlocked = ref(false);
const fruitStore = useFruitsStore();

onMounted(async () => {
  isUnlocked.value = sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
});

const unlock = async () => {
  if (enteredPin.value === ADMIN_PIN) {
    isUnlocked.value = true;
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    error.value = "";
    await fruitStore.fetchFruits();
  } else {
    error.value = "Invalid PIN";
  }
};

const logout = () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  isUnlocked.value = false;
  enteredPin.value = "";
};

const goHome = () => {
  router.push("/");
};
</script>

<template>
  <!-- PIN GATE -->
  <div
    v-if="!isUnlocked"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
  >
    <div
      class="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
    >
      <h2 class="text-center text-2xl font-bold text-white">
        Admin Access
      </h2>
      <p class="mt-2 text-center text-sm text-slate-400">
        Enter PIN to continue
      </p>

      <input
        v-model="enteredPin"
        type="password"
        inputmode="numeric"
        maxlength="6"
        class="mt-6 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-center text-lg tracking-widest text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-400"
        placeholder="••••"
        @keyup.enter="unlock"
      />

      <p v-if="error" class="mt-3 text-center text-sm text-red-400">
        {{ error }}
      </p>

      <button
        class="mt-6 w-full rounded-xl bg-lime-500 px-4 py-3 font-semibold text-slate-900 hover:bg-lime-400"
        @click="unlock"
      >
        Unlock
      </button>

      <!-- Back Button -->
      <button
        class="mt-3 w-full rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
        @click="goHome"
      >
        ← Back to Store
      </button>
    </div>
  </div>

  <!-- ADMIN PANEL -->
  <div v-else class="space-y-4">
    <div class="flex justify-between items-center">
      <button
        class="rounded-full border border-slate-300 px-4 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        @click="goHome"
      >
        ← Back to Store
      </button>

      <button
        class="rounded-full border border-slate-300 px-4 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        @click="logout"
      >
        Lock Panel
      </button>
    </div>

    <AdminPanel />
  </div>
</template>