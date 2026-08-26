<template>
  <div class="fixed inset-0 z-40" :class="open ? '' : 'pointer-events-none'">
    <!-- BACKDROP -->
    <div
      class="absolute inset-0 bg-black/40 transition"
      :class="open ? 'opacity-100' : 'opacity-0'"
      @click="emit('close')"
    />

    <!-- DRAWER -->
    <aside
      class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300"
      :class="open ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex h-full flex-col overflow-y-auto thin-scrollbar">
        <!-- HEADER -->
        <div class="flex justify-between items-center p-5 border-b">
          <h2 class="font-semibold text-lg">Your Cart</h2>
          <X class="w-5 h-5 cursor-pointer" @click="emit('close')" />
        </div>

        <!-- CART ITEMS -->
        <div class="flex-1 p-5 space-y-4">
          <div v-if="items.length === 0" class="text-center text-slate-500 py-12">
            <ShoppingBag class="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p class="font-medium">Your cart is empty</p>
            <p class="text-xs mt-1">Add some fresh fruits to get started</p>
          </div>

          <div
            v-for="item in items"
            :key="`${item.id}-${item.unitGrams}`"
            class="flex gap-3 bg-slate-50 p-3 rounded-xl"
          >
            <img
              :src="`/fruits_images/${item.name.toLowerCase()}.webp`"
              class="w-14 h-14 rounded-lg object-cover"
            />

            <div class="flex-1">
              <div class="flex justify-between">
                <p class="text-sm font-semibold">{{ item.name }}</p>

                <Trash2
                  class="w-4 h-4 text-red-500 cursor-pointer"
                  @click="fruitsStore.removeFromCart(item.id, item.unitGrams)"
                />
              </div>

              <p class="text-xs text-slate-500">
                {{ item.unitLabel }} &middot; &#8377;{{ unitPriceForItem(item) }}
              </p>

              <div class="flex justify-between mt-2">
                <div class="flex items-center gap-2">
                  <Minus
                    class="qty-btn"
                    @click="fruitsStore.updateCartQuantity(item.id, item.unitGrams, -1)"
                  />
                  <span class="text-xs font-semibold">{{ item.quantity }}</span>
                  <Plus
                    class="qty-btn"
                    @click="fruitsStore.updateCartQuantity(item.id, item.unitGrams, 1)"
                  />
                </div>

                <p class="text-sm font-semibold">
                  &#8377;{{ unitPriceForItem(item) * item.quantity }}
                </p>
              </div>
            </div>
          </div>

          <!-- SUGGESTED -->
          <div v-if="suggestedFruits.length && items.length" class="pt-3 border-t">
            <p class="text-sm font-semibold mb-2">People also add</p>

            <div class="flex gap-3 overflow-x-auto pb-2 thin-scrollbar">
              <div
                v-for="fruit in suggestedFruits"
                :key="fruit.id"
                class="min-w-[110px] bg-white border rounded-xl p-2 text-center shadow-sm"
              >
                <img
                  :src="`/fruits_images/${fruit.name.toLowerCase()}.webp`"
                  class="w-16 h-16 mx-auto rounded-lg object-cover"
                />
                <p class="text-xs mt-1 font-medium">{{ fruit.name }}</p>
                <p class="text-xs text-green-600">&#8377;{{ fruit.price_per_kg }}/kg</p>

                <button
                  class="mt-1 text-xs bg-green-500 text-white px-2 py-1 rounded-lg"
                  @click="addSuggested(fruit)"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div v-if="items.length" class="border-t p-5 space-y-4">
          <!-- ADDRESS -->
          <div>
            <div class="flex justify-between mb-1">
              <p class="text-sm font-semibold">Deliver to</p>
              <button class="text-xs text-green-600" @click="handleAddressClick">
                {{ userAddress?.length ? "Change" : "Add Address" }}
              </button>
            </div>

            <div
              v-if="selectedAddress"
              class="bg-green-50 border border-green-200 rounded-xl p-3 text-sm"
            >
              <b>{{ selectedAddress.house }}</b> &nbsp;
              <span class="text-xs">
                {{ selectedAddress.street }}, {{ selectedAddress.area }}
              </span>
              <span class="text-xs"> - {{ selectedAddress.pincode }}</span>
            </div>

            <p v-else class="text-xs text-red-500">Please select delivery address</p>

            <p
              v-if="selectedAddress && !isServiceAvailable"
              class="text-xs text-red-500 mt-1"
            >
              Service not available in this pincode
            </p>

            <p
              v-if="!minimumReached && items.length"
              class="text-xs text-orange-500 mt-1"
            >
              Add &#8377;{{ amountForMinimumOrder }} more to place order (min &#8377;{{
                MIN_ORDER_VALUE
              }})
            </p>
          </div>

          <!-- PRICE -->
          <div class="text-sm space-y-1">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span>&#8377;{{ totalPrice }}</span>
            </div>

            <div class="flex justify-between">
              <span>Delivery</span>
              <span :class="deliveryCharge === 0 ? 'text-green-600 font-semibold' : ''">
                {{ deliveryCharge === 0 ? "FREE" : "&#8377;" + deliveryCharge }}
              </span>
            </div>

            <div v-if="deliveryCharge > 0" class="text-xs text-green-600">
              Free delivery on orders above &#8377;{{ FREE_DELIVERY_MIN }}
            </div>

            <div class="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total</span>
              <span>&#8377;{{ grandTotal }}</span>
            </div>
          </div>

          <!-- DELIVERY WINDOW -->
          <div
            class="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
          >
            <span>🚚</span>
            <span>{{ deliveryNotice }}</span>
          </div>

          <!-- CTA -->
          <button
            :disabled="cartCta.disabled"
            @click="placeOrder"
            class="w-full py-3 rounded-xl text-white font-semibold transition"
            :class="cartCta.class"
          >
            {{ cartCta.text }}
          </button>

          <p v-if="apiError" class="text-xs text-red-500 text-center">{{ apiError }}</p>
        </div>
      </div>
    </aside>

    <!-- ORDER SUCCESS MODAL -->
    <div
      v-if="showSuccess"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="w-full max-w-sm mx-4 bg-white rounded-3xl p-8 text-center shadow-2xl">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle class="w-10 h-10 text-green-600" />
        </div>
        <h3 class="text-xl font-bold text-slate-900">Order Placed!</h3>
        <p class="text-sm text-slate-500 mt-2">
          Your order
          <span class="font-semibold text-slate-700">#{{ successOrderId }}</span> has been
          placed successfully.
        </p>
        <p
          v-if="false"
          class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
        >
          🚚 Arriving {{ successDeliveryLabel }}
        </p>
        <p class="text-xs text-slate-400 mt-2">
          You'll be notified once the admin confirms your order.
        </p>
        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            @click="viewOrders"
          >
            View Orders
          </button>
          <button
            class="flex-1 py-2.5 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700"
            @click="continueShopping"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>

    <AddressSheet
      :open="showSheet"
      :addresses="fruitsStore.getUserAddresses"
      :selected="selectedAddress"
      @close="showSheet = false"
      @select="setSelectedAddress"
    />
  </div>
  <div>
    <AddressModal
      :open="openModal"
      :initialData="selectedAddress"
      @close="openModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useFruitsStore } from "../store/fruitsStore";
