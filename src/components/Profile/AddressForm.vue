<template>
  <form
    class="mt-4 space-y-5"
    @submit.prevent="saveAddress"
  >
    <!-- =========================
         ADDRESS FIELDS (3-column grid)
    ========================== -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <!-- HOUSE / FLAT -->
      <div>
        <label class="label">
          House / Flat
          <span class="required">*</span>
        </label>
        <input
          v-model="form.house"
          type="text"
          maxlength="100"
          autocomplete="address-line1"
          placeholder="House / Flat"
          class="input"
          :class="{ 'input-error': errors.house }"
          @blur="validateField('house')"
        />
        <p v-if="errors.house" class="error">
          {{ errors.house }}
        </p>
      </div>

      <!-- STREET -->
      <div>
        <label class="label">
          Street / Colony
          <span class="required">*</span>
        </label>
        <input
          v-model="form.street"
          type="text"
          maxlength="150"
          autocomplete="street-address"
          placeholder="Street / Colony"
          class="input"
          :class="{ 'input-error': errors.street }"
          @blur="validateField('street')"
        />
        <p v-if="errors.street" class="error">
          {{ errors.street }}
        </p>
      </div>

      <!-- AREA -->
      <div>
        <label class="label">
          Area
          <span class="required">*</span>
        </label>
        <input
          v-model="form.area"
          type="text"
          maxlength="100"
          placeholder="Area"
          class="input"
          :class="{ 'input-error': errors.area }"
          @blur="validateField('area')"
        />
        <p v-if="errors.area" class="error">
          {{ errors.area }}
        </p>
      </div>

      <!-- PINCODE -->
      <div>
        <label class="label">
          Pincode
          <span class="required">*</span>
        </label>
        <input
          v-model="form.pincode"
          type="text"
          inputmode="numeric"
          autocomplete="postal-code"
          maxlength="6"
          placeholder="6-digit pincode"
          class="input"
          :class="{ 'input-error': errors.pincode }"
          @input="handlePincodeInput"
          @blur="validateField('pincode')"
        />
        <p v-if="errors.pincode" class="error">
          {{ errors.pincode }}
        </p>
      </div>

      <!-- LANDMARK -->
      <div class="md:col-span-2 lg:col-span-2">
        <label class="label">
          Landmark
          <span class="required">*</span>
        </label>
        <input
          v-model="form.landmark"
          type="text"
          maxlength="150"
          placeholder="Nearby landmark"
          class="input"
          :class="{ 'input-error': errors.landmark }"
          @blur="validateField('landmark')"
        />
        <p v-if="errors.landmark" class="error">
          {{ errors.landmark }}
        </p>
      </div>
    </div>

    <!-- =========================
         LOCATION (full width)
    ========================== -->
    <div
      class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100"
        >
          <MapPin class="h-5 w-5 text-green-600" />
        </div>

        <div>
          <p class="font-semibold text-slate-800">
            Delivery Location
            <span class="required">*</span>
          </p>
          <p class="mt-1 text-xs leading-5 text-slate-500">
            Share your current location so our delivery
            partner can find your exact delivery point.
          </p>
        </div>
      </div>

      <!-- LOCATION CONSENT -->
      <label
        class="flex cursor-pointer items-start gap-2 text-sm text-slate-600"
      >
        <input
          v-model="locationConsent"
          type="checkbox"
          class="mt-1 h-4 w-4 accent-green-600"
          @change="handleLocationConsent"
        />
        <span>
          I agree to share my current location
          coordinates for delivery purposes.
        </span>
      </label>

      <!-- GET LOCATION -->
      <button
        v-if="locationConsent && !hasLocation"
        type="button"
        :disabled="locating"
        class="flex w-full items-center justify-center gap-2 rounded-xl border border-green-300 bg-white py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:px-6"
        @click="captureLocation"
      >
        <MapPin class="h-4 w-4" />
        {{
          locating
            ? "Getting your location..."
            : "Use my current location"
        }}
      </button>

      <!-- LOCATION CAPTURED -->
      <div
        v-if="hasLocation"
        class="rounded-xl border border-green-200 bg-green-50 p-3"
      >
        <div class="flex items-center justify-between">
          <div
            class="flex items-center gap-2 text-sm font-semibold text-green-700"
          >
            <MapPin class="h-4 w-4" />
            Location captured
          </div>
          <button
            type="button"
            class="text-xs font-medium text-green-700 underline"
            @click="clearLocation"
          >
            Change
          </button>
        </div>

        <div
          class="mt-2 grid grid-cols-1 gap-1 rounded-lg bg-white p-2 text-xs text-slate-500 sm:grid-cols-2 md:grid-cols-3"
        >
          <div>
            Latitude:
            <span class="font-medium text-slate-700">
              {{ form.latitude?.toFixed(6) }}
            </span>
          </div>
          <div>
            Longitude:
            <span class="font-medium text-slate-700">
              {{ form.longitude?.toFixed(6) }}
            </span>
          </div>
          <div v-if="locationAccuracy">
            Accuracy:
            <span class="font-medium text-slate-700">
              {{ Math.round(locationAccuracy) }}m
            </span>
          </div>
        </div>
      </div>

      <!-- LOCATION ERROR -->
      <p
        v-if="locationError"
        class="rounded-lg bg-red-50 p-2 text-xs text-red-600"
      >
        {{ locationError }}
      </p>

      <!-- LOCATION VALIDATION -->
      <p v-if="errors.location" class="error">
        {{ errors.location }}
      </p>
    </div>

    <!-- =========================
         DEFAULT ADDRESS
    ========================== -->
    <label
      class="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
    >
      <input
        v-model="form.is_default"
        type="checkbox"
        class="h-4 w-4 accent-green-600"
      />
      <span>Set as default address</span>
    </label>

    <!-- =========================
         FORM ERROR
    ========================== -->
    <div
      v-if="formError"
      class="rounded-xl bg-red-50 p-3 text-sm text-red-600"
    >
      {{ formError }}
    </div>

    <!-- =========================
         ACTIONS (Save + Cancel)
    ========================== -->
    <div class="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
      <button
        type="button"
        class="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:w-auto sm:px-8"
        @click="$emit('cancel')"
      >
        Cancel
      </button>

      <button
        type="submit"
        :disabled="loading || locating"
        class="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[160px] sm:px-8"
      >
        {{
          loading
            ? "Saving..."
            : isEditMode
              ? "Update Address"
              : "Save Address"
        }}
      </button>
    </div>
  </form>
