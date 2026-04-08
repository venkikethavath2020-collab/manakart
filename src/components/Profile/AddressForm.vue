<template>
  <form class="mt-4 space-y-4" @submit.prevent="saveAddress">
    <input v-model="form.house" placeholder="House / Flat" class="input" required />
    <input v-model="form.street" placeholder="Street / Colony" class="input" required />
    <input v-model="form.area" placeholder="Area" class="input" required />
    <input v-model="form.pincode" placeholder="Pincode" class="input" required />
    <input v-model="form.landmark" placeholder="Landmark (Optional)" class="input" />

    <div class="flex items-center gap-2">
      <input type="checkbox" v-model="form.is_default" />
      <label class="text-sm text-slate-600">Set as default address</label>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-50"
    >
      {{ loading ? "Saving..." : (isEditMode ? "Update Address" : "Save Address") }}
    </button>

    <button
      type="button"
      class="w-full text-sm text-slate-500"
      @click="$emit('cancel')"
    >
      Cancel
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue"
import { useFruitsStore } from "../../store/fruitsStore"

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(["saved", "cancel"])

const store = useFruitsStore()
const loading = ref(false)

const isEditMode = computed(() => !!props.initialData?.id)

const form = reactive({
  house: "",
  street: "",
  area: "",
  pincode: "",
  landmark: "",
  is_default: false
})

watch(
  () => props.initialData,
  (data) => {
    if (!data) return

    form.house = data.house || ""
    form.street = data.street || ""
    form.area = data.area || ""
    form.pincode = data.pincode || ""
    form.landmark = data.landmark || ""
    form.is_default = data.is_default || false
  },
  { immediate: true }
)

const saveAddress = async () => {
  loading.value = true

  if (isEditMode.value) {
    await store.updateAddress(props.initialData.id, form)
  } else {
    await store.createAddress(form)
  }

  loading.value = false
  emit("saved")
}
</script>

<style scoped>
.input {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #ddd;
  padding: 12px;
}
</style>