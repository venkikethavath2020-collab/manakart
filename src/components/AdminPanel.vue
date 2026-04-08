<template>
  <section class="space-y-6">
    <!-- ADMIN HEADER -->
    <header
      class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
    >
      <div>
        <h2 class="text-xl font-bold text-slate-900">Admin Panel</h2>
        <p class="text-sm text-slate-500">
          Manage products and customer orders
        </p>
      </div>

      <!-- NAV -->
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="tabButton(tab)"
        >
          {{ tab }}
        </button>
      </div>
    </header>

    <!-- DYNAMIC CHILD -->
    <ProductConfig v-if="activeTab === 'Products'" />
    <OrdersTable v-else />
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ProductConfig from "./ProductConfig.vue";
import OrdersTable from "./OrdersTable.vue";

const tabs = ["Products", "Orders"];
const activeTab = ref("Products");

const tabButton = (tab: string) =>
  [
    "rounded-xl px-4 py-2 text-sm font-semibold border",
    activeTab.value === tab
      ? "bg-slate-900 text-white border-slate-900"
      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100",
  ];
</script>
