<template>
  <header
    class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
  >
    <div>
      <p class="pill">Admin Panel</p>
      <h3 class="section-title mt-2">Price Control</h3>
      <p class="text-sm text-slate-500">
        Manage fruit prices and availability in real time
      </p>
    </div>

    <div class="flex gap-2">
      <button
        class="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        @click="openAddModal"
      >
        + Add Fruit
      </button>
    </div>
  </header>

  <!-- TABLE (MOBILE SAFE) -->
  <div
    class="relative -mx-6 sm:mx-0 overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 bg-white"
  >
    <div class="min-w-[760px]">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
          <tr>
            <th class="px-4 py-3 text-left">Fruit</th>
            <th class="px-4 py-3 text-left">Price / kg</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <!-- SKELETON -->
          <template v-if="fruitStore.isLoading">
            <tr v-for="n in 6" :key="n" class="animate-pulse">
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-12 w-12 rounded-xl bg-slate-200"></div>
                  <div class="space-y-2">
                    <div class="h-3 w-24 rounded bg-slate-200"></div>
                  </div>
                </div>
              </td>

              <td class="px-4 py-4">
                <div class="h-3 w-16 rounded bg-slate-200"></div>
              </td>

              <td class="px-4 py-4">
                <div class="h-6 w-20 rounded-full bg-slate-200"></div>
              </td>

              <td class="px-4 py-4">
                <div class="flex gap-2">
                  <div class="h-6 w-14 rounded-full bg-slate-200"></div>
                  <div class="h-6 w-14 rounded-full bg-slate-200"></div>
                </div>
              </td>
            </tr>
          </template>

          <!-- REAL DATA -->
          <template v-else>
            <tr
              v-for="fruit in fruits"
              :key="fruit.id"
              class="whitespace-nowrap hover:bg-slate-50 transition"
            >
              <!-- FRUIT -->
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="`/fruits_images/${fruit?.name?.toLowerCase()}.webp`"
                    :alt="fruit?.name"
                    class="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                  />
                  <div>
                    <p class="font-semibold text-slate-900">
                      {{ fruit?.name }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- PRICE -->
              <td class="px-4 py-4 font-semibold text-slate-900">
                ₹{{ fruit?.price_per_kg }}
              </td>

              <!-- STATUS TOGGLE -->
              <td class="px-4 py-4">
                <div class="flex items-center gap-2.5">
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="fruit.available"
                    :disabled="togglingId === fruit.id"
                    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50"
                    :class="fruit.available ? 'bg-lime-500' : 'bg-slate-300'"
                    @click="toggleAvailability(fruit)"
                  >
                    <span
                      class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
                      :class="fruit.available ? 'translate-x-5' : 'translate-x-0.5'"
                    ></span>
                  </button>
                  <span
                    class="text-xs font-semibold"
                    :class="fruit.available ? 'text-lime-700' : 'text-slate-500'"
                  >
                    {{ fruit.available ? "Available" : "Out of stock" }}
                  </span>
                </div>
              </td>

              <!-- ACTIONS -->
              <td class="px-4 py-4">
                <div
                  class="inline-flex shrink-0 gap-1 rounded-full border border-slate-200 bg-slate-50 p-1"
                >
                  <button
                    class="rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm hover:bg-slate-100"
                    @click="openEditModal(fruit.id)"
                  >
                    Edit
                  </button>

                  <button
                    class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-berry-600 shadow-sm hover:bg-berry-50"
                    @click="confirmRemove(fruit.id)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>

  <!-- MODAL -->
  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
    >
      <h4 class="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">
        {{ isEditing ? "Edit Fruit" : "Add Fruit" }}
      </h4>

      <div class="mt-4 space-y-4">
        <label class="block text-sm font-semibold text-slate-700">
          Name
          <input
            v-model="form.name"
            type="text"
            class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-lime-500 focus:ring-2 focus:ring-lime-200"
          />
          <span v-if="errors.name" class="text-xs text-berry-600">
            {{ errors.name }}
          </span>
        </label>

        <label class="block text-sm font-semibold text-slate-700">
          Price / kg
          <input
            v-model.number="form.price_per_kg"
            type="number"
            min="1"
            class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-lime-500 focus:ring-2 focus:ring-lime-200"
          />
          <span v-if="errors.price" class="text-xs text-berry-600">
            {{ errors.price }}
          </span>
        </label>

      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
          class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          @click="closeModal"
        >
          Cancel
        </button>

        <button
          class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          @click="saveFruit"
        >
          {{ isEditing ? "Save Changes" : "Add Fruit" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useFruitsStore } from "../store/fruitsStore";

const fruitStore = useFruitsStore();
const fruits = computed<{ [x: string]: any; id: string }[]>(() => fruitStore.fruits);

/* ---------------- MODAL STATE ---------------- */
const isModalOpen = ref(false);
const editingId = ref<string | null>(null);
const isEditing = computed(() => editingId.value !== null);

/* ---------------- FORM ---------------- */
const form = reactive<any>({
  name: "",
  price_per_kg: 0,
  available: true,
});

const errors = reactive({
  name: "",
  price: "",
});

const resetForm = () => {
  form.name = "";
  form.price_per_kg = 0;
  form.available = true;
  errors.name = "";
  errors.price = "";
};

/* ---------------- VALIDATION ---------------- */
const validate = () => {
  errors.name = form.name.trim() ? "" : "Name is required";
  errors.price = form.price_per_kg > 0 ? "" : "Price must be greater than 0";
  return !errors.name && !errors.price;
};

/* ---------------- MODAL OPEN/CLOSE ---------------- */
const openAddModal = () => {
  resetForm();
  editingId.value = null;
  isModalOpen.value = true;
};

const openEditModal = (id: string) => {
  const fruit = fruits.value.find((f: { id: string }) => f.id === id);
  if (!fruit) return;

  form.name = fruit.name;
  form.price_per_kg = fruit.price_per_kg;
  form.available = fruit.available;
  editingId.value = id;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingId.value = null;
};

const saveFruit = async () => {
  if (!validate()) return;

  if (isEditing.value && editingId.value) {
    await fruitStore.updateFruit(editingId.value, form as any);
    closeModal();
  } else {
    await fruitStore.addFruit({ ...form });
    closeModal();
  }
};

const confirmRemove = async (id: string) => {
  const fruit = fruits.value.find((f: { id: string }) => f.id === id);
  if (!fruit) return;
  if (window.confirm(`Remove ${fruit.name}?`)) {
    await fruitStore.deleteFruit(id);
  }
};

/* ---------------- AVAILABILITY TOGGLE ---------------- */
const togglingId = ref<string | null>(null);

const toggleAvailability = async (fruit: { id: string; available?: boolean }) => {
  if (togglingId.value) return; // ignore rapid double-clicks
  togglingId.value = fruit.id;
  try {
    await fruitStore.updateFruit(fruit.id, { available: !fruit.available });
  } finally {
    togglingId.value = null;
  }
};

onMounted(async () => {
  await fruitStore.fetchFruits();
});
</script>

<style scoped>
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}
</style>