</template>



<script setup lang="ts">
import {
  reactive,
  ref,
  computed,
  watch,
} from "vue"

import { MapPin } from "lucide-vue-next"

import { useFruitsStore } from "../../store/fruitsStore"

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  "saved",
  "cancel",
])


const store = useFruitsStore()
const loading = ref(false)

const formError = ref("")

const isEditMode = computed(
  () => !!props.initialData?.id
)

const form = reactive({
  house: "",
  street: "",
  area: "",
  pincode: "",
  landmark: "",
  is_default: false,

  latitude: null as number | null,
  longitude: null as number | null,
})

const errors = reactive({
  house: "",
  street: "",
  area: "",
  pincode: "",
  landmark: "",
  location: "",
})


const locationConsent = ref(false)

const locating = ref(false)

const locationError = ref("")

const locationAccuracy =
  ref<number | null>(null)

const hasLocation = computed(
  () =>
    form.latitude !== null &&
    form.longitude !== null
)

const validateField = (
  field:
    | "house"
    | "street"
    | "area"
    | "pincode"
    | "landmark"
) => {
  errors[field] = ""

  const value = form[field].trim()

  /* HOUSE */

  if (field === "house") {
    if (!value) {
      errors.house =
        "House / Flat is required"
    } else if (value.length < 2) {
      errors.house =
        "Please enter a valid House / Flat"
    }
  }

  /* STREET */

  if (field === "street") {
    if (!value) {
      errors.street =
        "Street / Colony is required"
    } else if (value.length < 2) {
      errors.street =
        "Please enter a valid Street / Colony"
    }
  }

  /* AREA */

  if (field === "area") {
    if (!value) {
      errors.area =
        "Area is required"
    } else if (value.length < 2) {
      errors.area =
        "Please enter a valid Area"
    }
  }

  /* PINCODE */

  if (field === "pincode") {
    if (!value) {
      errors.pincode =
        "Pincode is required"
    } else if (!/^\d{6}$/.test(value)) {
      errors.pincode =
        "Pincode must contain exactly 6 digits"
    }
  }

  /* LANDMARK */

  if (field === "landmark") {
    if (!value) {
      errors.landmark =
        "Landmark is required"
    } else if (value.length < 2) {
      errors.landmark =
        "Please enter a valid landmark"
    }
  }

  return !errors[field]
}


const validateLocation = () => {
  errors.location = ""

  if (!locationConsent.value) {
    errors.location =
      "Please agree to share your location for delivery."
    return false
  }

  if (!hasLocation.value) {
    errors.location =
      "Please capture your current location before saving."
    return false
  }

  return true
}



const validateForm = () => {
  formError.value = ""

  const fieldsValid =
    validateField("house") &&
    validateField("street") &&
    validateField("area") &&
    validateField("pincode") &&
    validateField("landmark")

  const locationValid =
    validateLocation()

  return (
    fieldsValid &&
    locationValid
  )
}


