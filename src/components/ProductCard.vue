<template>
  <article
    class="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl hover:border-lime-300/70"
  >
    <!-- IMAGE -->
    <div class="relative h-36 overflow-hidden border-b border-slate-100">
      <img
        :src="`/fruits_images/${fruit?.name?.toLowerCase()}.webp`"
        :alt="fruit.name"
        class="h-full w-full object-contain transition duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <span
        class="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow"
      >
        {{
          FRUIT_EMOJIS[
            fruit?.name.toLowerCase() as keyof typeof FRUIT_EMOJIS
          ] || "🍎"
        }}
        {{ fruit.name }}
      </span>
      <!-- QUICK VIEW OVERLAY -->
      <div
        class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
      >
        <button
          class="rounded-xl bg-white px-4 py-2 text-xs font-semibold shadow hover:bg-lime-400"
          @click="openDetails"
        >
          Quick View
        </button>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="flex flex-1 flex-col gap-3 p-4">
      <!-- PRICE HEADER -->
      <div class="flex items-center justify-between">
        <p class="text-base font-semibold text-slate-900">₹{{ fruit.price_per_kg }}/kg</p>

        <span
          class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
        >
          Fresh
        </span>
      </div>

      <!-- UNIT SELECT -->
      <label class="text-xs font-semibold text-slate-700">
        Unit
        <select
          v-model="selectedUnit"
          class="mt-2 w-full rounded-2xl border border-slate-300/70 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
        >
          <option v-for="unit in fruit.units" :key="unit.grams" :value="unit">
            {{ unit.label }}
          </option>
        </select>
      </label>

      <!-- QUANTITY + PRICE -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="h-8 w-8 rounded-full border border-slate-300 bg-white text-base font-semibold text-slate-700 shadow-sm transition hover:border-lime-400 hover:bg-lime-50"
            @click="decrement"
          >
            -
          </button>

          <span
            class="min-w-[2rem] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-semibold text-slate-800"
          >
            {{ quantity }}
          </span>

          <button
            type="button"
            class="h-8 w-8 rounded-full border border-slate-300 bg-white text-base font-semibold text-slate-700 shadow-sm transition hover:border-lime-400 hover:bg-lime-50"
            @click="increment"
          >
            +
          </button>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1">
          <p class="text-base font-semibold text-slate-900">₹{{ unitPrice }}</p>
        </div>
      </div>

      <!-- ACTION BUTTON -->
      <button
        v-if="!isInCart"
        type="button"
        class="mt-auto rounded-2xl border border-lime-300 bg-lime-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-soft transition hover:bg-lime-300 hover:border-lime-400 active:scale-[0.98]"
        @click="addToCart"
      >
        Add to Cart
      </button>

      <button
        v-else
        type="button"
        class="mt-2 rounded-2xl border border-slate-300 bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-soft transition hover:bg-slate-300 active:scale-[0.98]"
        @click="removeFromCart"
      >
        Remove
      </button>
    </div>
  </article>
  <AuthModal :model-value="showAuth" @update:model-value="showAuth = false" />
  <ProductDetailsSheet v-model="showDetails" :product="fruit" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { FRUIT_EMOJIS } from "../constants/heroContent";
import { useFruitsStore } from "../store/fruitsStore";
import AuthModal from "./Auth/AuthModal.vue";
import ProductDetailsSheet from "./ProductDetailsSheet.vue";

const props = defineProps<{
  fruit: {
    id: string;
    name: string;
    price_per_kg: number;
    priceLabel?: string;
    units?: { label: string; grams: number; price?: number }[];
  };
}>();

const fruitStore = useFruitsStore();

const selectedUnit = ref(props.fruit.units?.[2] ?? { label: "", grams: 0 });

const quantity = ref(1);

const showDetails = ref(false);
const openDetails = () => {
  showDetails.value = true;
};

const roundPrice = (value: number) => Math.round(value);

const unitPrice = computed(() => {
  if (!selectedUnit.value?.grams) return 0;

  const overridePrice = selectedUnit.value.price;

  const price = overridePrice ?? (props.fruit.price_per_kg * selectedUnit.value.grams) / 1000;

  return roundPrice(price) * quantity.value;
});

const isInCart = computed(() =>
  fruitStore.cartItems.some(
    (item) => item.id === props.fruit.id && item.unitGrams === selectedUnit.value.grams
  )
);

const decrement = () => {
  if (quantity.value > 1) quantity.value--;
};

const increment = () => {
  quantity.value++;
};

const showAuth = ref(false);

const addToCart = () => {
  const user = localStorage.getItem("user");
  if (!user) {
    showAuth.value = true;
    return;
  }
  fruitStore.addToCart(
    {
      ...props.fruit,
      price_per_kg: props.fruit.price_per_kg,
    },
    selectedUnit.value,
    quantity.value
  );

  quantity.value = 1;
};

const removeFromCart = () => {
  fruitStore.removeFromCart(props.fruit.id, selectedUnit.value.grams);

  quantity.value = 1;
};
</script>
