<template>
  <section class="space-y-6">
    <!-- ADMIN HEADER -->
    <header
      class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
    >
      <div>
        <h2 class="text-xl font-bold text-slate-900">Admin Panel</h2>
        <p class="text-sm text-slate-500">
          Manage products, orders, and notifications
        </p>
      </div>

      <!-- NAV -->
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="tabButton(tab.key)"
          class="relative"
        >
          {{ tab.label }}
          <span
            v-if="tab.key === 'Notifications' && unreadCount > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>
      </div>
    </header>

    <!-- DYNAMIC CHILD -->
    <ProductConfig v-if="activeTab === 'Products'" />
    <OrdersTable v-else-if="activeTab === 'Orders'" />
    <NotificationsPanel v-else-if="activeTab === 'Notifications'" @read="fetchUnread" />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import ProductConfig from "./ProductConfig.vue";
import OrdersTable from "./OrdersTable.vue";
import NotificationsPanel from "./NotificationsPanel.vue";
import apiClient from "../service/axios";

const tabs = [
  { key: "Orders", label: "Orders" },
  { key: "Products", label: "Products" },
  { key: "Notifications", label: "Notifications" },
];
const activeTab = ref("Orders");
const unreadCount = ref(0);

const fetchUnread = async () => {
  try {
    const res = await apiClient.get("/notifications/unread-count");
    unreadCount.value = res.data.count;
  } catch {
    // silent
  }
};

onMounted(fetchUnread);

// Poll for new notifications every 30s
onMounted(() => {
  setInterval(fetchUnread, 30000);
});

const tabButton = (tab: string) =>
  [
    "rounded-xl px-4 py-2 text-sm font-semibold border transition",
    activeTab.value === tab
      ? "bg-slate-900 text-white border-slate-900"
      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100",
  ];
</script>
