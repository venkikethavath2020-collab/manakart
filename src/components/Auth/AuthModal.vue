<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div class="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
      <!-- Close -->
      <button
        class="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
        @click="closeModal"
      >
        ✕
      </button>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-slate-800">
        {{ title }}
      </h2>

      <p class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>

      <!-- Success -->
      <div v-if="successMessage" class="success-box">{{ successMessage }}</div>

      <!-- Error -->
      <div v-if="errorMessage" class="error-box">{{ errorMessage }}</div>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <!-- NAME -->
        <div v-if="mode === 'signup'">
          <label class="label">Full Name</label>
          <input v-model="form.name" class="input" />
          <p class="error">{{ errors.name }}</p>
        </div>

        <!-- PHONE -->
        <div>
          <label class="label">Mobile Number</label>
          <input v-model="form.phone" maxlength="10" class="input" />
          <p class="error">{{ errors.phone }}</p>
        </div>

        <!-- PASSWORD -->
        <div v-if="mode === 'login' || mode === 'signup'">
          <label class="label">Password</label>

          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              class="input pr-10"
            />
            <span class="eye" @click="showPassword = !showPassword">👁️</span>
          </div>

          <p class="error">{{ errors.password }}</p>

          <p v-if="mode === 'login'" class="link" @click="mode = 'forgot'">
            Forgot password?
          </p>
        </div>

        <!-- NEW PASSWORD -->
        <div v-if="mode === 'forgot'">
          <label class="label">New Password</label>

          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="form.newPassword"
              class="input pr-10"
            />
            <span class="eye" @click="showPassword = !showPassword">👁️</span>
          </div>

          <p class="error">{{ errors.newPassword }}</p>
        </div>

        <div
          v-if="mode === 'signup'"
          class="flex items-start gap-2 text-sm text-slate-600"
        >
          <input type="checkbox" v-model="acceptTerms" class="mt-1 accent-lime-600" />

          <span>
            I agree to the
            <button
              type="button"
              class="text-lime-600 font-medium hover:underline"
              @click="showPolicies = true, tabId = 'terms'"
            >
              Terms & Conditions
            </button>
            and
            <button
              type="button"
              class="text-lime-600 font-medium hover:underline"
              @click="showPolicies = true, tabId = 'privacy'"
            >
              Privacy Policy
            </button>
          </span>
        </div>

        <!-- SUBMIT -->
        <button
          :disabled="loading || (mode === 'signup' && !acceptTerms)"
          class="submit-btn"
        >
          {{ loading ? "Please wait..." : buttonText }}
        </button>
      </form>

      <!-- FOOTER SWITCH -->
      <div class="mt-5 text-center text-sm text-slate-600">
        <template v-if="mode === 'login'">
          Don't have an account?
          <span class="link" @click="mode = 'signup'">Signup</span>
        </template>

        <template v-if="mode === 'signup'">
          Already have an account?
          <span class="link" @click="mode = 'login'">Login</span>
        </template>

        <template v-if="mode === 'forgot'">
          Remembered password?
          <span class="link" @click="mode = 'login'">Login</span>
        </template>
      </div>
    </div>
  </div>
  <LegalPolicies
  v-model:open="showPolicies"
  v-model:tab="tabId"
/>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import useAuthStore from "../../store/authStore";
import { useFruitsStore } from "../../store/fruitsStore";
import LegalPolicies from "../Policies/LegalPolicies.vue";

defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue", "authenticated"]);

const authStore = useAuthStore();
const fruitStore = useFruitsStore();

const mode = ref<"login" | "signup" | "forgot">("login");
const loading = ref(false);
const showPassword = ref(false);

const successMessage = ref("");
const errorMessage = ref("");

const form: any = reactive({
  name: "",
  phone: "",
  password: "",
  newPassword: "",
});

const errors: any = reactive({
  name: "",
  phone: "",
  password: "",
  newPassword: "",
});

const acceptTerms = ref(false);
const showPolicies = ref(false);
const tabId = ref('terms')

/* ---------------- COMPUTED ---------------- */

const title = computed(
  () =>
    ({
      login: "Welcome Back 👋",
      signup: "Create Account 🍎",
      forgot: "Reset Password 🔐",
    }[mode.value])
);

const subtitle = computed(
  () =>
    ({
      login: "Login to continue shopping fresh fruits.",
      signup: "Signup to order fresh fruits easily.",
      forgot: "Enter mobile & new password.",
    }[mode.value])
);

const buttonText = computed(
  () =>
    ({
      login: "Login",
      signup: "Signup",
      forgot: "Reset Password",
    }[mode.value])
);

/* ---------------- VALIDATION ---------------- */

const validate = () => {
  Object.keys(errors).forEach((k) => (errors[k] = ""));

  let valid = true;

  if (mode.value === "signup" && !form.name) {
    errors.name = "Full name required";
    valid = false;
  }

  if (!/^[0-9]{10}$/.test(form.phone)) {
    errors.phone = "Enter valid mobile number";
    valid = false;
  }

  if ((mode.value === "login" || mode.value === "signup") && form.password.length < 6) {
    errors.password = "Minimum 6 characters";
    valid = false;
  }

  if (mode.value === "forgot" && form.newPassword.length < 6) {
    errors.newPassword = "Minimum 6 characters";
    valid = false;
  }

  return valid;
};

/* ---------------- SUBMIT ---------------- */

const submit = async () => {
  if (!validate()) return;

  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    if (mode.value === "login") {
      const res: any = await authStore.login(form);

      if (res.success) {
        successMessage.value = "Login successful 🎉";
        await fetchInitialData();
        emit("authenticated");
        setTimeout(closeModal, 800);
      } else errorMessage.value = res.message;
    }

    if (mode.value === "signup") {
      const res: any = await authStore.signUp(form);

      if (res.success) {
        successMessage.value = "Signup successful 🎉";
        mode.value = "login";
      } else errorMessage.value = res.message;
    }

    if (mode.value === "forgot") {
      const res: any = await authStore.resetPassword({
        phone: form.phone,
        newPassword: form.newPassword,
      });

      if (res.success) {
        successMessage.value = "Password reset successful ✅";
        mode.value = "login";
      } else errorMessage.value = res.message;
    }
  } catch {
    errorMessage.value = "Something went wrong";
  }

  loading.value = false;
};

/* ---------------- HELPERS ---------------- */

const fetchInitialData = async () => {
  await fruitStore.fetchAddresses();
  await fruitStore.fetchOrders();
};

const closeModal = () => {
  emit("update:modelValue", false);

  mode.value = "login";
  Object.keys(form).forEach((k) => (form[k] = ""));
  Object.keys(errors).forEach((k) => (errors[k] = ""));
  successMessage.value = "";
  errorMessage.value = "";
};
</script>

<style scoped>
.input {
  @apply mt-1 w-full rounded-xl border border-slate-300 p-3;
}
.label {
  @apply text-sm font-medium text-slate-700;
}
.error {
  @apply text-xs text-red-500 mt-1;
}
.success-box {
  @apply mt-4 rounded-xl bg-green-100 p-3 text-sm text-green-700;
}
.error-box {
  @apply mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-700;
}
.submit-btn {
  @apply w-full rounded-xl bg-gradient-to-r from-lime-500 to-green-600 py-3 font-semibold text-white shadow-md disabled:opacity-50;
}
.link {
  @apply ml-1 font-semibold text-green-600 hover:underline cursor-pointer;
}
.eye {
  @apply absolute right-3 top-3 cursor-pointer text-slate-500;
}
</style>
