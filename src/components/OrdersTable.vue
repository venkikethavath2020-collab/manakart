<template>
  <section
    class="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
  >
    <!-- HEADER -->
    <header>
      <h3 class="section-title">Orders</h3>
      <p class="text-sm text-slate-500">
        Track and manage customer orders
      </p>
    </header>

    <!-- TABLE -->
    <div
      class="relative -mx-6 sm:mx-0 overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200"
    >
      <div class="min-w-[900px]">
        <table class="w-full text-sm">
          <thead
            class="bg-slate-50 text-xs uppercase tracking-wider text-slate-600"
          >
            <tr>
              <th class="px-4 py-3 text-left">Order</th>
              <th class="px-4 py-3 text-left">Items</th>
              <!-- <th class="px-4 py-3 text-left">Pincode</th> -->
              <th class="px-4 py-3 text-left">Total</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <!-- LOADING -->
            <tr v-if="isLoading">
              <td colspan="6" class="px-4 py-6 text-center text-slate-500">
                Loading orders...
              </td>
            </tr>

            <!-- DATA -->
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-slate-50 transition whitespace-nowrap"
            >
              <!-- ORDER ID -->
              <td class="px-4 py-4 font-semibold text-slate-900">
                #{{ order.id.slice(0, 6) }}
              </td>

              <!-- ITEMS -->
              <td class="px-4 py-4">
                <p class="font-semibold text-slate-900">
                  {{ order.items.length }} items
                </p>

                <p class="text-xs text-slate-500">
                  {{ itemNames(order) }}
                </p>
              </td>

              <!-- PINCODE -->
              <!-- <td class="px-4 py-4">{{ order.pincode }}</td> -->

              <!-- TOTAL -->
              <td class="px-4 py-4 font-semibold text-slate-900">
                ₹{{ order.grand_total }}
              </td>

              <!-- STATUS -->
              <td class="px-4 py-4">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold border"
                  :class="statusClass(order.status)"
                >
                  {{ order.status }}
                </span>
              </td>

              <!-- DATE -->
              <td class="px-4 py-4 text-slate-500 text-xs">
                {{ formatDate(order.created_at) }}
              </td>
            </tr>

            <!-- EMPTY -->
            <tr v-if="!isLoading && !orders.length">
              <td colspan="6" class="px-4 py-6 text-center text-slate-500">
                No orders found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFruitsStore } from "../store/fruitsStore";

/* ---------------- TYPES ---------------- */
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitLabel: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  grand_total: number;
  pincode: string;
  status: string;
  created_at: string;
}

/* ---------------- STATE ---------------- */
const orders = ref<Order[]>([]);
const isLoading = ref(false);
const fruitStore = useFruitsStore();

/* ---------------- API ---------------- */
const fetchOrders = async () => {
  try {
    isLoading.value = true;
    const response = await fruitStore.fetchOrders();
    orders.value = response.data;
  } finally {
    isLoading.value = false;
  }
};

/* ---------------- HELPERS ---------------- */
const itemNames = (order: Order) =>
  order.items.map((i) => i.name).join(", ");

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const statusClass = (status: string) => {
  switch (status) {
    case "PENDING":
      return "border-amber-300 bg-amber-50 text-amber-700";
    case "DELIVERED":
      return "border-lime-300 bg-lime-50 text-lime-700";
    case "CANCELLED":
      return "border-rose-300 bg-rose-50 text-rose-700";
    default:
      return "border-slate-300 bg-slate-50 text-slate-600";
  }
};

onMounted(fetchOrders);
</script>
