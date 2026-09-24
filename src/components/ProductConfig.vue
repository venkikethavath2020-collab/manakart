<template>
  <section>
    <header class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-lime-700">Catalog</p>
        <h3 class="mt-1 text-xl font-bold text-slate-900">Products & pricing</h3>
        <p class="mt-1 text-sm text-slate-500">Products must have at least one sellable variant.</p>
      </div>
      <button type="button" class="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400" @click="openAdd">+ Add product</button>
    </header>

    <div class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div v-if="!store.fruits.length && !store.loading" class="p-10 text-center text-sm text-slate-500">No products yet. Add your first product to start selling.</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-[820px] w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr><th class="px-5 py-3">Product</th><th class="px-5 py-3">Category</th><th class="px-5 py-3">Variants</th><th class="px-5 py-3">Availability</th><th class="px-5 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="product in store.fruits" :key="product.id" class="hover:bg-slate-50/70">
              <td class="px-5 py-4"><p class="font-semibold text-slate-900">{{ product.name }}</p><p v-if="product.description" class="mt-0.5 max-w-48 truncate text-xs text-slate-500">{{ product.description }}</p></td>
              <td class="px-5 py-4 text-slate-600">{{ product.category.name }}</td>
              <td class="px-5 py-4"><div class="flex flex-wrap gap-1.5"><span v-for="variant in product.variants" :key="variant.id" class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{{ variant.unit_label }} · ₹{{ variant.price }}</span></div></td>
              <td class="px-5 py-4"><button type="button" role="switch" :aria-checked="product.available" :disabled="togglingId === product.id" class="inline-flex items-center gap-2 disabled:cursor-wait disabled:opacity-60" @click="toggleAvailability(product)"><span class="relative inline-flex h-6 w-11 items-center rounded-full transition" :class="product.available ? 'bg-lime-500' : 'bg-slate-300'"><span class="h-5 w-5 rounded-full bg-white shadow transition" :class="product.available ? 'translate-x-5' : 'translate-x-0.5'"></span></span><span class="text-xs font-semibold" :class="product.available ? 'text-lime-700' : 'text-slate-500'">{{ product.available ? 'Available' : 'Unavailable' }}</span></button></td>
              <td class="px-5 py-4 text-right"><button type="button" class="mr-3 font-semibold text-lime-700 hover:text-lime-800" @click="openEdit(product)">Edit</button><button type="button" class="font-semibold text-red-600 hover:text-red-700" @click="remove(product)">Delete</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 sm:p-8">
      <form class="mx-auto my-4 max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl" @submit.prevent="save">
        <header class="flex items-start justify-between border-b border-slate-200 px-6 py-5"><div><h4 class="text-xl font-bold text-slate-900">{{ editingId ? 'Edit product' : 'Add product' }}</h4><p class="mt-1 text-sm text-slate-500">Set product details, then add its purchasable options.</p></div><button type="button" class="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100" aria-label="Close" @click="close">✕</button></header>
        <div class="space-y-7 p-6">
          <div v-if="error" role="alert" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

          <section><h5 class="text-sm font-bold text-slate-900">Product details</h5><div class="mt-3 grid gap-4 sm:grid-cols-2">
            <label class="field"><span>Name <b>*</b></span><input v-model.trim="form.name" required placeholder="e.g. Chopped Banana" /></label>
            <label class="field"><span>Category <b>*</b></span><select v-model="form.category_id" required><option value="" disabled>Select a category</option><option v-for="category in availableCategories" :key="category.id" :value="category.id">{{ category.name }}</option></select></label>
            <label class="field sm:col-span-2"><span>Description</span><textarea v-model.trim="form.description" rows="2" placeholder="Optional customer-facing description" /></label>
            <label class="field"><span>Image URL</span><input v-model.trim="form.image_url" placeholder="/fruits_images/banana.webp" /></label>
            <label class="field"><span>Display order</span><input v-model.number="form.sort_order" type="number" min="0" /></label>
            <label class="flex items-center gap-2 text-sm font-medium text-slate-700"><input v-model="form.available" type="checkbox" class="h-4 w-4 accent-lime-600" /> Product is available to customers</label>
          </div></section>

          <section class="border-t border-slate-200 pt-6"><div class="flex flex-wrap items-center justify-between gap-2"><div><h5 class="text-sm font-bold text-slate-900">Selling variants <span class="text-red-600">*</span></h5><p class="mt-1 text-xs text-slate-500">Each variant needs a unit, label, and price.</p></div><button type="button" class="rounded-lg border border-lime-300 bg-lime-50 px-3 py-2 text-xs font-bold text-lime-800 hover:bg-lime-100" @click="addVariant">+ Add variant</button></div>
            <div class="mt-4 space-y-3"><div v-for="(variant, index) in form.variants" :key="index" class="rounded-xl border border-slate-200 bg-slate-50 p-4"><div class="mb-3 flex items-center justify-between"><p class="text-sm font-bold text-slate-700">Variant {{ index + 1 }}</p><button type="button" :disabled="form.variants.length === 1" class="text-xs font-semibold text-red-600 disabled:text-slate-300" @click="removeVariant(index)">Remove</button></div><div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label class="field"><span>Unit type</span><select v-model="variant.unit_type"><option v-for="type in unitTypes" :key="type" :value="type">{{ type }}</option></select></label><label class="field"><span>Quantity</span><input v-model.number="variant.unit_quantity" type="number" min="0.01" step="any" required /></label><label class="field"><span>Customer label</span><input v-model.trim="variant.unit_label" required placeholder="e.g. 250g" /></label><label class="field"><span>Price (₹)</span><input v-model.number="variant.price" type="number" min="0" required /></label></div><label class="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-600"><input v-model="variant.available" type="checkbox" class="accent-lime-600" /> This variant is available</label></div></div>
          </section>
        </div>
        <footer class="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end"><button type="button" class="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200" @click="close">Cancel</button><button :disabled="saving" class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{{ saving ? 'Saving…' : editingId ? 'Save changes' : 'Create product' }}</button></footer>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useFruitsStore } from '../store/fruitsStore';