import AddressSheet from "./AddressSheet.vue";
import { X, Plus, Minus, Trash2, ShoppingBag, CheckCircle } from "lucide-vue-next";
import { ALLOWED_PINCODES } from "../constants/serviceArea";
import AddressModal from "./Profile/AddressModal.vue";
import { DELIVERY } from "../constants/delivery";

const router = useRouter();
const openModal = ref(false);

// Delivery-window message shown before placing the order.
const deliveryNotice = (() => {
  const beforeCutoff = new Date().getHours() < DELIVERY.cutoffHour;
  return beforeCutoff
    ? `Delivered today, ${DELIVERY.windowLabel}. Order by ${DELIVERY.cutoffLabel}.`
    : DELIVERY.afterCutoffLine;
})();

const fruitsStore = useFruitsStore();
const items = computed(() => fruitsStore.cartItems);
const totalPrice = computed(() => fruitsStore.cartTotalPrice);
const userAddress = computed(() => fruitsStore.getUserAddresses);

defineProps<{ open: boolean }>();
const emit = defineEmits(["close"]);

const MIN_ORDER_VALUE = Number(import.meta.env.VITE_MIN_ORDER_VALUE) || 350;
const DELIVERY_CHARGE = Number(import.meta.env.VITE_DELIVERY_CHARGE) || 50;
const FREE_DELIVERY_MIN = Number(import.meta.env.VITE_FREE_DELIVERY_MIN) || 500;

const deliveryCharge = computed(() =>
  totalPrice.value >= FREE_DELIVERY_MIN ? 0 : DELIVERY_CHARGE
);

