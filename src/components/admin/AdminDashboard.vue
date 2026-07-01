<template>
  <div class="lg:flex lg:gap-6">
    <!-- SIDEBAR (desktop) / TOP TABS (mobile) -->
    <aside class="lg:w-60 lg:shrink-0">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-3 shadow-soft lg:sticky lg:top-4"
      >
        <div class="hidden px-2 py-3 lg:block">
          <p class="font-display text-lg font-extrabold text-slate-900">Dashboard</p>
          <p class="text-xs text-slate-500">Manage your store</p>
        </div>

        <nav class="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="relative flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition"
            :class="activeTab === tab.key
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'"
          >
            <component :is="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
            <span
              v-if="tab.key === 'notifications' && unreadCount > 0"
              class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
            >
              {{ unreadCount > 9 ? "9+" : unreadCount }}
            </span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- CONTENT -->
    <div class="mt-4 flex-1 lg:mt-0">
      <AdminAnalytics v-if="activeTab === 'overview'" />
      <OrdersTable v-else-if="activeTab === 'orders'" />
      <ProductConfig v-else-if="activeTab === 'products'" />
      <UsersTable v-else-if="activeTab === 'users'" />
      <NotificationsPanel v-else-if="activeTab === 'notifications'" @read="fetchUnread" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, markRaw } from "vue";
import { LayoutDashboard, ShoppingBag, Apple, Users, Bell } from "lucide-vue-next";
import apiClient from "../../service/axios";
import AdminAnalytics from "./AdminAnalytics.vue";
import UsersTable from "./UsersTable.vue";
import OrdersTable from "../OrdersTable.vue";
import ProductConfig from "../ProductConfig.vue";
import NotificationsPanel from "../NotificationsPanel.vue";

const tabs = [
  { key: "overview", label: "Overview", icon: markRaw(LayoutDashboard) },
  { key: "orders", label: "Orders", icon: markRaw(ShoppingBag) },
  { key: "products", label: "Products", icon: markRaw(Apple) },
  { key: "users", label: "Customers", icon: markRaw(Users) },
  { key: "notifications", label: "Notifications", icon: markRaw(Bell) },
];

const activeTab = ref("overview");
const unreadCount = ref(0);
let poll: number | undefined;

const fetchUnread = async () => {
  try {
    const res = await apiClient.get("/notifications/unread-count");
    unreadCount.value = res.data.count;
  } catch {
    // silent
  }
};

onMounted(() => {
  fetchUnread();
  poll = window.setInterval(fetchUnread, 30000);
});

onBeforeUnmount(() => {
  if (poll) clearInterval(poll);
});
</script>
