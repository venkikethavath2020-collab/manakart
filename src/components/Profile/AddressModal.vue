<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div class="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">

        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            {{ isEditMode ? "Edit Address" : "Add Address" }}
          </h2>

          <button @click="$emit('close')" class="text-xl">×</button>
        </div>

        <AddressForm
          :initialData="initialData"
          @saved="handleSaved"
          @cancel="$emit('close')"
        />

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue"
import AddressForm from "./AddressForm.vue"

const props = defineProps({
  open: Boolean,
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(["close", "saved"])

const isEditMode = computed(() => !!props.initialData?.id)

const handleSaved = () => {
  emit("saved")
  emit("close")
}
</script>