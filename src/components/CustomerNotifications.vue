<template>
  <div v-if="isLoggedIn" class="relative" ref="bellRef">
    <!-- BELL BUTTON -->
    <button
      @click="togglePanel"
      class="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 hover:bg-slate-50 transition"
    >
      <Bell class="w-5 h-5 text-slate-700" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- DROPDOWN PANEL -->
    <div
      v-if="showPanel"
      class="absolute right-0 mt-3 w-80 sm:w-96 max-h-[480px] rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden z-50"
    >
      <!-- HEADER -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-800">Notifications</h3>
        <button
          v-if="notifications.length && unreadCount > 0"
          @click="markAllRead"
          class="text-[11px] font-semibold text-green-600 hover:text-green-700"
        >
          Mark all read
        </button>
      </div>

      <!-- EMPTY -->
      <div v-if="!notifications.length" class="py-10 text-center">
        <BellOff class="w-8 h-8 mx-auto text-slate-300 mb-2" />
        <p class="text-sm text-slate-500">No notifications yet</p>
        <p class="text-[11px] text-slate-400 mt-1">Order updates will appear here</p>
      </div>

      <!-- LIST -->
      <div v-else class="overflow-y-auto max-h-[380px] divide-y divide-slate-50">
        <div
          v-for="n in notifications"
          :key="n.id"
          @click="markRead(n)"
          class="flex items-start gap-3 px-4 py-3 transition cursor-pointer"
          :class="n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-green-50/50 hover:bg-green-50'"
        >
          <!-- ICON -->
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            :class="iconStyle(n.type).bg"
          >
            <component :is="iconStyle(n.type).icon" class="w-4 h-4" :class="iconStyle(n.type).color" />
          </div>

          <!-- CONTENT -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="text-[13px] font-semibold text-slate-800">{{ n.title }}</p>
              <span v-if="!n.is_read" class="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
            </div>
            <p class="text-[12px] text-slate-600 mt-0.5 leading-relaxed">{{ n.message }}</p>
            <p class="text-[10px] text-slate-400 mt-1">{{ timeAgo(n.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { Bell, BellOff, ShoppingCart, CheckCircle, Truck, Package, XCircle } from "lucide-vue-next";
import useAuthStore from "../store/authStore";
import apiClient from "../service/axios";

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const showPanel = ref(false);
const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);
const bellRef = ref<HTMLElement | null>(null);

const fetchNotifications = async () => {
  if (!isLoggedIn.value) return;
  try {
    const res = await apiClient.get("/notifications/my");
    notifications.value = res.data.notifications;
    unreadCount.value = res.data.unreadCount;
  } catch {
    // silent - might not be logged in
  }
};

const fetchUnreadCount = async () => {
  if (!isLoggedIn.value) return;
  try {
    const res = await apiClient.get("/notifications/my/unread-count");
    unreadCount.value = res.data.count;
  } catch {
    // silent
  }
};

const markRead = async (n: Notification) => {
  if (n.is_read) return;
  try {
    await apiClient.patch(`/notifications/my/${n.id}/read`);
    n.is_read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  } catch {
    // silent
  }
};

const markAllRead = async () => {
  try {
    await apiClient.patch("/notifications/my/read-all");
    notifications.value.forEach((n) => (n.is_read = true));
    unreadCount.value = 0;
  } catch {
    // silent
  }
};

const togglePanel = () => {
  showPanel.value = !showPanel.value;
  if (showPanel.value) {
    fetchNotifications();
  }
};

const iconStyle = (type: string) => {
  switch (type) {
    case "order_placed":
      return { icon: ShoppingCart, bg: "bg-green-100", color: "text-green-600" };
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

const timeAgo = (date: string) => {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { dateStyle: "medium" });
};

// Close on outside click
const handleClickOutside = (event: MouseEvent) => {
  if (bellRef.value && !bellRef.value.contains(event.target as Node)) {
    showPanel.value = false;
  }
};

let pollInterval: ReturnType<typeof setInterval>;

onMounted(() => {
  fetchUnreadCount();
  pollInterval = setInterval(fetchUnreadCount, 30000);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  clearInterval(pollInterval);
  document.removeEventListener("click", handleClickOutside);
});
</script>
