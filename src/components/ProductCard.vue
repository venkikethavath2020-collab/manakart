<template>
  <article
    class="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
  >
    <div class="relative h-36 overflow-hidden border-b border-slate-100">
      <img
        :src="product.image_url || fallbackImage"
        :alt="product.name"
        class="h-full w-full object-contain transition duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <span
        class="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow"
        >{{ product.name }}</span
      >
      <div
        class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
      >
        <button
          class="rounded-xl bg-white px-4 py-2 text-xs font-semibold shadow hover:bg-lime-400"
          @click="showDetails = true"
        >
          Quick View
        </button>
      </div>
    </div>
    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex items-center justify-between">
        <p class="text-base font-semibold text-slate-900">
          ₹{{ selectedVariant?.price ?? 0 }}
        </p>
        <span
          class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
          >Fresh</span
        >
      </div>
      <label class="text-xs font-semibold text-slate-700"
        >Unit
        <select
          v-model="selectedVariantId"
          class="mt-2 w-full rounded-2xl border border-slate-300/70 bg-slate-50 px-3 py-2 text-xs font-semibold"
        >
          <option
            v-for="variant in purchasableVariants"
            :key="variant.id"
            :value="variant.id"
          >
            {{ variant.unit_label }}
          </option>
        </select>
      </label>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button class="h-8 w-8 rounded-full border" @click="quantity > 1 && quantity--">
            -</button
          ><span class="min-w-[2rem] text-center text-xs font-semibold">{{
            quantity
          }}</span
          ><button class="h-8 w-8 rounded-full border" @click="quantity++">+</button>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1">
          <p class="text-base font-semibold">₹{{ totalPrice }}</p>
        </div>
      </div>
      <button
        v-if="!isInCart"
        :disabled="!selectedVariant"
        class="mt-auto rounded-2xl border border-lime-300 bg-lime-400 px-4 py-2 text-xs font-semibold disabled:opacity-50"
        @click="addToCart"
      >
        Add to Cart
      </button>
      <button
        v-else
        class="mt-auto rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 text-xs font-semibold"
        @click="removeFromCart"
      >
        Remove
      </button>
    </div>
  </article>
  <AuthModal :model-value="showAuth" @update:model-value="showAuth = false" />
  <ProductDetailsSheet v-model="showDetails" :product="product" />
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useFruitsStore } from "../store/fruitsStore";
import type { Product } from "../types/catalog";
import AuthModal from "./Auth/AuthModal.vue";
import ProductDetailsSheet from "./ProductDetailsSheet.vue";
const props = defineProps<{ product: Product }>();
const store = useFruitsStore();
const purchasableVariants = computed(() =>
  props.product.variants.filter((variant) => variant.available)
);
const selectedVariantId = ref(purchasableVariants.value[0]?.id ?? "");
const selectedVariant = computed(() =>
  purchasableVariants.value.find((variant) => variant.id === selectedVariantId.value)
);
const quantity = ref(1);
const showAuth = ref(false);
const showDetails = ref(false);
const fallbackImage = computed(
  () => `/fruits_images/${props.product.name.toLowerCase()}.webp`
);
const totalPrice = computed(() => (selectedVariant.value?.price ?? 0) * quantity.value);
const isInCart = computed(
  () =>
    !!selectedVariant.value &&
    store.findCartItemIndex(props.product.id, selectedVariant.value.id) >= 0
);
function addToCart() {
  if (!localStorage.getItem("user")) {
    showAuth.value = true;
    return;
  }
  if (selectedVariant.value)
    store.addToCart(props.product, selectedVariant.value, quantity.value);
  quantity.value = 1;
}
function removeFromCart() {
  if (selectedVariant.value)
    store.removeFromCart(props.product.id, selectedVariant.value.id);
  quantity.value = 1;
}
</script>
