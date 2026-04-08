<script setup lang="ts">
import { computed } from 'vue';
import { useFruitsStore } from '../store/fruitsStore';

const emit = defineEmits<{
  (e: 'open'): void
}>()

const fruitStore  = useFruitsStore()
const itemCount = computed(() => fruitStore.cartItemCount)
</script>

<template>
  <button
    v-if="itemCount > 0"
    type="button"
    class="fixed bottom-5 right-5 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow-soft transition hover:bg-slate-800 active:scale-[0.98] sm:h-20 sm:w-20"
    @click="emit('open')"
  >
    <span class="absolute -top-2 -right-2 rounded-full bg-mango-500 px-2 py-1 text-xs font-semibold">
      {{ itemCount }}
    </span>
    <svg
      class="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6l-2-3H2" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </svg>
  </button>
</template>
