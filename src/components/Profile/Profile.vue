<template>
  <section class="mx-auto max-w-5xl px-4 py-8 space-y-6">
    <!-- USER HEADER -->
    <div class="user-header">
      <div class="flex items-center gap-4">
        <div class="avatar">{{ userInitial }}</div>

        <div>
          <h2 class="text-white text-lg font-semibold">{{ profile?.name }}</h2>
          <p class="text-white/80 text-sm">{{ profile?.phone }}</p>
        </div>
      </div>

      <button @click="goBack" class="icon-btn bg-white/20 text-white">
        <ArrowLeft class="w-5 h-5" />
      </button>
    </div>

    <!-- ADDRESSES -->
    <div class="card">
      <div class="section-header">
        <h3>Saved Addresses</h3>

        <button @click="toggleAdd" class="icon-primary-btn">
          <Plus class="w-4 h-4" />
          Add
        </button>
      </div>

      <AddressForm
        v-if="showAddressForm"
        @saved="handleAddressSaved"
        @cancel="showAddressForm = false"
      />

      <div v-if="addresses.length" class="grid gap-4 sm:grid-cols-2 mt-5">
        <div v-for="address in addresses" :key="address.id" class="address-card">
          <AddressForm
            v-if="editingId === address.id"
            :initialData="address"
            @saved="handleAddressSaved"
            @cancel="editingId = null"
          />

          <div v-else>
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-slate-800">
                  {{ address.house }}, {{ address.street }}
                </p>

                <p class="text-sm text-slate-500">
                  {{ address.area }} - {{ address.pincode }}
                </p>
              </div>

              <span v-if="address.is_default" class="default-chip"> Default </span>
            </div>

            <p v-if="address.landmark" class="landmark">
              {{ address.landmark }}
            </p>

            <!-- ACTIONS -->
            <div class="action-icons">
              <button @click="editingId = address.id" class="icon-btn">
                <Pencil class="w-4 h-4" />
              </button>

              <button
                @click="deleteAddress(address.id)"
                class="icon-btn text-red-500 hover:bg-red-50"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <MapPin class="w-6 h-6 mb-2" />
        No address added yet
      </div>
    </div>

    <!-- ORDERS -->
    <div class="card">
      <div class="section-header">
        <h3>My Orders</h3>
      </div>

      <div v-if="orders.length" class="space-y-3 mt-5">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card cursor-pointer"
          @click="toggleOrder(order.id)"
        >
          <!-- ORDER SUMMARY ROW -->
          <div class="flex justify-between items-center">
            <div>
              <p class="order-id">#{{ order.id.slice(0, 8) }}</p>
              <p class="order-date">
                {{ new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) }}
              </p>
              <p
                v-if="order.delivery_date && order.status !== 'cancelled' && order.status !== 'delivered'"
                class="mt-1 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700"
              >
                🚚 {{ deliveryLabel(order.delivery_date) }}
              </p>
            </div>

            <div class="text-right flex items-center gap-3">
              <div>
                <p class="order-price">&#8377;{{ order.grand_total }}</p>
                <span class="status-pill" :class="statusColor(order.status)">
                  {{ order.status }}
                </span>
              </div>
              <ChevronDown
                class="w-4 h-4 text-slate-400 transition-transform"
                :class="expandedOrder === order.id ? 'rotate-180' : ''"
              />
            </div>
          </div>

          <!-- ORDER DETAILS (EXPANDED) -->
          <div
            v-if="expandedOrder === order.id"
            class="mt-4 pt-4 border-t border-slate-100 space-y-3"
            @click.stop
          >
            <!-- STATUS TRACKER -->
            <div class="flex items-center gap-1 overflow-x-auto pb-2">
              <div
                v-for="(step, idx) in statusSteps"
                :key="step.key"
                class="flex items-center"
              >
                <div class="flex flex-col items-center min-w-[60px]">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    :class="getStepClass(order.status, step.key)"
                  >
                    <component
                      :is="step.icon"
                      class="w-4 h-4"
                    />
                  </div>
                  <p class="text-[10px] mt-1 text-slate-500 text-center">{{ step.label }}</p>
                </div>
                <div
                  v-if="idx < statusSteps.length - 1"
                  class="w-6 h-0.5 mb-4"
                  :class="isStepPassed(order.status, statusSteps[idx + 1]?.key ?? '')
                    ? 'bg-green-500' : 'bg-slate-200'"
                ></div>
              </div>
            </div>

            <!-- ITEMS LIST -->
            <div class="space-y-2">
              <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Items</p>
              <div
                v-for="item in order.items"
                :key="item.id + item.unitGrams"
                class="flex items-center gap-3 bg-slate-50 rounded-lg p-2"
              >
                <img
                  :src="`/fruits_images/${item.name?.toLowerCase()}.webp`"
                  class="w-10 h-10 rounded-lg object-cover"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-slate-800">{{ item.name }}</p>
                  <p class="text-xs text-slate-500">{{ item.unitLabel }} x {{ item.quantity }}</p>
                </div>
              </div>
            </div>

            <!-- PRICE BREAKDOWN -->
            <div class="text-xs space-y-1 pt-2 border-t border-slate-100">
              <div class="flex justify-between">
                <span class="text-slate-500">Subtotal</span>
                <span>&#8377;{{ order.subtotal }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Delivery</span>
                <span :class="order.delivery_charge === 0 ? 'text-green-600' : ''">
                  {{ order.delivery_charge === 0 ? 'FREE' : '&#8377;' + order.delivery_charge }}
                </span>
              </div>
              <div class="flex justify-between font-semibold text-sm pt-1 border-t border-slate-100">
                <span>Total</span>
                <span>&#8377;{{ order.grand_total }}</span>
              </div>
            </div>

            <!-- ADMIN NOTE -->
            <div v-if="order.admin_note" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <span class="font-semibold">Note:</span> {{ order.admin_note }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <Package class="w-6 h-6 mb-2" />
        No orders placed yet
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  ArrowLeft, Plus, Pencil, Trash2, MapPin, Package,
  ChevronDown, Clock, CheckCircle, Truck, PackageCheck
} from "lucide-vue-next";
import useAuthStore from "../../store/authStore";
import AddressForm from "./AddressForm.vue";
import { useFruitsStore } from "../../store/fruitsStore";

