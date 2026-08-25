<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <!-- MOBILE-APP TOP BAR -->
    <header
      class="sticky top-0 z-30 border-b border-green-100 bg-green-50/95 backdrop-blur-md"
    >
      <div class="mx-auto max-w-5xl px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <button class="flex items-center gap-1.5" @click="goLanding">
            <span class="text-xl">🍏</span>
            <span class="font-display text-base font-extrabold text-slate-900"
              >Manakart</span
            >
          </button>

          <div class="flex items-center gap-2">
            <CustomerNotifications v-if="isLoggedIn" />
            <ProfileMenu @show-auth="showAuth = true" />
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 pt-5">
      <!-- HERO STRIP -->
      <!-- <div class="mb-5 overflow-hidden rounded-3xl bg-gradient-to-r from-lime-500 to-green-600 px-5 py-6 text-white shadow-soft-lg">
        <p class="text-xs font-semibold uppercase tracking-wide text-white/80">Fresh today</p>
        <h1 class="mt-1 font-display text-2xl font-extrabold">Market-fresh fruits 🥭</h1>
        <p class="mt-1 text-sm text-white/90">{{ deliveryLine }} · Pay on delivery</p>
      </div> -->

      <!-- DELIVERY WINDOW NOTICE -->
      <div
        class="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
      >
        <span class="text-lg">⏰</span>
        <div class="text-sm">
          <p class="font-semibold text-amber-800">
            {{ beforeCutoff ? "Order now for tonight" : "Cutoff passed for today" }}
          </p>
          <p class="text-amber-700">
            {{
              beforeCutoff
                ? `Order before ${DELIVERY.cutoffLabel} and we deliver this evening, ${DELIVERY.windowLabel}.`
                : DELIVERY.afterCutoffLine
            }}
          </p>
        </div>
      </div>

      <!-- SECTION HEADER -->
      <div class="mb-3 flex items-end justify-between">
        <div>
          <h2 class="font-display text-xl font-bold text-slate-900">All Fruits</h2>
          <p class="text-xs text-slate-500">{{ displayedFruits.length }} available now</p>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-100"
        >
          <span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
          Live prices
        </span>
      </div>

      <!-- SEARCH -->
      <div class="relative mb-3">
        <Search
          class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search fresh fruits…"
          class="w-full rounded-2xl border border-slate-400 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-200"
        />
      </div>

      <!-- GRID -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <template v-if="fruitsStore.isLoading">
          <div
            v-for="n in 8"
            :key="n"
            class="animate-pulse rounded-3xl border border-slate-200 bg-white p-4"
          >
            <div class="mb-4 h-28 w-full rounded-xl bg-slate-200"></div>
            <div class="mb-3 h-4 w-2/3 rounded bg-slate-200"></div>
            <div class="mb-4 h-3 w-1/2 rounded bg-slate-200"></div>
            <div class="h-8 w-full rounded-xl bg-slate-200"></div>
          </div>
        </template>

        <template v-else>
          <ProductCard v-for="fruit in displayedFruits" :key="fruit.id" :fruit="fruit" />

          <div
            v-if="!displayedFruits.length"
            class="col-span-full py-16 text-center text-slate-500"
          >
            <p class="text-4xl">🔍</p>
            <p class="mt-2 font-medium">No fruits match "{{ searchQuery }}"</p>
            <p class="mt-1 text-xs">Try a different search</p>
          </div>
        </template>
      </div>
    </main>

    <!-- MOBILE BOTTOM NAV -->
    <nav
      class="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-100 bg-green-50/95 backdrop-blur-md"
    >
      <div class="mx-auto flex max-w-5xl items-center justify-around px-2 py-2">
        <button class="nav-item" @click="goLanding">
          <Home class="h-5 w-5" />
          <span>Home</span>
        </button>

        <button class="nav-item text-lime-600">
          <Store class="h-5 w-5" />
          <span>Shop</span>
        </button>

        <button class="nav-item" @click="openCart">
          <span class="relative">
            <ShoppingCart class="h-5 w-5" />

            <span
              v-if="itemCount > 0"
              class="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-mango-500 px-1 text-[10px] font-bold leading-none text-white"
            >
              {{ itemCount }}
            </span>
          </span>

          <span>Cart</span>
        </button>

        <button class="nav-item" @click="goProfile">
          <User class="h-5 w-5" />
          <span>Account</span>
        </button>
      </div>
    </nav>

    <CartDrawer v-if="isCartOpen" :open="isCartOpen" @close="closeCart" />
    <AuthModal :model-value="showAuth" @update:model-value="showAuth = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Search, Home, Store, ShoppingCart, User } from "lucide-vue-next";
import ProductCard from "../components/ProductCard.vue";
import CartDrawer from "../components/CartDrawer.vue";
import ProfileMenu from "../components/Profile/ProfileMenu.vue";
import CustomerNotifications from "../components/CustomerNotifications.vue";
import { useFruitsStore } from "../store/fruitsStore";
import useAuthStore from "../store/authStore";
import { DELIVERY } from "../constants/delivery";
import AuthModal from "../components/Auth/AuthModal.vue";

const router = useRouter();
const fruitsStore = useFruitsStore();
const authStore = useAuthStore();

const now = new Date();
const beforeCutoff = now.getHours() < DELIVERY.cutoffHour;

const searchQuery = ref("");
const isCartOpen = ref(false);
const showAuth = ref(false);

const isLoggedIn = computed(() => authStore.isLoggedIn);
const itemCount = computed(() => fruitsStore.cartItemCount);

const availableFruits = computed<any>(() =>
  fruitsStore.fruits.filter((fruit) => fruit.available)
);

const displayedFruits = computed(() => {
  if (!searchQuery.value.trim()) return availableFruits.value;
  const q = searchQuery.value.toLowerCase().trim();
  return availableFruits.value.filter((fruit: any) =>
    fruit.name.toLowerCase().includes(q)
  );
});

const openCart = () => (isCartOpen.value = true);
const closeCart = () => (isCartOpen.value = false);
const goLanding = () => router.push("/");
const goProfile = () => router.push("/profile");

onMounted(async () => {
  await fruitsStore.fetchFruits();
  await fruitsStore.fetchDefaultAddress();
});
</script>

<style scoped>
.nav-item {
  @apply flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold text-slate-500 transition active:scale-95;
}
</style>
