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

      <button @click="goBack" class="icon-btn bg-white/20">
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
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div>
            <p class="order-id">#{{ order.id.slice(0, 8) }}</p>
            <p class="order-date">
              {{ new Date(order.created_at).toLocaleDateString() }}
            </p>
          </div>

          <div class="text-right">
            <p class="order-price">₹{{ order.grand_total }}</p>

            <span class="status-pill" :class="statusColor(order.status)">
              {{ order.status }}
            </span>
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
import { ArrowLeft, Plus, Pencil, Trash2, MapPin, Package } from "lucide-vue-next";
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

const userInitial = computed(() => profile.value?.name?.charAt(0)?.toUpperCase() || "U");

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
  if (status === "pending") return "text-yellow-600";
  if (status === "delivered") return "text-green-600";
  if (status === "cancelled") return "text-red-600";
  return "text-slate-500";
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
  @apply flex justify-between items-center rounded-2xl border border-slate-200 p-4 bg-white hover:shadow-md transition;
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
  @apply text-xs px-3 py-1 rounded-full font-semibold capitalize;
}

.empty-state {
  @apply flex flex-col items-center text-slate-400 text-sm py-6;
}
</style>
