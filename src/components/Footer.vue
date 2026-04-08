<template>
  <footer
    class="relative overflow-hidden border-t border-slate-200
           bg-gradient-to-br from-white via-lime-50/30 to-orange-50/30"
  >
    <!-- Decorative Background -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
      <div class="absolute -left-20 top-0 h-40 w-40 rounded-full bg-lime-200 blur-3xl"></div>
      <div class="absolute -right-20 bottom-0 h-40 w-40 rounded-full bg-orange-200 blur-3xl"></div>
    </div>

    <div class="relative mx-auto px-5 py-12 sm:px-8 sm:py-16">

      <!-- MAIN GRID -->
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

        <!-- BRAND -->
        <div class="space-y-4 lg:col-span-2">
          <div class="flex items-center gap-2">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl
                     bg-gradient-to-br from-lime-500 to-green-600
                     text-2xl shadow-lg"
            >
              {{ FOOTER_BRAND.emoji }}
            </div>

            <div>
              <p class="font-display text-2xl font-bold text-slate-900">
                {{ FOOTER_BRAND.name }}
              </p>

              <p class="text-xs text-lime-600">
                {{ FOOTER_BRAND.tagline }}
              </p>
            </div>
          </div>

          <p class="text-sm leading-relaxed text-slate-600 max-w-sm">
            {{ FOOTER_BRAND.description }}
          </p>
        </div>

        <!-- PROMISES -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900">
            Our Promise
          </h3>

          <ul class="space-y-2.5 text-sm text-slate-600">
            <li
              v-for="item in FOOTER_PROMISES"
              :key="item.text"
              class="flex items-center gap-2"
            >
              <span class="text-lg">{{ item.icon }}</span>
              <span>{{ item.text }}</span>
            </li>
          </ul>
        </div>

        <!-- DELIVERY -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900">
            Delivery Areas
          </h3>

          <div class="space-y-2.5 text-sm text-slate-600">
            <div
              v-for="area in DELIVERY_AREAS"
              :key="area"
              class="flex items-start gap-2"
            >
              📍 <span>{{ area }}</span>
            </div>
          </div>
        </div>

        <!-- LEGAL -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900">
            Legal
          </h3>

          <ul class="space-y-2 text-sm text-slate-600">
            <li
              v-for="item in LEGAL_LINKS"
              :key="item.id"
            >
              <button
                @click="openPolicies(item.id)"

                class="hover:text-lime-600 transition"
              >
                {{ item.label }}
              </button>
            </li>
          </ul>
        </div>

      </div>

      <!-- CONTACT BAR -->
      <div
        class="mt-14 flex flex-col sm:flex-row
               justify-between items-center gap-4
               border-t border-slate-200 pt-8"
      >

        <div class="flex flex-col text-sm text-slate-600 items-center sm:items-start">

          <a
            :href="`tel:${FOOTER_CONTACT.phoneRaw}`"
            class="font-semibold text-slate-900 hover:text-lime-600"
          >
            {{ FOOTER_CONTACT.phone }}
          </a>

          <div class="flex flex-wrap gap-3 mt-1 text-xs">
            <span
              v-for="slot in OPENING_HOURS"
              :key="slot.label"
            >
              ⏰ {{ slot.label }}: {{ slot.time }}
            </span>
          </div>

        </div>

        <span class="flex items-center gap-2 text-xs font-medium text-slate-600">
          🟢 {{ FOOTER_BOTTOM.acceptingOrdersText }}
        </span>

      </div>

      <!-- COPYRIGHT -->
      <div
        class="mt-6 text-center text-xs text-slate-500"
      >
        © {{ currentYear }}
        <span class="font-semibold text-slate-900">
          {{ FOOTER_BRAND.name }}
        </span>
        — Made with ❤️ for fresh fruit lovers
      </div>

    </div>

    <!-- Bottom Gradient -->
    <div
      class="absolute bottom-0 left-0 right-0 h-1
             bg-gradient-to-r from-lime-500 via-green-500 to-lime-500"
    ></div>

    <!-- LEGAL MODAL -->
    <LegalPolicies v-model:open="showPolicies" v-model:tab="tabId"  />

  </footer>
</template>

<script setup lang="ts">
import { ref } from "vue"

import {
  FOOTER_BRAND,
  FOOTER_CONTACT,
  FOOTER_PROMISES,
  DELIVERY_AREAS,
  OPENING_HOURS,
  FOOTER_BOTTOM,
} from "../constants/footerContent"

import LegalPolicies from "./Policies/LegalPolicies.vue"

const currentYear = new Date().getFullYear()
const showPolicies = ref(false)

const LEGAL_LINKS = [
  { label: "Terms & Conditions", id: "terms" },
  { label: "Privacy Policy", id: "privacy" },
  { label: "Refund Policy", id: "refund" },
  { label: "Shipping Policy", id: "delivery" },
  { label: "Payments", id: "payments" },
]

const tabId = ref("terms")

function openPolicies(id: string) {
  tabId.value = id
  showPolicies.value = true
}

</script>

<style scoped>
a {
  transition: all 0.2s ease;
}
</style>