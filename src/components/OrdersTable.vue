<template>
  <section
    class="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
  >
    <!-- HEADER -->
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 class="section-title">Orders</h3>
        <p class="text-sm text-slate-500">
          Manage and update customer orders
        </p>
      </div>

      <!-- FILTER -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="f in filters"
          :key="f"
          @click="activeFilter = f"
          class="rounded-full px-3 py-1 text-xs font-semibold border transition capitalize"
          :class="activeFilter === f
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
        >
          {{ f === 'all' ? 'All' : f === 'today' ? '🚚 Today' : f }}
          <span
            v-if="orderCountByStatus(f) > 0"
            class="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
            :class="activeFilter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'"
          >
            {{ orderCountByStatus(f) }}
          </span>
        </button>
      </div>
    </header>

    <!-- LOADING -->
    <div v-if="isLoading" class="text-center text-slate-500 py-8">
      Loading orders...
    </div>

    <!-- EMPTY -->
    <div v-else-if="!filteredOrders.length" class="text-center py-12">
      <Package class="w-12 h-12 mx-auto text-slate-300 mb-3" />
      <p class="text-slate-500 font-medium">
        {{ activeFilter === 'all' ? 'No orders yet' : `No ${activeFilter} orders` }}
      </p>
    </div>

    <!-- ORDER CARDS -->
    <div v-else class="space-y-3">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="rounded-2xl border transition overflow-hidden"
        :class="expandedId === order.id ? 'border-slate-300 shadow-md' : 'border-slate-200 hover:border-slate-300'"
      >
        <!-- ORDER HEADER ROW (always visible) -->
        <div
          class="flex flex-wrap items-center gap-3 px-4 py-3 cursor-pointer"
          :class="expandedId === order.id ? 'bg-slate-50' : 'hover:bg-slate-50'"
          @click="toggle(order.id)"
        >
          <!-- ORDER ID + DATE -->
          <div class="min-w-[100px]">
            <p class="text-sm font-bold text-slate-900">#{{ order.id.slice(0, 8) }}</p>
            <p class="text-[10px] text-slate-400">{{ formatDate(order.created_at) }}</p>
          </div>

          <!-- CUSTOMER -->
          <div class="min-w-[120px]">
            <p class="text-sm font-medium text-slate-800">{{ order.customer_name || 'N/A' }}</p>
            <p class="text-[10px] text-slate-400">{{ order.customer_phone || '' }}</p>
          </div>

          <!-- ITEMS SUMMARY -->
          <div class="flex-1 min-w-[140px]">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="item in order.items.slice(0, 3)"
                :key="item.id + item.unitLabel"
                class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                {{ item.name }}
                <span class="text-slate-400">&middot;</span>
                {{ item.unitLabel }}
                <span class="text-slate-400">x{{ item.quantity }}</span>
              </span>
              <span
                v-if="order.items.length > 3"
                class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500"
              >
                +{{ order.items.length - 3 }} more
              </span>
            </div>
          </div>

          <!-- TOTAL -->
          <div class="text-right min-w-[70px]">
            <p class="text-sm font-bold text-slate-900">&#8377;{{ order.grand_total }}</p>
          </div>

          <!-- DELIVERY DAY -->
          <span
            v-if="order.delivery_date"
            class="rounded-full px-2.5 py-1 text-[11px] font-semibold border"
            :class="deliveryClass(order.delivery_date)"
          >
            🚚 {{ deliveryLabel(order.delivery_date) }}
          </span>

          <!-- STATUS -->
          <span
            class="rounded-full px-3 py-1 text-[11px] font-semibold border capitalize"
            :class="statusClass(order.status)"
          >
            {{ order.status }}
          </span>

          <!-- CHEVRON -->
          <ChevronDown
            class="w-4 h-4 text-slate-400 transition-transform shrink-0"
            :class="expandedId === order.id ? 'rotate-180' : ''"
          />
        </div>

        <!-- EXPANDED DETAILS -->
        <div v-if="expandedId === order.id" class="border-t border-slate-200 bg-white">
          <div class="p-4 sm:p-5 grid gap-5 sm:grid-cols-[1fr_auto]">

            <!-- LEFT: ITEMS TABLE -->
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Order Items ({{ order.items.length }})
              </p>

              <div class="rounded-xl border border-slate-200 overflow-hidden">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th class="px-3 py-2 text-left">Item</th>
                      <th class="px-3 py-2 text-left">Weight</th>
                      <th class="px-3 py-2 text-center">Qty</th>
                      <th class="px-3 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="item in order.items" :key="item.id + item.unitGrams" class="hover:bg-slate-50">
                      <td class="px-3 py-2.5">
                        <div class="flex items-center gap-2">
                          <img
                            :src="`/fruits_images/${item.name?.toLowerCase()}.webp`"
                            class="w-8 h-8 rounded-lg object-cover border border-slate-100"
                            @error="($event.target as HTMLImageElement).style.display = 'none'"
                          />
                          <span class="font-medium text-slate-800">{{ item.name }}</span>
                        </div>
                      </td>
                      <td class="px-3 py-2.5">
                        <span class="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          {{ item.unitLabel }}
                        </span>
                      </td>
                      <td class="px-3 py-2.5 text-center font-semibold text-slate-800">
                        {{ item.quantity }}
                      </td>
                      <td class="px-3 py-2.5 text-right font-semibold text-slate-800">
                        &#8377;{{ calcItemPrice(item) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- PRICE SUMMARY -->
              <div class="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm space-y-1">
                <div class="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>&#8377;{{ order.subtotal }}</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span :class="order.delivery_charge === 0 ? 'text-green-600 font-semibold' : ''">
                    {{ order.delivery_charge === 0 ? 'FREE' : '\u20B9' + order.delivery_charge }}
                  </span>
                </div>
                <div class="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span>&#8377;{{ order.grand_total }}</span>
                </div>
              </div>
            </div>

            <!-- RIGHT: DELIVERY + ACTIONS -->
            <div class="sm:w-64 space-y-4">
              <!-- DELIVERY ADDRESS -->
              <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Delivery Address
                </p>
                <div v-if="order.house" class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 space-y-0.5">
                  <p class="font-semibold">{{ order.house }}</p>
                  <p>{{ order.street }}, {{ order.area }}</p>
                  <p class="text-xs text-slate-500">Pincode: {{ order.addr_pincode }}</p>
                  <p v-if="order.landmark" class="text-xs text-slate-400">Landmark: {{ order.landmark }}</p>

                  <!-- NAVIGATE (live location captured) -->
                  <a
                    v-if="hasCoords(order)"
                    :href="mapsUrl(order)"
                    target="_blank"
                    rel="noopener"
                    class="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                    @click.stop
                  >
                    <Navigation class="w-3.5 h-3.5" />
                    Navigate to location
                  </a>
                  <p v-else class="mt-2 text-[11px] text-slate-400">
                    📍 No live location shared
                  </p>
                </div>
                <p v-else class="text-xs text-slate-400">No address provided</p>
              </div>

              <!-- CUSTOMER INFO -->
              <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Customer
                </p>
                <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm space-y-1">
                  <p class="font-semibold text-slate-800">{{ order.customer_name || 'N/A' }}</p>
                  <a
                    v-if="order.customer_phone"
                    :href="`tel:${order.customer_phone}`"
                    class="text-xs text-green-600 font-medium hover:underline"
                  >
                    {{ order.customer_phone }}
                  </a>
                </div>
              </div>

              <!-- ACTIONS -->
              <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Actions
                </p>

                <div v-if="order.status === 'pending'" class="space-y-2">
                  <button
                    @click.stop="updateStatus(order.id, 'confirmed')"
                    class="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
                  >
                    <CheckCircle class="w-4 h-4 inline mr-1" />
                    Confirm Order
                  </button>
                  <button
                    @click.stop="openCancelModal(order)"
                    class="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
                  >
                    <XCircle class="w-4 h-4 inline mr-1" />
                    Cancel Order
                  </button>
                </div>

                <div v-else-if="order.status === 'confirmed'" class="space-y-2">
                  <button
                    @click.stop="updateStatus(order.id, 'shipped')"
                    class="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    <Truck class="w-4 h-4 inline mr-1" />
                    Mark as Shipped
                  </button>
                  <button
                    @click.stop="openCancelModal(order)"
                    class="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
                  >
                    <XCircle class="w-4 h-4 inline mr-1" />
                    Cancel Order
                  </button>
                </div>

                <div v-else-if="order.status === 'shipped'">
                  <button
                    @click.stop="updateStatus(order.id, 'delivered')"
                    class="w-full rounded-xl bg-lime-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-lime-700 transition"
                  >
                    <PackageCheck class="w-4 h-4 inline mr-1" />
                    Mark Delivered
                  </button>
                </div>

                <div v-else-if="order.status === 'delivered'" class="rounded-xl bg-lime-50 border border-lime-200 p-3 text-center">
                  <PackageCheck class="w-5 h-5 text-lime-600 mx-auto mb-1" />
                  <p class="text-xs font-semibold text-lime-700">Order Completed</p>
                </div>

                <div v-else-if="order.status === 'cancelled'" class="rounded-xl bg-red-50 border border-red-200 p-3 text-center">
                  <XCircle class="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p class="text-xs font-semibold text-red-600">Order Cancelled</p>
                  <p v-if="order.admin_note" class="text-[10px] text-red-400 mt-1">{{ order.admin_note }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CANCEL MODAL -->
    <div
      v-if="cancelModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="w-full max-w-md mx-4 bg-white rounded-2xl p-6 shadow-2xl">
        <h4 class="text-lg font-semibold text-slate-900">Cancel Order</h4>
        <p class="text-sm text-slate-500 mt-1">
          Cancel order <span class="font-semibold">#{{ cancelModal.orderId?.slice(0, 8) }}</span>?
        </p>

        <label class="block mt-4 text-sm font-medium text-slate-700">
          Reason (optional)
          <textarea
            v-model="cancelModal.note"
            rows="3"
            class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-200"
            placeholder="Reason for cancellation..."
          ></textarea>
        </label>

        <div class="flex justify-end gap-3 mt-4">
          <button
            class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            @click="cancelModal.show = false"
          >
            Keep Order
          </button>
          <button
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            @click="confirmCancel"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive } from "vue";
import {
  ChevronDown, Package, CheckCircle, XCircle, Truck, PackageCheck, Navigation
} from "lucide-vue-next";
import apiClient from "../service/axios";

