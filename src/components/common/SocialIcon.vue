<script setup lang="ts">
defineProps<{
  icon: string
  href: string
  bgClass: string
  label: string
}>()
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener"
    :aria-label="label"
    class="group flex h-10 w-10 items-center justify-center
           rounded-xl text-white shadow-md
           transition-all hover:scale-110 hover:shadow-lg"
    :class="bgClass"
  >
    <i
      :class="`mdi ${icon}`"
      class="text-xl transition-transform group-hover:scale-110"
    ></i>
  </a>
</template>
