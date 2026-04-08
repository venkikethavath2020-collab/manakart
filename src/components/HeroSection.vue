<template>
<section
  class="relative flex items-end overflow-hidden
         rounded-b-[2rem] bg-slate-900 text-white"
>
  <!-- Background -->
  <div class="absolute inset-0">
    <img
      :src="HERO_BACKGROUND.image"
      :alt="HERO_BACKGROUND.alt"
      class="h-full w-full object-cover"
    />
  </div>

  <!-- Gradient -->
  <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/30" />

  <!-- Content -->
  <div
    class="relative z-10 mx-auto w-full max-w-6xl
           px-5 py-16 sm:py-20 lg:py-24"
  >
    <!-- Badge -->
    <span
      class="inline-flex items-center gap-2 rounded-full
             bg-gradient-to-r from-lime-400 to-green-400
             px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900"
    >
      {{ HERO_BADGE.text }}
    </span>

    <!-- Heading -->
    <div class="mt-4 space-y-3">
      <h1 class="font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
        <span
          class="block bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400
                 bg-clip-text text-transparent"
        >
          {{ HERO_TITLE.brand }}
        </span>

        <span
          class="bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400
                 bg-clip-text text-transparent"
        >
          {{ HERO_TITLE.tagline }}
        </span>
      </h1>

      <p class="max-w-xl text-sm sm:text-base text-white/85">
        {{ HERO_DESCRIPTION.text }}
        <span class="font-semibold text-lime-300">
          {{ HERO_DESCRIPTION.highlight }}
        </span>
      </p>
    </div>

    <!-- CTA -->
    <div class="mt-6 flex flex-wrap gap-3">
      <button
        class="rounded-xl bg-gradient-to-r from-lime-500 to-green-600
               px-6 py-3 text-sm sm:text-base font-bold text-white shadow-lg"
        @click="emit('order')"
      >
        {{ HERO_PRIMARY_CTA.label }}
      </button>

      <button
        class="rounded-xl border border-white/30
               bg-white/10 px-6 py-3 text-sm sm:text-base font-semibold
               backdrop-blur-sm"
        @click="scrollToProducts"
      >
        {{ HERO_SECONDARY_CTA.label }}
      </button>
    </div>

    <!-- Trust -->
    <div class="mt-5 flex flex-wrap gap-2 text-xs sm:text-sm text-white/80">
      <div
        v-for="item in HERO_TRUST_POINTS"
        :key="item"
        class="rounded-full bg-white/10 px-3 py-1.5"
      >
        {{ item }}
      </div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import {
  HERO_BACKGROUND,
  HERO_BADGE,
  HERO_TITLE,
  HERO_DESCRIPTION,
  HERO_PRIMARY_CTA,
  HERO_SECONDARY_CTA,
  HERO_TRUST_POINTS,
} from '../constants/heroContent'

const emit = defineEmits<{
  (e: 'order'): void
}>()

const scrollToProducts = () => {
  const el = document.querySelector('main')
  el?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-22px); }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float-delayed 7s ease-in-out infinite;
}
.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}
</style>
