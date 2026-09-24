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

    <main class="mx-auto max-w-5xl px-4 pt-4 sm:pt-6">
      <!-- PROMOTIONAL STRIP -->
      <div class="mb-4 flex items-center gap-2 overflow-x-auto rounded-2xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white shadow-sm sm:justify-center">
        <span class="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5"><Sparkles class="h-3.5 w-3.5 text-lime-300" /> Today’s fresh picks</span>
        <span class="hidden h-4 w-px bg-white/20 sm:block"></span>
        <span class="flex shrink-0 items-center gap-1.5 text-slate-200"><Truck class="h-3.5 w-3.5 text-lime-300" /> {{ beforeCutoff ? `Order by ${DELIVERY.cutoffLabel} for delivery today` : DELIVERY.afterCutoffLine }}</span>
      </div>

      <!-- SHOP INTRODUCTION -->
      <section class="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-lime-200 via-lime-100 to-emerald-50 px-5 py-6 sm:px-8 sm:py-8">
        <div class="absolute -right-6 -top-8 text-8xl opacity-20 sm:text-9xl">🍉</div>
        <div class="relative max-w-xl">
          <p class="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800"><span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span> Farm-fresh, delivered</p>
          <h1 class="font-display text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">Good food starts with <span class="text-emerald-700">better produce.</span></h1>
          <p class="mt-2 text-sm leading-6 text-slate-700">Browse handpicked fruits, vegetables and ready-to-eat chopped packs. Choose the size that works for you—we’ll bring it fresh to your door.</p>
          <div class="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700"><span class="rounded-xl bg-white/75 px-3 py-2"><ShieldCheck class="mr-1 inline h-3.5 w-3.5 text-emerald-700" /> Quality checked</span><span class="rounded-xl bg-white/75 px-3 py-2"><Clock class="mr-1 inline h-3.5 w-3.5 text-emerald-700" /> {{ DELIVERY.windowLabel }}</span></div>
        </div>
      </section>

      <!-- SECTION HEADER -->
      <div class="mb-3 flex items-end justify-between">
        <div><h2 class="font-display text-xl font-bold text-slate-900">Shop today’s market</h2><p class="mt-0.5 text-xs text-slate-500">{{ availableProducts.length }} fresh products available now</p></div>
        <span class="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-100 sm:inline-flex"><span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span> Live prices</span>
      </div>

      <!-- SEARCH -->
      <div class="relative mb-3">
        <Search
          class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products…"
          class="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
        />
      </div>

      <!-- CATEGORY TABS, DRIVEN BY BACKEND CATEGORIES -->
      <div v-if="!fruitsStore.isLoading">
        <div class="mb-5 flex gap-2 overflow-x-auto pb-1">
          <button v-for="group in categoryGroups" :key="group.category.id" type="button" class="shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-lime-300" :class="selectedCategoryId === group.category.id ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-lime-300 hover:text-slate-900'" @click="selectedCategoryId = group.category.id">{{ group.category.name }}</button>
        </div>
        <section v-if="activeCategoryGroup" class="rounded-3xl" :class="activeCategoryGroup.category.slug === 'freshly-chopped' ? 'bg-amber-50/70 p-3 sm:p-5' : ''">
          <div v-if="activeCategoryGroup.category.slug === 'freshly-chopped'" class="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-50 px-4 py-3">
            <div><p class="font-display text-lg font-bold text-amber-950">🍍 Freshly Chopped</p><p class="mt-0.5 text-xs text-amber-800">Washed, cut and ready to enjoy—choose your pack size.</p></div>
            <span class="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-amber-800">{{ activeCategoryGroup.products.length }} packs</span>
          </div>
          <div v-else class="mb-3 flex items-end justify-between"><div><h3 class="font-display text-lg font-bold text-slate-900">{{ activeCategoryGroup.category.name }}</h3><p class="mt-0.5 text-xs text-slate-500">{{ categoryDescription(activeCategoryGroup.category.slug) }}</p></div><span class="text-xs font-semibold text-slate-400">{{ activeCategoryGroup.products.length }} items</span></div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <ProductCard v-for="product in activeCategoryGroup.products" :key="product.id" :product="product" />
          </div>
        </section>
        <div v-else class="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center"><p class="text-3xl">🔎</p><p class="mt-3 font-semibold text-slate-800">No products found</p><p class="mt-1 text-sm text-slate-500">Try another product name or browse all categories.</p></div>
      </div>
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
import { Search, Home, Store, ShoppingCart, User, Sparkles, Truck, ShieldCheck, Clock } from "lucide-vue-next";
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
const selectedCategoryId = ref("");
const isCartOpen = ref(false);
const showAuth = ref(false);

const isLoggedIn = computed(() => authStore.isLoggedIn);
const itemCount = computed(() => fruitsStore.cartItemCount);

const availableProducts = computed(() => fruitsStore.fruits.filter((product) => product.available && product.variants.some((variant) => variant.available)));
const categoryDescription = (slug: string) => ({
  fruits: 'Whole fruits picked for everyday freshness.',
  vegetables: 'Kitchen essentials, fresh from the market.',
}[slug] || 'Fresh products for your doorstep.');
const categoryGroups = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const groups = new Map<string, { category: any; products: any[] }>();
  availableProducts.value.filter((product) => !q || product.name.toLowerCase().includes(q)).forEach((product) => {
    const key = product.category.id;
    if (!groups.has(key)) groups.set(key, { category: product.category, products: [] });
    groups.get(key)!.products.push(product);
  });
  return [...groups.values()];
});
const activeCategoryGroup = computed(() => categoryGroups.value.find((group) => group.category.id === selectedCategoryId.value) ?? categoryGroups.value[0]);

const openCart = () => (isCartOpen.value = true);
const closeCart = () => (isCartOpen.value = false);
const goLanding = () => router.push("/");
const goProfile = () => router.push("/profile");

onMounted(async () => {
  await fruitsStore.fetchFruits();
  selectedCategoryId.value = categoryGroups.value[0]?.category.id ?? "";
  await fruitsStore.fetchDefaultAddress();
});
</script>

<style scoped>
.nav-item {
  @apply flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold text-slate-500 transition active:scale-95;
}
</style>