const handlePincodeInput = (
  event: Event
) => {
  const target =
    event.target as HTMLInputElement

  /*
   * Remove everything except numbers.
   *
   * Example:
   * 5000ab97 -> 500097
   *
   * 500 097 -> 500097
   */
  const numericValue =
    target.value
      .replace(/\D/g, "")
      .slice(0, 6)

  form.pincode = numericValue

  /*
   * Keep the actual input synchronized.
   */
  target.value = numericValue

  /*
   * Clear validation while typing a valid
   * 6-digit pincode.
   */
  if (
    numericValue.length === 6
  ) {
    errors.pincode = ""
  }
}



const handleLocationConsent = () => {
  locationError.value = ""
  errors.location = ""

  /*
   * If the user removes consent,
   * remove the stored coordinates too.
   *
   * This is important because we should not
   * submit coordinates after consent was withdrawn.
   */
  if (!locationConsent.value) {
    clearLocation()
  }
}



const captureLocation = () => {
  locationError.value = ""
  errors.location = ""

  if (!locationConsent.value) {
    errors.location =
      "Please agree to share your location first."
    return
  }

  if (!("geolocation" in navigator)) {
    locationError.value =
      "Location is not supported on this device."

    return
  }

  locating.value = true

  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log(
        "Manakart location captured:",
        {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy,
        }
      )

      form.latitude =
        position.coords.latitude

      form.longitude =
        position.coords.longitude

      locationAccuracy.value =
        position.coords.accuracy

      locating.value = false

      locationError.value = ""

      errors.location = ""
    },

    (error) => {
      console.error(
        "Manakart geolocation error:",
        {
          code: error.code,
          message: error.message,
        }
      )

      locating.value = false

      if (
        error.code ===
        error.PERMISSION_DENIED
      ) {
        locationError.value =
          "Location permission was denied. Please allow location access in your browser settings."
      } else if (
        error.code ===
        error.POSITION_UNAVAILABLE
      ) {
        locationError.value =
          "Unable to determine your location. Please check your device location services and try again."
      } else if (
        error.code ===
        error.TIMEOUT
      ) {
        locationError.value =
          "Location request timed out. Please try again."
      } else {
        locationError.value =
          "Unable to get your location. Please try again."
      }
    },

    {
      /*
       * Keep the same working configuration
       * from your original implementation.
       */
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  )
}



const clearLocation = () => {
  form.latitude = null
  form.longitude = null

  locationAccuracy.value = null

  locationError.value = ""

  errors.location = ""
}



watch(
  () => props.initialData,

  (data) => {
    formError.value = ""

    locationError.value = ""

    Object.keys(errors).forEach((key) => {
      errors[
        key as keyof typeof errors
      ] = ""
    })

    if (!data) {
      form.house = ""
      form.street = ""
      form.area = ""
      form.pincode = ""
      form.landmark = ""
      form.is_default = false

      form.latitude = null
      form.longitude = null

      locationConsent.value = false

      locationAccuracy.value = null

      return
    }

    form.house =
      data.house || ""

    form.street =
      data.street || ""

    form.area =
      data.area || ""

    form.pincode =
      data.pincode || ""

    form.landmark =
      data.landmark || ""

    form.is_default =
      data.is_default || false

    form.latitude =
      data.latitude ?? null

    form.longitude =
      data.longitude ?? null

    /*
     * Existing coordinates mean this address
     * already has a captured location.
     */
    locationConsent.value =
      data.latitude != null &&
      data.longitude != null
  },

  {
    immediate: true,
  }
)



const saveAddress = async () => {
  /*
   * Validate everything before touching API.
   */
  if (!validateForm()) {
    return
  }

  loading.value = true

  formError.value = ""

  try {
    /*
     * Create a clean payload.
     *
     * This prevents accidental Vue reactive
     * properties from being sent.
     */
    const payload = {
      house: form.house.trim(),
      street: form.street.trim(),
      area: form.area.trim(),
      pincode: form.pincode,
      landmark: form.landmark.trim(),

      is_default:
        form.is_default,

      latitude:
        form.latitude,

      longitude:
        form.longitude,
    }

    if (isEditMode.value) {
      await store.updateAddress(
        props.initialData.id,
        payload
      )
    } else {
      await store.createAddress(
        payload
      )
    }

    emit("saved")
  } catch (error: any) {
    console.error(
      "Address save failed:",
      error
    )

    formError.value =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to save address. Please try again."
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.input {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  padding: 12px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input:focus {
  border-color: #22c55e;
  box-shadow:
    0 0 0 3px
    rgb(34 197 94 / 10%);
}

.input-error {
  border-color: #ef4444;
}

.input-error:focus {
  border-color: #ef4444;
  box-shadow:
    0 0 0 3px
    rgb(239 68 68 / 10%);
}

.label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.required {
  color: #ef4444;
}

.error {
  margin-top: 5px;
  font-size: 12px;
  color: #ef4444;
}
</style>