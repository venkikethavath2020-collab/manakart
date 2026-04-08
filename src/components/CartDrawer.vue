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
          <div v-if="items.length === 0" class="text-center text-slate-500">
            Your cart is empty
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
                {{ item.unitLabel }} • ₹{{ unitPriceForItem(item) }}
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
                  ₹{{ unitPriceForItem(item) * item.quantity }}
                </p>
              </div>
            </div>
          </div>

          <!-- SUGGESTED -->
          <div v-if="suggestedFruits.length" class="pt-3 border-t">
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
                <p class="text-xs text-green-600">₹{{ fruit.price_per_kg }}/kg</p>

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
        <div class="border-t p-5 space-y-4">
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
              <span class="text-xs">{{ selectedAddress.pincode }}</span>
            </div>

            <p v-else class="text-xs text-red-500">Please select delivery address</p>

            <p v-if="selectedAddress && !isServiceAvailable" class="text-xs text-red-500">
              Service not available in this pincode
            </p>

            <p v-if="!minimumReached && items.length" class="text-xs text-orange-500">
              Minimum order ₹{{ MIN_ORDER_VALUE }}
            </p>
          </div>

          <!-- PRICE -->
          <div class="text-sm space-y-1">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span>₹{{ totalPrice }}</span>
            </div>

            <div class="flex justify-between">
              <span>Delivery</span>
              <span>{{ deliveryCharge === 0 ? "FREE" : "₹" + deliveryCharge }}</span>
            </div>

            <div class="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total</span>
              <span>₹{{ grandTotal }}</span>
            </div>
          </div>

          <!-- CTA -->
          <button
            :disabled="cartCta.disabled"
            @click="placeOrder"
            class="w-full py-3 rounded-xl text-white transition"
            :class="cartCta.class"
          >
            {{ cartCta.text }}
          </button>

          <p v-if="apiError" class="text-xs text-red-500">{{ apiError }}</p>
        </div>
      </div>
    </aside>

    <AddressSheet
      :open="showSheet"
      :addresses="fruitsStore.getUserAddresses"
      :selected="selectedAddress"
      @close="showSheet = false"
      @select="setSelectedAddress"
    />

    <AddressModal
      :open="openModal"
      :initialData="selectedAddress"
      @close="openModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useFruitsStore } from "../store/fruitsStore";
import AddressSheet from "./AddressSheet.vue";
import { X, Plus, Minus, Trash2 } from "lucide-vue-next";
import { ALLOWED_PINCODES } from "../constants/serviceArea";
import { FOOTER_CONTACT } from "../constants/footerContent";
import AddressModal from "./Profile/AddressModal.vue";

const openModal = ref(false);

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

const cartCta = computed(() => {
  if (!items.value.length)
    return { text: "Add items to cart", disabled: true, class: "bg-gray-300" };

  if (!minimumReached.value)
    return {
      text: `Add ₹${amountForMinimumOrder.value} more`,
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
      text: "Processing...",
      disabled: true,
      class: "bg-green-400",
    };

  return {
    text: "Order via WhatsApp",
    disabled: false,
    class: "bg-green-500 hover:bg-green-600",
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

    await fruitsStore.createOrder({
      address_id: selectedAddress.value.id,
      items: items.value,
    });

    const message = encodeURIComponent(buildWhatsAppMessage());
    window.open(`${FOOTER_CONTACT.whatsappLink}?text=${message}`, "_blank");

    fruitsStore.clearCart();
  } catch (err: any) {
    apiError.value = err?.response?.data?.message || "Order failed";
  } finally {
    isLoading.value = false;
  }
};

/* WHATSAPP MESSAGE */
const buildWhatsAppMessage = () => {
  const lines = items.value.map(
    (item) =>
      `• ${item.name} (${item.unitLabel}) x ${item.quantity} = ₹${
        unitPriceForItem(item) * item.quantity
      }`
  );

  return `
🛒 *New FruitKart Order*

${lines.join("\n")}

Subtotal: ₹${totalPrice.value}
Delivery: ${deliveryCharge.value === 0 ? "FREE" : "₹" + deliveryCharge.value}
Total: ₹${grandTotal.value}

📍 Deliver to:
${selectedAddress.value.house},
${selectedAddress.value.street},
${selectedAddress.value.area},
${selectedAddress.value.pincode}
`;
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
  userAddress.value?.length ? showSheet.value = true : openModal.value = true;
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
