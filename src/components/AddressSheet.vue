<template>
    <div
      class="fixed inset-0 z-50 transition"
      :class="open ? 'pointer-events-auto' : 'pointer-events-none'"
    >
      <!-- BACKDROP -->
      <div
        class="absolute inset-0 bg-black/40 transition-opacity"
        :class="open ? 'opacity-100' : 'opacity-0'"
        @click="$emit('close')"
      />
  
      <!-- LEFT DRAWER -->
      <aside
        class="absolute left-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 flex flex-col"
        :class="open ? 'translate-x-0' : '-translate-x-full'"
      >
        <!-- HEADER -->
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="font-semibold text-lg">Select Address</h3>
  
          <button @click="$emit('close')" class="p-2 rounded-full hover:bg-slate-100">
            ✕
          </button>
        </div>
  
        <!-- ADDRESS LIST -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            @click="$emit('select', addr); $emit('close')"
            class="border rounded-xl p-3 cursor-pointer transition"
            :class="
              selected?.id === addr.id
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200'
            "
          >
            <div class="flex justify-between items-start">
              <p class="font-semibold">{{ addr.house }}</p>
  
              <span
                v-if="addr.is_default"
                class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
              >
                DEFAULT
              </span>
            </div>
  
            <p class="text-xs text-slate-600">
              {{ addr.street }}, {{ addr.area }}
            </p>
  
            <p class="text-xs text-slate-500">
              {{ addr.landmark }}
            </p>
  
            <p class="text-xs font-medium mt-1">
              {{ addr.pincode }}
            </p>
          </div>
        </div>
  
        <!-- FOOTER CTA (optional future use) -->
        <!--
        <div class="p-4 border-t">
          <button class="w-full bg-green-500 text-white py-3 rounded-xl">
            + Add New Address
          </button>
        </div>
        -->
      </aside>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    open: boolean;
    addresses: any[];
    selected: any;
  }>();
  
  defineEmits(["close", "select"]);
  </script>