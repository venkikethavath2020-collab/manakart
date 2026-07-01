<template>
  <section class="space-y-5">
    <!-- STAT CARDS -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
      >
        <div class="flex items-center justify-between">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
            :class="card.iconBg"
          >
            {{ card.icon }}
          </div>
          <span
            v-if="card.trend"
            class="text-[11px] font-semibold"
            :class="card.trendUp ? 'text-green-600' : 'text-slate-400'"
          >
            {{ card.trend }}
          </span>
        </div>
        <p class="mt-3 font-display text-2xl font-extrabold text-slate-900">
          {{ card.value }}
        </p>
        <p class="text-xs text-slate-500">{{ card.label }}</p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <!-- ORDERS BY STATUS -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h4 class="font-display text-base font-bold text-slate-900">Orders by status</h4>
        <p class="text-xs text-slate-500">Distribution of all {{ orders.length }} orders</p>

        <div class="mt-4 space-y-3">
          <div v-for="s in statusBreakdown" :key="s.status">
            <div class="mb-1 flex items-center justify-between text-xs">
              <span class="font-semibold capitalize text-slate-700">{{ s.status }}</span>
              <span class="text-slate-500">{{ s.count }}</span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full transition-all"
                :class="s.color"
                :style="{ width: pct(s.count) + '%' }"
              ></div>
            </div>
          </div>
          <p v-if="!orders.length" class="py-6 text-center text-sm text-slate-400">
            No orders yet
          </p>
        </div>
      </div>

      <!-- TOP PRODUCTS -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h4 class="font-display text-base font-bold text-slate-900">Top selling fruits</h4>
        <p class="text-xs text-slate-500">By quantity ordered</p>

        <div class="mt-4 space-y-2">
          <div
            v-for="(p, i) in topProducts"
            :key="p.name"
            class="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2"
          >
            <span class="text-sm font-bold text-slate-400">#{{ i + 1 }}</span>
            <img
              :src="`/fruits_images/${p.name.toLowerCase()}.webp`"
              class="h-8 w-8 rounded-lg object-cover"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <span class="flex-1 text-sm font-medium text-slate-800">{{ p.name }}</span>
            <span class="text-xs font-semibold text-slate-500">{{ p.qty }} sold</span>
          </div>
          <p v-if="!topProducts.length" class="py-6 text-center text-sm text-slate-400">
            No sales yet
          </p>
        </div>
      </div>
    </div>

    <!-- RECENT ORDERS -->
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <h4 class="font-display text-base font-bold text-slate-900">Recent orders</h4>
      <div class="mt-3 space-y-2">
        <div
          v-for="o in recentOrders"
          :key="o.id"
          class="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm"
        >
          <div class="min-w-0">
            <p class="font-semibold text-slate-800">#{{ o.id.slice(0, 8) }}</p>
            <p class="truncate text-xs text-slate-400">{{ o.customer_name || 'Guest' }}</p>
          </div>
          <span class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize" :class="statusClass(o.status)">
            {{ o.status }}
          </span>
          <span class="font-bold text-slate-900">₹{{ o.grand_total }}</span>
        </div>
        <p v-if="!recentOrders.length" class="py-6 text-center text-sm text-slate-400">
          No orders yet
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import apiClient from "../../service/axios";
import { useFruitsStore } from "../../store/fruitsStore";

const fruitStore = useFruitsStore();
const orders = ref<any[]>([]);
const users = ref<any[]>([]);

const fetchData = async () => {
  try {
    const [ordersRes, usersRes] = await Promise.all([
      apiClient.get("/orders/all"),
      apiClient.get("/users/all"),
    ]);
    orders.value = ordersRes.data || [];
    users.value = usersRes.data || [];
  } catch {
    // silent — cards will show zeros
  }
};

const totalRevenue = computed(() =>
  orders.value
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.grand_total || 0), 0)
);

const pendingCount = computed(() => orders.value.filter((o) => o.status === "pending").length);

const statCards = computed(() => [
  { label: "Total revenue", value: `₹${totalRevenue.value.toLocaleString("en-IN")}`, icon: "💰", iconBg: "bg-lime-100", trend: "", trendUp: true },
  { label: "Total orders", value: orders.value.length, icon: "📦", iconBg: "bg-blue-100", trend: `${pendingCount.value} pending`, trendUp: pendingCount.value > 0 },
  { label: "Customers", value: users.value.length, icon: "👥", iconBg: "bg-mango-100", trend: "", trendUp: true },
  { label: "Products", value: fruitStore.fruits.length, icon: "🍎", iconBg: "bg-berry-100", trend: `${availableCount.value} active`, trendUp: true },
]);

const availableCount = computed(() => fruitStore.fruits.filter((f: any) => f.available).length);

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-lime-500",
  cancelled: "bg-rose-400",
};

const statusBreakdown = computed(() =>
  ["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => ({
    status,
    count: orders.value.filter((o) => o.status === status).length,
    color: STATUS_COLORS[status],
  }))
);

const pct = (count: number) => (orders.value.length ? Math.round((count / orders.value.length) * 100) : 0);

const topProducts = computed(() => {
  const tally: Record<string, number> = {};
  for (const o of orders.value) {
    for (const item of o.items || []) {
      tally[item.name] = (tally[item.name] || 0) + (item.quantity || 0);
    }
  }
  return Object.entries(tally)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
});

const recentOrders = computed(() => orders.value.slice(0, 6));

const statusClass = (status: string) => {
  switch (status) {
    case "pending": return "bg-amber-50 text-amber-700";
    case "confirmed": return "bg-blue-50 text-blue-700";
    case "shipped": return "bg-purple-50 text-purple-700";
    case "delivered": return "bg-lime-50 text-lime-700";
    case "cancelled": return "bg-rose-50 text-rose-700";
    default: return "bg-slate-50 text-slate-600";
  }
};

onMounted(async () => {
  if (!fruitStore.fruits.length) await fruitStore.fetchFruits();
  await fetchData();
});
</script>
