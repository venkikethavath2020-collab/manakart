<template>
  <form class="mt-4 space-y-4" @submit.prevent="saveAddress">
    <input v-model="form.house" placeholder="House / Flat" class="input" required />
    <input v-model="form.street" placeholder="Street / Colony" class="input" required />
    <input v-model="form.area" placeholder="Area" class="input" required />
    <input v-model="form.pincode" placeholder="Pincode" class="input" required />
    <input v-model="form.landmark" placeholder="Landmark (Optional)" class="input" />

    <!-- LIVE LOCATION (with consent) -->
    <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
      <label class="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" v-model="locationConsent" class="mt-0.5" />
        <span>
          Share my current location so the delivery rider can navigate to my exact spot.
        </span>
      </label>

      <button
        v-if="locationConsent && !hasLocation"
        type="button"
        :disabled="locating"
        class="flex w-full items-center justify-center gap-2 rounded-xl border border-green-300 bg-white py-2.5 text-sm font-semibold text-green-700 disabled:opacity-50"
        @click="captureLocation"
      >
        <MapPin class="h-4 w-4" />
        {{ locating ? "Getting location…" : "Use my current location" }}
      </button>

      <div
        v-if="hasLocation"
        class="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
      >
        <span class="flex items-center gap-1.5">
          <MapPin class="h-4 w-4" /> Location captured ✓
        </span>
        <button type="button" class="text-xs text-green-600 underline" @click="clearLocation">
          Clear
        </button>
      </div>

      <p v-if="locationError" class="text-xs text-red-500">{{ locationError }}</p>
    </div>

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
import { MapPin } from "lucide-vue-next"
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

const form = reactive<{
  house: string
  street: string
  area: string
  pincode: string
  landmark: string
  is_default: boolean
  latitude: number | null
  longitude: number | null
}>({
  house: "",
  street: "",
  area: "",
  pincode: "",
  landmark: "",
  is_default: false,
  latitude: null,
  longitude: null,
})

/* ---------------- LIVE LOCATION ---------------- */
const locationConsent = ref(false)
const locating = ref(false)
const locationError = ref("")

const hasLocation = computed(() => form.latitude != null && form.longitude != null)

const captureLocation = () => {
  locationError.value = ""

  if (!("geolocation" in navigator)) {
    locationError.value = "Location is not supported on this device."
    return
  }

  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.latitude = pos.coords.latitude
      form.longitude = pos.coords.longitude
      locating.value = false
    },
    (err) => {
      locating.value = false
      locationError.value =
        err.code === err.PERMISSION_DENIED
          ? "Location permission denied. You can still save without it."
          : "Couldn't get your location. Please try again."
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

const clearLocation = () => {
  form.latitude = null
  form.longitude = null
}

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
    form.latitude = data.latitude ?? null
    form.longitude = data.longitude ?? null
    // Pre-tick consent when editing an address that already has coords.
    locationConsent.value = data.latitude != null && data.longitude != null
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
