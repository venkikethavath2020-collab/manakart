<template>
  <div class="min-h-screen bg-white">
    <!-- TOP NAV -->
    <header
      class="sticky top-0 z-30 border-b border-slate-100 bg-white/85 backdrop-blur-md"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🍏</span>
          <span class="font-display text-lg font-extrabold text-slate-900">
            {{ HERO_TITLE.brand }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <CustomerNotifications v-if="isLoggedIn" />
          <ProfileMenu />
          <button
            class="rounded-full bg-gradient-to-r from-lime-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95"
            @click="goShop"
          >
            Shop
          </button>
        </div>
      </div>
    </header>

    <!-- HERO -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-lime-50 via-white to-orange-50"
    >
      <!-- floating fruit accents -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <span class="absolute right-[8%] top-[12%] text-5xl animate-float">🍎</span>
        <span class="absolute left-[6%] top-[30%] text-4xl animate-float-delayed">🍊</span>
        <span class="absolute right-[14%] bottom-[16%] text-6xl animate-float-slow">🥭</span>
        <span class="absolute left-[12%] bottom-[10%] text-4xl animate-float">🍇</span>
      </div>

      <div class="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <span
          class="inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-1.5 text-xs font-bold text-lime-700 ring-1 ring-lime-200"
        >
          {{ LANDING_HERO.badge }}
        </span>

        <h1 class="mx-auto mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight text-slate-900 sm:text-6xl">
          {{ LANDING_HERO.titleTop }}
          <span class="bg-gradient-to-r from-lime-600 via-green-600 to-emerald-600 bg-clip-text text-transparent">
            {{ LANDING_HERO.titleHighlight }}
          </span>
        </h1>

        <p class="mx-auto mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
          {{ LANDING_HERO.subtitle }}
        </p>

        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            class="w-full rounded-2xl bg-gradient-to-r from-lime-500 to-green-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95 sm:w-auto"
            @click="goShop"
          >
            {{ LANDING_HERO.primaryCta }} →
          </button>
          <button
            class="w-full rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
            @click="scrollTo('how')"
          >
            {{ LANDING_HERO.secondaryCta }}
          </button>
        </div>

        <div class="mt-8 flex flex-wrap justify-center gap-2">
          <span
            v-for="pill in LANDING_HERO.trustPills"
            :key="pill"
            class="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-100"
          >
            {{ pill }}
          </span>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="mx-auto max-w-6xl px-4 sm:px-6">
      <div
        class="-mt-8 grid grid-cols-2 gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-soft-lg sm:grid-cols-4 sm:gap-6 sm:p-8"
      >
        <div v-for="stat in LANDING_STATS" :key="stat.label" class="text-center">
          <p class="font-display text-2xl font-extrabold sm:text-4xl" :class="stat.color">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-xs text-slate-500 sm:text-sm">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div class="text-center">
        <h2 class="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          Why families choose us
        </h2>
        <p class="mx-auto mt-3 max-w-lg text-slate-600">
          Fresh, fair, and delivered fast — the way buying fruit should be.
        </p>
      </div>

      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="f in LANDING_FEATURES"
          :key="f.title"
          class="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-50 text-2xl">
            {{ f.icon }}
          </div>
          <h3 class="mt-4 font-display text-lg font-bold text-slate-900">{{ f.title }}</h3>
          <p class="mt-2 text-sm text-slate-600">{{ f.text }}</p>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section id="how" class="bg-slate-50 py-16 sm:py-24">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="text-center">
          <h2 class="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Fresh fruit in 3 easy steps
          </h2>
        </div>

        <div class="mt-12 grid gap-6 sm:grid-cols-3">
          <div v-for="s in LANDING_STEPS" :key="s.step" class="relative text-center">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-soft">
              {{ s.icon }}
            </div>
            <div class="mx-auto mt-4 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-lime-500 to-green-600 text-sm font-bold text-white">
              {{ s.step }}
            </div>
            <h3 class="mt-3 font-display text-lg font-bold text-slate-900">{{ s.title }}</h3>
            <p class="mx-auto mt-2 max-w-xs text-sm text-slate-600">{{ s.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div class="text-center">
        <h2 class="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          Loved by your neighbours
        </h2>
      </div>

      <div class="mt-10 grid gap-4 sm:grid-cols-3">
        <figure
          v-for="t in LANDING_TESTIMONIALS"
          :key="t.name"
          class="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft"
        >
          <div class="flex text-amber-400">
            <span v-for="n in 5" :key="n">★</span>
          </div>
          <blockquote class="mt-3 text-sm text-slate-700">"{{ t.text }}"</blockquote>
          <figcaption class="mt-4 flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-lime-50 text-xl">{{ t.avatar }}</span>
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ t.name }}</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div
        class="overflow-hidden rounded-3xl bg-gradient-to-br from-lime-500 to-green-600 px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16"
      >
        <h2 class="font-display text-3xl font-extrabold sm:text-4xl">{{ LANDING_CTA.title }}</h2>
        <p class="mx-auto mt-3 max-w-md text-white/90">{{ LANDING_CTA.subtitle }}</p>
        <button
          class="mt-8 rounded-2xl bg-white px-8 py-4 text-base font-bold text-green-700 shadow-lg transition hover:bg-lime-50 active:scale-95"
          @click="goShop"
        >
          {{ LANDING_CTA.button }} →
        </button>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import Footer from "../components/Footer.vue";
import ProfileMenu from "../components/Profile/ProfileMenu.vue";
import CustomerNotifications from "../components/CustomerNotifications.vue";
import useAuthStore from "../store/authStore";
import { HERO_TITLE } from "../constants/heroContent";
import {
  LANDING_HERO,
  LANDING_STATS,
  LANDING_FEATURES,
  LANDING_STEPS,
  LANDING_TESTIMONIALS,
  LANDING_CTA,
} from "../constants/landingContent";

const router = useRouter();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);

const goShop = () => router.push("/products");

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};
</script>