const grandTotal = computed(() => totalPrice.value + deliveryCharge.value);

const amountForMinimumOrder = computed(() =>
  Math.max(0, MIN_ORDER_VALUE - totalPrice.value)
);

const minimumReached = computed(() => totalPrice.value >= MIN_ORDER_VALUE);

const selectedAddress = computed(() => fruitsStore.getUserDefaulatAddress);

const showSheet = ref(false);

const isServiceAvailable = computed(() =>
  selectedAddress.value
    ? ALLOWED_PINCODES.includes(String(selectedAddress.value.pincode))
    : false
);

const isLoading = ref(false);
const apiError = ref("");
const showSuccess = ref(false);
const successOrderId = ref("");
const successDeliveryDate = ref("");

// Friendly delivery-day label for the confirmation modal.
const istDateKey = (offsetDays = 0) => {
  const ist = new Date(Date.now() + (5 * 60 + 30) * 60 * 1000);
  ist.setUTCDate(ist.getUTCDate() + offsetDays);
  return ist.toISOString().slice(0, 10);
};
const successDeliveryLabel = computed(() => {
  const key = (successDeliveryDate.value || "").slice(0, 10);
  if (!key) return "";
  if (key === istDateKey(0)) return "today, 4–8 PM";
  if (key === istDateKey(1)) return "tomorrow, 4–8 PM";
  return (
    new Date(key).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    ", 4–8 PM"
  );
});

const cartCta = computed(() => {
  if (!items.value.length)
    return { text: "Add items to cart", disabled: true, class: "bg-gray-300" };

  if (!minimumReached.value)
    return {
      text: `Add \u20B9${amountForMinimumOrder.value} more`,
      disabled: true,
      class: "bg-orange-400",
    };

  if (!selectedAddress.value)
    return {
      text: "Select delivery address",
      disabled: true,
      class: "bg-gray-300",
    };

  if (!isServiceAvailable.value)
    return {
      text: "Service not available",
      disabled: true,
      class: "bg-red-400",
    };

  if (isLoading.value)
    return {
      text: "Placing order...",
      disabled: true,
      class: "bg-green-400 animate-pulse",
    };

  return {
    text: `Place Order \u2022 \u20B9${grandTotal.value}`,
    disabled: false,
    class: "bg-green-600 hover:bg-green-700 active:scale-[0.98]",
  };
});

/* ORDER */
const placeOrder = async () => {
  if (!selectedAddress.value) {
    showSheet.value = true;
    return;
  }

  try {
    isLoading.value = true;
    apiError.value = "";

    const response = await fruitsStore.createOrder({
      address_id: selectedAddress.value.id,
      items: items.value,
    });

    const order = response?.data?.order || {};
    successOrderId.value = (order.id || "").slice(0, 8);
    successDeliveryDate.value = order.delivery_date || "";

    fruitsStore.clearCart();
    showSuccess.value = true;
  } catch (err: any) {
    apiError.value = err?.response?.data?.message || "Order failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const continueShopping = () => {
  showSuccess.value = false;
  emit("close");
};

const viewOrders = () => {
  showSuccess.value = false;
  emit("close");
  router.push("/profile");
};

/* PRICE */
const unitPriceForItem = (item: any) => {
  const fruit = fruitsStore.fruits.find((f) => f.id === item.id);
  const unit = fruit?.units?.find((u: any) => u.grams === item.unitGrams);
  const price =
    unit?.price ??
    ((fruit?.price_per_kg ?? item.pricePerKgAtAdd) * item.unitGrams) / 1000;

  return Math.round(price);
};

/* SUGGESTED */
const suggestedFruits = computed(() =>
  fruitsStore.fruits.filter((f) => !items.value.some((i) => i.id === f.id)).slice(0, 5)
);

const addSuggested = (fruit: any) => {
  fruitsStore.addToCart(fruit, { grams: 1000, label: "1 kg" }, 1);
};

const setSelectedAddress = (addr: any) => {
  addr.is_default = true;
  fruitsStore.updateAddress(addr.id, addr);
  showSheet.value = false;
};

const handleAddressClick = () => {
  userAddress.value?.length ? (showSheet.value = true) : (openModal.value = true);
};
</script>

<style>
.thin-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.thin-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
.thin-scrollbar {
  scrollbar-width: thin;
}
.qty-btn {
  @apply w-4 h-4 border rounded-full p-1 cursor-pointer;
}
</style>
