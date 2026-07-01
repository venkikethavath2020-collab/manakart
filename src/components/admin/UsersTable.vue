<template>
  <section class="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 class="section-title">Customers</h3>
        <p class="text-sm text-slate-500">Everyone who signed up</p>
      </div>

      <div class="relative">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="query"
          placeholder="Search name or phone…"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-lime-400 focus:ring-2 focus:ring-lime-200 sm:w-64"
        />
      </div>
    </header>

    <!-- SUMMARY -->
    <div class="grid grid-cols-3 gap-3">
      <div class="rounded-2xl bg-slate-50 p-3 text-center">
        <p class="font-display text-xl font-extrabold text-slate-900">{{ users.length }}</p>
        <p class="text-xs text-slate-500">Total users</p>
      </div>
      <div class="rounded-2xl bg-lime-50 p-3 text-center">
        <p class="font-display text-xl font-extrabold text-lime-700">{{ activeBuyers }}</p>
        <p class="text-xs text-slate-500">With orders</p>
      </div>
      <div class="rounded-2xl bg-mango-50 p-3 text-center">
        <p class="font-display text-xl font-extrabold text-mango-600">{{ adminCount }}</p>
        <p class="text-xs text-slate-500">Admins</p>
      </div>
    </div>

    <div v-if="isLoading" class="py-8 text-center text-slate-500">Loading customers…</div>

    <div v-else-if="!filtered.length" class="py-12 text-center">
      <Users class="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <p class="font-medium text-slate-500">No customers found</p>
    </div>

    <!-- TABLE (desktop) -->
    <div v-else class="hidden overflow-hidden rounded-2xl border border-slate-200 sm:block">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
          <tr>
            <th class="px-4 py-2.5 text-left">Customer</th>
            <th class="px-4 py-2.5 text-left">Phone</th>
            <th class="px-4 py-2.5 text-center">Orders</th>
            <th class="px-4 py-2.5 text-right">Spent</th>
            <th class="px-4 py-2.5 text-left">Joined</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="u in filtered" :key="u.id" class="hover:bg-slate-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  {{ (u.name || 'U').charAt(0).toUpperCase() }}
                </span>
                <span class="font-medium text-slate-800">{{ u.name }}</span>
                <span v-if="u.role === 'admin'" class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Admin</span>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ u.phone }}</td>
            <td class="px-4 py-3 text-center font-semibold text-slate-800">{{ u.order_count }}</td>
            <td class="px-4 py-3 text-right font-semibold text-slate-800">₹{{ u.total_spent }}</td>
            <td class="px-4 py-3 text-xs text-slate-400">{{ formatDate(u.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CARDS (mobile) -->
    <div v-if="!isLoading && filtered.length" class="space-y-2 sm:hidden">
      <div
        v-for="u in filtered"
        :key="u.id"
        class="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"
      >
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
          {{ (u.name || 'U').charAt(0).toUpperCase() }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-slate-800">
            {{ u.name }}
            <span v-if="u.role === 'admin'" class="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">Admin</span>
          </p>
          <p class="text-xs text-slate-500">{{ u.phone }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold text-slate-900">₹{{ u.total_spent }}</p>
          <p class="text-[11px] text-slate-400">{{ u.order_count }} orders</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Search, Users } from "lucide-vue-next";
import apiClient from "../../service/axios";

const users = ref<any[]>([]);
const isLoading = ref(false);
const query = ref("");

const fetchUsers = async () => {
  try {
    isLoading.value = true;
    const res = await apiClient.get("/users/all");
    users.value = res.data || [];
  } finally {
    isLoading.value = false;
  }
};

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim();
  if (!q) return users.value;
  return users.value.filter(
    (u) => u.name?.toLowerCase().includes(q) || u.phone?.includes(q)
  );
});

const activeBuyers = computed(() => users.value.filter((u) => u.order_count > 0).length);
const adminCount = computed(() => users.value.filter((u) => u.role === "admin").length);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", { dateStyle: "medium" });

onMounted(fetchUsers);
</script>