import type { Product } from '../types/catalog';

type VariantDraft = { unit_type: string; unit_quantity: number; unit_label: string; price: number; available: boolean; sort_order: number };
const store = useFruitsStore();
const open = ref(false); const saving = ref(false); const editingId = ref<string | null>(null); const togglingId = ref<string | null>(null); const error = ref('');
const unitTypes = ['weight', 'count', 'bunch', 'packet', 'volume'];
const blankVariant = (): VariantDraft => ({ unit_type: 'weight', unit_quantity: 250, unit_label: '250g', price: 0, available: true, sort_order: 100 });
const form = reactive<{ name: string; category_id: string; description: string; image_url: string; available: boolean; sort_order: number; variants: VariantDraft[] }>({ name: '', category_id: '', description: '', image_url: '', available: true, sort_order: 100, variants: [blankVariant()] });
const availableCategories = computed(() => store.categories.filter((category) => category.available !== false));

function reset() { Object.assign(form, { name: '', category_id: '', description: '', image_url: '', available: true, sort_order: 100, variants: [blankVariant()] }); error.value = ''; }
function close() { open.value = false; error.value = ''; }
function openAdd() { reset(); editingId.value = null; open.value = true; }
function openEdit(product: Product) { Object.assign(form, { name: product.name, category_id: product.category_id, description: product.description || '', image_url: product.image_url || '', available: product.available, sort_order: product.sort_order, variants: product.variants.map(({ unit_type, unit_quantity, unit_label, price, available, sort_order }) => ({ unit_type, unit_quantity: Number(unit_quantity), unit_label, price: Number(price), available, sort_order })) }); editingId.value = product.id; error.value = ''; open.value = true; }
function addVariant() { form.variants.push(blankVariant()); }
function removeVariant(index: number) { if (form.variants.length > 1) form.variants.splice(index, 1); }
function payload() { return { ...form, variants: form.variants.map((variant, index) => ({ ...variant, sort_order: (index + 1) * 10 })) }; }

async function save() {
  if (!form.category_id) { error.value = 'Choose a category before saving.'; return; }
  if (!form.variants.length) { error.value = 'Add at least one selling variant.'; return; }
  saving.value = true; error.value = '';
  try { if (editingId.value) await store.updateFruit(editingId.value, payload()); else await store.addFruit(payload()); close(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not save this product. Check the fields and try again.'; }
  finally { saving.value = false; }
}
async function remove(product: Product) { if (window.confirm(`Delete ${product.name}? This cannot be undone.`)) await store.deleteFruit(product.id); }
async function toggleAvailability(product: Product) {
  if (togglingId.value) return; togglingId.value = product.id;
  try { await store.updateFruit(product.id, { name: product.name, category_id: product.category_id, description: product.description, image_url: product.image_url, sort_order: product.sort_order, available: !product.available, variants: product.variants }); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not change availability.'; }
  finally { togglingId.value = null; }
}
onMounted(async () => { await Promise.all([store.fetchFruits(), store.fetchCategories()]); });
</script>

<style scoped>
.field { @apply flex flex-col gap-1.5 text-sm font-medium text-slate-700; }
.field > span { @apply text-xs font-semibold text-slate-600; }
.field b { @apply text-red-600; }
.field input, .field select, .field textarea { @apply w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100; }
</style>

