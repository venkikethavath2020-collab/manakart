<template>
  <div class="min-h-screen bg-gradient-to-br from-lime-50 via-white to-orange-50">
    <div class="absolute top-5 right-6 z-20">
      <ProfileMenu />
    </div>
    <div class="relative">
      <HeroSection @order="openCart" />

      <main class="mx-auto max-w-7xl px-5 pb-32 pt-14 sm:px-8 space-y-20">
        <!-- PRODUCTS -->
        <section class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h3 class="section-title">{{ PRODUCT_SECTION.title }}</h3>
              <p class="text-slate-600 text-sm">
                {{ PRODUCT_SECTION.subtitle }}
              </p>
            </div>

            <div class="pill-light">
              <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              {{ availableFruits.length }} varieties available
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <template v-if="fruitsStore.isLoading">
              <div
                v-for="n in 8"
                :key="n"
                class="animate-pulse rounded-3xl border border-slate-200 bg-white p-4 shadow-soft"
              >
                <div class="h-32 w-full rounded-xl bg-slate-200 mb-4"></div>

                <div class="h-4 w-2/3 rounded bg-slate-200 mb-3"></div>
                <div class="h-3 w-1/2 rounded bg-slate-200 mb-4"></div>

                <div class="h-8 w-full rounded-xl bg-slate-200"></div>
              </div>
            </template>

            <template v-else>
              <ProductCard
                v-for="fruit in availableFruits"
                :key="fruit.id"
                :fruit="fruit"
              />
            </template>
          </div>
        </section>

        <section class="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white text-center">
          <h3 class="font-display text-slate-200 text-3xl mb-3">
            {{ TRUST_STATS.title }}
          </h3>
          <p class="text-slate-300 text-sm mb-8">
            {{ TRUST_STATS.subtitle }}
          </p>

          <div class="grid gap-6 sm:grid-cols-3">
            <div
              v-for="stat in TRUST_STATS.stats"
              :key="stat.label"
              class="mini-card bg-slate-800 ring-slate-700"
            >
              <p class="text-4xl font-bold" :class="stat.color">
                {{ stat.value }}
              </p>
              <p class="text-xs text-slate-400">
                {{ stat.label }}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <StickyCartBar @open="openCart" />
      <CartDrawer
        v-if="isCartOpen"
        :open="isCartOpen"
        :whatsapp-number="APP_CONTACT.whatsappNumber"
        @close="closeCart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import HeroSection from "../components/HeroSection.vue";
import ProductCard from "../components/ProductCard.vue";
import CartDrawer from "../components/CartDrawer.vue";
import StickyCartBar from "../components/StickyCartBar.vue";
import Footer from "../components/Footer.vue";
import ProfileMenu from "../components/Profile/ProfileMenu.vue";
import { APP_CONTACT, PRODUCT_SECTION, TRUST_STATS } from "../constants/appContent";
import { useFruitsStore } from "../store/fruitsStore";

const isCartOpen = ref(false);
const fruitsStore = useFruitsStore();

const availableFruits = computed<any>(() =>
  fruitsStore.fruits.filter((fruit) => fruit.available)
);

const openCart = () => (isCartOpen.value = true);
const closeCart = () => (isCartOpen.value = false);

const fruits = ref<{ [x: string]: any; id: string }[]>([]);

onMounted(async () => {
  await fruitsStore.fetchFruits();
  fruits.value = fruitsStore.getFruits;
});
</script>

<style scoped>
.pill {
  @apply inline-flex items-center gap-2 rounded-full
  bg-lime-100 px-4 py-1.5 text-sm font-semibold
  text-lime-700 ring-1 ring-lime-300/50;
}

.pill-light {
  @apply inline-flex items-center gap-2 rounded-full
  bg-white px-4 py-2 text-sm text-slate-700
  ring-1 ring-slate-200;
}

.info-box {
  @apply flex items-center gap-2 rounded-xl
  bg-white px-4 py-3 text-slate-700
  ring-1 ring-slate-200;
}

.mini-card {
  @apply rounded-2xl px-5 py-4 text-sm
  text-slate-300 text-center ring-1;
}

.section-title {
  @apply font-display text-3xl text-slate-900;
}

.shadow-soft {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
</style>