const authStore = useAuthStore();
const useStore = useFruitsStore();

const profile = computed(() => authStore.getUser);
const addresses = computed(() => useStore.userAddresses);
const orders = computed(() => useStore.userOrders);

const showAddressForm = ref(false);
const editingId = ref<string | null>(null);
const expandedOrder = ref<string | null>(null);

const userInitial = computed(() => profile.value?.name?.charAt(0)?.toUpperCase() || "U");

const statusSteps = [
  { key: "pending", label: "Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

const statusOrder = ["pending", "confirmed", "shipped", "delivered"];

const getStepClass = (orderStatus: string, stepKey: string) => {
  if (orderStatus === "cancelled") {
    return stepKey === "pending"
      ? "bg-red-100 text-red-600"
      : "bg-slate-100 text-slate-400";
  }
  const orderIdx = statusOrder.indexOf(orderStatus);
  const stepIdx = statusOrder.indexOf(stepKey);
  if (stepIdx <= orderIdx) return "bg-green-100 text-green-600";
  return "bg-slate-100 text-slate-400";
};

const isStepPassed = (orderStatus: string, stepKey: string) => {
  if (orderStatus === "cancelled") return false;
  const orderIdx = statusOrder.indexOf(orderStatus);
  const stepIdx = statusOrder.indexOf(stepKey);
  return stepIdx <= orderIdx;
};

const toggleOrder = (id: string) => {
  expandedOrder.value = expandedOrder.value === id ? null : id;
};

const toggleAdd = () => {
  showAddressForm.value = !showAddressForm.value;
  editingId.value = null;
};

const handleAddressSaved = async () => {
  showAddressForm.value = false;
  editingId.value = null;
};

const deleteAddress = async (id: string) => {
  if (!confirm("Are you sure you want to delete this address?")) return;
  await useStore.deleteAddress(id);
};

const goBack = () => {
  window.history.back();
};

const statusColor = (status: string) => {
  if (status === "pending") return "bg-amber-100 text-amber-700";
  if (status === "confirmed") return "bg-blue-100 text-blue-700";
  if (status === "shipped") return "bg-purple-100 text-purple-700";
  if (status === "delivered") return "bg-green-100 text-green-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-500";
};

/* Delivery-day label: Today / Tomorrow / date, all in the 4–8 PM window. */
const istDateKey = (offsetDays = 0) => {
  const ist = new Date(Date.now() + (5 * 60 + 30) * 60 * 1000);
  ist.setUTCDate(ist.getUTCDate() + offsetDays);
  return ist.toISOString().slice(0, 10);
};
const deliveryLabel = (date: string) => {
  const key = (date || "").slice(0, 10);
  if (key === istDateKey(0)) return "Today, 4–8 PM";
  if (key === istDateKey(1)) return "Tomorrow, 4–8 PM";
  return new Date(key).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ", 4–8 PM";
};

onMounted(() => {
  useStore.fetchAddresses();
  useStore.fetchOrders();
});
</script>

<style scoped>
.user-header {
  @apply flex justify-between items-center rounded-3xl p-6 text-white shadow-lg;
  background: linear-gradient(135deg, #16a34a, #22c55e);
}

.avatar {
  @apply h-14 w-14 rounded-full bg-white text-green-600 flex items-center justify-center text-xl font-bold shadow-md;
}

.card {
  @apply rounded-3xl bg-white/80 backdrop-blur border border-slate-200 p-6 shadow-sm;
}

.section-header {
  @apply flex justify-between items-center;
}

.section-header h3 {
  @apply text-lg font-semibold text-slate-800;
}

.address-card {
  @apply rounded-2xl border border-slate-200 p-4 bg-white hover:shadow-md transition;
}

.default-chip {
  @apply text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold;
}

.landmark {
  @apply text-xs text-slate-400 mt-1;
}

.icon-btn {
  @apply p-2 rounded-lg hover:bg-slate-100 transition;
}

.icon-primary-btn {
  @apply flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition;
}

.action-icons {
  @apply flex gap-2 mt-4;
}

.order-card {
  @apply rounded-2xl border border-slate-200 p-4 bg-white hover:shadow-md transition;
}

.order-id {
  @apply text-sm font-medium text-slate-700;
}

.order-date {
  @apply text-xs text-slate-400;
}

.order-price {
  @apply font-semibold text-slate-800;
}

.status-pill {
  @apply text-xs px-3 py-1 rounded-full font-semibold capitalize inline-block mt-1;
}

.empty-state {
  @apply flex flex-col items-center text-slate-400 text-sm py-6;
}
</style>
