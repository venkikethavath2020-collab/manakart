<script setup lang="ts">
import { computed } from "vue"

/*
  two-way modal control
*/
const isOpen = defineModel<boolean>("open")

/*
  two-way tab control
*/
const activeTab = defineModel<string>("tab", {
  default: "terms"
})

/*
  single source of truth
*/
const TABS = [
  {
    id: "terms",
    title: "Terms",
    content: [
      "By using Manakart you agree to comply with these terms.",
      "Manakart connects customers with local fruit and grocery suppliers.",
      "Orders may be cancelled in case of stock unavailability."
    ]
  },
  {
    id: "privacy",
    title: "Privacy",
    content: [
      "We collect basic information such as name, phone number and delivery address.",
      "Data is used only to process orders and improve services.",
      "We never sell user data."
    ]
  },
  {
    id: "refund",
    title: "Refunds",
    content: [
      "Refunds are available for damaged or incorrect items.",
      "Issues must be reported within 24 hours.",
      "Refunds are processed within 5-7 business days."
    ]
  },
  {
    id: "delivery",
    title: "Delivery",
    content: [
      "Delivery times depend on traffic and weather.",
      "Manakart delivers only within service areas.",
      "Incorrect address may lead to cancellation."
    ]
  },
  {
    id: "payments",
    title: "Payments",
    content: [
      "Orders are confirmed after successful payment.",
      "Payment gateway failures are outside our control.",
      "Orders may be cancelled before dispatch."
    ]
  }
]

/*
  computed active tab
*/
const currentTab = computed(() =>
  TABS.find(tab => tab.id === activeTab.value)
)

/*
  switch tab
*/
function switchTab(id: string) {
  activeTab.value = id
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div class="w-[95%] max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

        <!-- HEADER -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">
              Manakart Policies
            </h2>
            <p class="text-xs text-slate-500">
              Transparency builds trust
            </p>
          </div>

          <button
            class="text-slate-400 hover:text-red-500"
            @click="isOpen = false"
          >
            ✕
          </button>
        </div>

        <!-- TRUST BADGES -->
        <div
          class="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-4
                 bg-gradient-to-r from-lime-50 to-orange-50 border-b"
        >
          <div class="text-center">
            <div class="text-xl">🥭</div>
            <p class="text-xs font-medium">Fresh Fruits</p>
          </div>

          <div class="text-center">
            <div class="text-xl">🚚</div>
            <p class="text-xs font-medium">Fast Delivery</p>
          </div>

          <div class="text-center">
            <div class="text-xl">🔒</div>
            <p class="text-xs font-medium">Secure Payments</p>
          </div>

          <div class="text-center">
            <div class="text-xl">⭐</div>
            <p class="text-xs font-medium">Trusted Vendors</p>
          </div>
        </div>

        <!-- TAB NAVIGATION -->
        <div class="border-b border-slate-200 px-4 overflow-x-auto">
          <div class="flex gap-4">
            <button
              v-for="tab in TABS"
              :key="tab.id"
              @click="switchTab(tab.id)"
              class="py-3 text-sm font-medium border-b-2 transition"
              :class="activeTab === tab.id
                ? 'border-lime-500 text-lime-600'
                : 'border-transparent text-slate-500'"
            >
              {{ tab.title }}
            </button>
          </div>
        </div>

        <!-- CONTENT -->
        <div class="px-6 py-6 max-h-[50vh] overflow-y-auto">

          <div v-if="currentTab">
            <h3 class="text-lg font-semibold mb-3 text-slate-900">
              {{ currentTab.title }}
            </h3>

            <p
              v-for="text in currentTab.content"
              :key="text"
              class="text-slate-600 mb-3 leading-relaxed"
            >
              {{ text }}
            </p>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-slate-200">

          <p class="text-xs text-slate-500">
            By continuing you agree to Manakart policies
          </p>

          <button
            class="px-5 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600"
            @click="isOpen = false"
          >
            Got it
          </button>

        </div>

      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>