/* ---------------- TYPES ---------------- */
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitLabel: string;
  unitGrams: number;
  pricePerKgAtAdd: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  grand_total: number;
  subtotal: number;
  delivery_charge: number;
  pincode: string;
  status: string;
  created_at: string;
  admin_note?: string;
  customer_name?: string;
  customer_phone?: string;
  house?: string;
  street?: string;
  area?: string;
  addr_pincode?: string;
  landmark?: string;
  delivery_date?: string;
  delivery_slot?: string;
  latitude?: number | null;
  longitude?: number | null;
}

/* ---------------- STATE ---------------- */
const orders = ref<Order[]>([]);
const isLoading = ref(false);
const expandedId = ref<string | null>(null);
const filters = ["today", "all", "pending", "confirmed", "shipped", "delivered", "cancelled"];
const activeFilter = ref("all");

const cancelModal = reactive({
  show: false,
  orderId: null as string | null,
  note: "",
});

/* ---------------- COMPUTED ---------------- */
// Orders scheduled for delivery today (IST), excluding cancelled.
const isTodayDelivery = (o: Order) =>
  o.status !== "cancelled" && o.delivery_date && toDateKey(o.delivery_date) === istDateKey(0);

const filteredOrders = computed(() => {
  if (activeFilter.value === "all") return orders.value;
  if (activeFilter.value === "today") return orders.value.filter(isTodayDelivery);
  return orders.value.filter((o) => o.status === activeFilter.value);
});

