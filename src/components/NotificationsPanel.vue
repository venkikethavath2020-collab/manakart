<template>
  <section
    class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
  >
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 class="section-title">Notifications</h3>
        <p class="text-sm text-slate-500">Order alerts and updates</p>
      </div>

      <button
        v-if="notifications.length"
        @click="markAllRead"
        class="text-xs font-semibold text-green-600 hover:text-green-700"
      >
        Mark all as read
      </button>
    </header>

    <!-- LOADING -->
    <div v-if="isLoading" class="text-center text-slate-500 py-8">
      Loading notifications...
    </div>

    <!-- EMPTY -->
    <div v-else-if="!notifications.length" class="text-center py-12">
      <Bell class="w-12 h-12 mx-auto text-slate-300 mb-3" />
      <p class="text-slate-500 font-medium">No notifications yet</p>
      <p class="text-xs text-slate-400 mt-1">New order alerts will appear here</p>
    </div>

    <!-- LIST -->
    <div v-else class="space-y-2 max-h-[600px] overflow-y-auto">
      <div
        v-for="n in notifications"
        :key="n.id"
        @click="markRead(n)"
        class="flex items-start gap-3 rounded-xl border p-4 transition cursor-pointer"
        :class="n.is_read
          ? 'border-slate-100 bg-white hover:bg-slate-50'
          : 'border-green-200 bg-green-50 hover:bg-green-100'"
      >
        <!-- ICON -->
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          :class="typeIcon(n.type).bg"
        >
          <component :is="typeIcon(n.type).icon" class="w-5 h-5" :class="typeIcon(n.type).color" />
        </div>

        <!-- CONTENT -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold text-slate-800">{{ n.title }}</p>
            <span v-if="!n.is_read" class="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
          </div>
          <p class="text-xs text-slate-600 mt-0.5">{{ n.message }}</p>
          <p class="text-[10px] text-slate-400 mt-1">{{ formatTime(n.created_at) }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Bell, ShoppingCart, CheckCircle, Truck, XCircle, Package } from "lucide-vue-next";
import apiClient from "../service/axios";

const emit = defineEmits(["read"]);

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  order_id: string | null;
  is_read: boolean;
  created_at: string;
}

const notifications = ref<Notification[]>([]);
const isLoading = ref(false);

const fetchNotifications = async () => {
  try {
    isLoading.value = true;
    const res = await apiClient.get("/notifications");
    notifications.value = res.data.notifications;
  } finally {
    isLoading.value = false;
  }
};

const markRead = async (n: Notification) => {
  if (n.is_read) return;
  try {
    await apiClient.patch(`/notifications/${n.id}/read`);
    n.is_read = true;
    emit("read");
  } catch {
    // silent
  }
};

const markAllRead = async () => {
  try {
    await apiClient.patch("/notifications/read-all");
    notifications.value.forEach((n) => (n.is_read = true));
    emit("read");
  } catch {
    // silent
  }
};

const typeIcon = (type: string) => {
  switch (type) {
    case "new_order":
      return { icon: ShoppingCart, bg: "bg-amber-100", color: "text-amber-600" };
    case "order_confirmed":
      return { icon: CheckCircle, bg: "bg-blue-100", color: "text-blue-600" };
    case "order_shipped":
      return { icon: Truck, bg: "bg-purple-100", color: "text-purple-600" };
    case "order_delivered":
      return { icon: Package, bg: "bg-lime-100", color: "text-lime-600" };
    case "order_cancelled":
      return { icon: XCircle, bg: "bg-red-100", color: "text-red-600" };
    default:
      return { icon: Bell, bg: "bg-slate-100", color: "text-slate-600" };
  }
};

const formatTime = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

onMounted(fetchNotifications);
</script>
