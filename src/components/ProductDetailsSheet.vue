<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <!-- CONTAINER -->
      <div
        :class="[
          'bg-white shadow-xl overflow-hidden',
          isMobile
            ? 'absolute bottom-0 w-full max-h-[90vh] rounded-t-3xl'
            : 'relative w-[520px] max-h-[85vh] rounded-3xl',
        ]"
      >
        <!-- CLOSE BUTTON (desktop only) -->
        <button
          v-if="!isMobile"
          class="absolute right-4 top-4 rounded-full bg-slate-100 p-2 hover:bg-slate-200"
          @click="close"
        >
          ✕
        </button>

        <!-- MOBILE HANDLE -->
        <div v-if="isMobile" class="flex justify-center py-3">
          <div class="h-1.5 w-12 rounded-full bg-slate-300"></div>
        </div>

        <div class="overflow-y-auto max-h-[80vh]">
          <!-- IMAGE -->
          <div class="flex justify-center p-6 border-b">
            <img
              :src="`/fruits_images/${product?.name?.toLowerCase()}.webp`"
              class="h-40 object-contain"
            />
          </div>

          <!-- HEADER -->
          <div class="px-6 py-4 text-center">
            <h2 class="text-xl font-bold text-slate-900">
              {{ product.name }}
            </h2>

            <p class="text-lg font-semibold text-lime-600">
              From ₹{{ product.variants?.[0]?.price ?? 0 }}
            </p>

            <p class="text-xs text-slate-500">Farm fresh • Handpicked quality</p>
          </div>

          <!-- WHY BUY -->
          <section class="px-6 py-4 border-t">
            <h3 class="text-sm font-bold mb-2">🍎 Why buy this?</h3>
            <p class="text-sm text-slate-600">
              {{
                productDetail.description }}
            </p>
          </section>

          <!-- BENEFITS -->
          <section class="px-6 py-4 border-t">
            <h3 class="text-sm font-bold mb-3">💪 Health Benefits</h3>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="benefit in productDetail.benefits"
                :key="benefit"
                class="rounded-full bg-lime-50 border border-lime-200 px-3 py-1 text-xs font-semibold text-lime-700"
              >
                {{ benefit }}
              </span>
            </div>
          </section>

          <!-- NUTRITION -->
          <section class="px-6 py-4 border-t">
            <h3 class="text-sm font-bold mb-3">🥗 Nutritional Info</h3>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div
                class="bg-slate-50 rounded-xl p-3"
                v-for="(key, value) in productDetail.nutrition"
                :key="key"
              >
                <p class="text-xs text-slate-500">{{ key }}</p>
                <p class="font-semibold">{{ value }}</p>
              </div>
            </div>
          </section>

          <!-- STORAGE -->
          <section class="px-6 py-4 border-t">
            <h3 class="text-sm font-bold mb-2">📦 Storage Tips</h3>

            <p class="text-sm text-slate-600">
              {{ productDetail.storage }}
            </p>
          </section>

          <!-- MOBILE CLOSE BUTTON -->
          <div v-if="isMobile" class="sticky bottom-0 border-t p-4 bg-white">
            <button
              class="w-full rounded-2xl bg-lime-400 py-3 text-sm font-semibold text-slate-900 hover:bg-lime-300"
              @click="close"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { fruitDetails, fruitDetails as ProductDetails } from "../constants/fruitDetails";

type Product = {
  name: string;
  variants?: { price: number }[];
};

type ProductDetails = {
  description: string;
  benefits: string[];
  nutrition: Record<string, string>;
  storage: string;
};

const props = defineProps({
  modelValue: Boolean,
  product: {
    type: Object as () => Product,
    required: true,
  },
});

const data: any = ref(fruitDetails)


const productDetail = ref(data.value[props.product.name.toLowerCase()] as ProductDetails);

const emit = defineEmits(["update:modelValue"]);
const isMobile = computed(() => window.innerWidth < 768);

const close = () => {
  emit("update:modelValue", false);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