const orderCountByStatus = (filter: string) => {
  if (filter === "all") return orders.value.length;
  if (filter === "today") return orders.value.filter(isTodayDelivery).length;
  return orders.value.filter((o) => o.status === filter).length;
};

/* ---------------- API ---------------- */
const fetchOrders = async () => {
  try {
    isLoading.value = true;
    const response = await apiClient.get("/orders/all");
    orders.value = response.data;
  } finally {
    isLoading.value = false;
  }
};

const updateStatus = async (orderId: string, status: string, admin_note?: string) => {
  try {
    await apiClient.patch(`/orders/${orderId}/status`, { status, admin_note });
    await fetchOrders();
  } catch (err: any) {
    alert(err?.response?.data?.message || "Failed to update order status");
  }
};

const openCancelModal = (order: Order) => {
  cancelModal.show = true;
  cancelModal.orderId = order.id;
  cancelModal.note = "";
};

const confirmCancel = async () => {
  if (!cancelModal.orderId) return;
  await updateStatus(cancelModal.orderId, "cancelled", cancelModal.note || undefined);
  cancelModal.show = false;
};

const toggle = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id;
};

/* ---------------- HELPERS ---------------- */
const calcItemPrice = (item: OrderItem) => {
  const unitPrice = Math.round((item.pricePerKgAtAdd * item.unitGrams) / 1000);
  return unitPrice * item.quantity;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

/* ---------------- DELIVERY DAY ---------------- */
// Normalise a DATE value (may arrive as '2026-07-01' or ISO) to 'YYYY-MM-DD'.
const toDateKey = (value: string) => (value || "").slice(0, 10);

// Today / tomorrow in IST, as 'YYYY-MM-DD'.
const istDateKey = (offsetDays = 0) => {
  const ist = new Date(Date.now() + (5 * 60 + 30) * 60 * 1000);
  ist.setUTCDate(ist.getUTCDate() + offsetDays);
  return ist.toISOString().slice(0, 10);
};

const deliveryLabel = (date: string) => {
  const key = toDateKey(date);
  if (key === istDateKey(0)) return "Today, 4–8 PM";
  if (key === istDateKey(1)) return "Tomorrow, 4–8 PM";
  return new Date(key).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ", 4–8 PM";
};

const deliveryClass = (date: string) => {
  const key = toDateKey(date);
  if (key === istDateKey(0)) return "border-green-300 bg-green-50 text-green-700";
  if (key === istDateKey(1)) return "border-blue-300 bg-blue-50 text-blue-700";
  return "border-slate-300 bg-slate-50 text-slate-600";
};

/* ---------------- NAVIGATION ---------------- */
const hasCoords = (o: Order) =>
  o.latitude != null && o.longitude != null;

// Google Maps directions deep link — opens the native Maps app on mobile.
const mapsUrl = (o: Order) =>
  `https://www.google.com/maps/dir/?api=1&destination=${o.latitude},${o.longitude}`;

const statusClass = (status: string) => {
  switch (status) {
    case "pending":
      return "border-amber-300 bg-amber-50 text-amber-700";
    case "confirmed":
      return "border-blue-300 bg-blue-50 text-blue-700";
    case "shipped":
      return "border-purple-300 bg-purple-50 text-purple-700";
    case "delivered":
      return "border-lime-300 bg-lime-50 text-lime-700";
    case "cancelled":
      return "border-rose-300 bg-rose-50 text-rose-700";
    default:
      return "border-slate-300 bg-slate-50 text-slate-600";
  }
};

onMounted(fetchOrders);
</script>
