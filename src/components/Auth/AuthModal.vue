<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div
      class="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
    >
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

      <p class="mt-1 text-sm text-slate-500">
        {{ subtitle }}
      </p>

      <!-- Success -->
      <div
        v-if="successMessage"
        class="mt-4 rounded-xl bg-green-100 p-3 text-sm text-green-700"
      >
        {{ successMessage }}
      </div>

      <!-- Error -->
      <div
        v-if="errorMessage"
        class="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>

      <!-- ============================= -->
      <!-- LOGIN / SIGNUP FORM -->
      <!-- ============================= -->

      <form
        v-if="
          mode === 'login' ||
          mode === 'signup'
        "
        class="mt-6 space-y-4"
        @submit.prevent="submit"
      >
        <!-- NAME -->
        <div v-if="mode === 'signup'">
          <label class="label">Full Name</label>

          <input
            v-model="form.name"
            type="text"
            autocomplete="name"
            class="input"
            placeholder="Enter your full name"
          />

          <p class="error">
            {{ errors.name }}
          </p>
        </div>

        <!-- PHONE -->
        <div>
          <label class="label">Mobile Number</label>

          <input
            v-model="form.phone"
            type="tel"
            inputmode="numeric"
            maxlength="10"
            autocomplete="tel"
            class="input"
            placeholder="10-digit mobile number"
            @input="handlePhoneInput"
          />

          <p class="error">
            {{ errors.phone }}
          </p>
        </div>

        <!-- EMAIL - SIGNUP -->
        <div v-if="mode === 'signup'">
          <label class="label">Email Address</label>

          <input
            v-model="form.email"
            type="email"
            autocomplete="email"
            class="input"
            placeholder="Enter your email"
          />

          <p class="error">
            {{ errors.email }}
          </p>
        </div>

        <!-- PASSWORD -->
        <div>
          <label class="label">Password</label>

          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              class="input pr-10"
              placeholder="Enter your password"
            />

            <button
              type="button"
              class="eye"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "🙈" : "👁️" }}
            </button>
          </div>

          <p class="error">
            {{ errors.password }}
          </p>

          <!-- Forgot Password -->
          <button
            v-if="mode === 'login'"
            type="button"
            class="mt-1 text-sm font-semibold text-green-600 hover:underline"
            @click="startForgotPassword"
          >
            Forgot password?
          </button>
        </div>

        <!-- TERMS -->
        <div
          v-if="mode === 'signup'"
          class="flex items-start gap-2 text-sm text-slate-600"
        >
          <input
            v-model="acceptTerms"
            type="checkbox"
            class="mt-1 accent-lime-600"
          />

          <span>
            I agree to the

            <button
              type="button"
              class="font-medium text-lime-600 hover:underline"
              @click="
                showPolicies = true;
                tabId = 'terms';
              "
            >
              Terms & Conditions
            </button>

            and

            <button
              type="button"
              class="font-medium text-lime-600 hover:underline"
              @click="
                showPolicies = true;
                tabId = 'privacy';
              "
            >
              Privacy Policy
            </button>
          </span>
        </div>

        <!-- SUBMIT -->
        <button
          :disabled="
            loading ||
            (mode === 'signup' && !acceptTerms)
          "
          class="submit-btn"
        >
          {{
            loading
              ? "Please wait..."
              : buttonText
          }}
        </button>
      </form>

      <!-- ============================= -->
      <!-- FORGOT PASSWORD - EMAIL -->
      <!-- ============================= -->

      <form
        v-if="mode === 'forgot-email'"
        class="mt-6 space-y-4"
        @submit.prevent="sendOtp"
      >
        <div>
          <label class="label">
            Email Address
          </label>

          <input
            v-model="form.email"
            type="email"
            autocomplete="email"
            class="input"
            placeholder="Enter your registered email"
          />

          <p class="error">
            {{ errors.email }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="submit-btn"
        >
          {{
            loading
              ? "Sending OTP..."
              : "Send OTP"
          }}
        </button>
      </form>

      <!-- ============================= -->
      <!-- FORGOT PASSWORD - OTP -->
      <!-- ============================= -->

      <form
        v-if="mode === 'forgot-otp'"
        class="mt-6 space-y-5"
        @submit.prevent="verifyOtp"
      >
        <!-- Email -->
        <div
          class="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"
        >
          OTP sent to

          <span class="font-semibold text-slate-800">
            {{ maskedEmail }}
          </span>
        </div>

        <!-- OTP -->
        <div>
          <label class="label">
            Enter 6-digit OTP
          </label>

          <input
            v-model="form.otp"
            type="text"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            class="input text-center text-xl font-bold tracking-[0.5em]"
            placeholder="••••••"
            @input="handleOtpInput"
          />

          <p class="error">
            {{ errors.otp }}
          </p>
        </div>

        <!-- Verify -->
        <button
          type="submit"
          :disabled="loading"
          class="submit-btn"
        >
          {{
            loading
              ? "Verifying..."
              : "Verify OTP"
          }}
        </button>

        <!-- Resend -->
        <div class="text-center text-sm text-slate-600">
          <span v-if="resendCountdown > 0">
            Resend OTP in
            <span class="font-semibold text-green-600">
              {{ resendCountdown }}s
            </span>
          </span>

          <button
            v-else
            type="button"
            class="font-semibold text-green-600 hover:underline"
            :disabled="loading"
            @click="sendOtp"
          >
            Resend OTP
          </button>
        </div>

        <!-- Change email -->
        <div class="text-center">
          <button
            type="button"
            class="text-sm font-medium text-slate-500 hover:text-green-600"
            @click="mode = 'forgot-email'"
          >
            ← Change email
          </button>
        </div>
      </form>

      <!-- ============================= -->
      <!-- FORGOT PASSWORD - NEW PASSWORD -->
      <!-- ============================= -->

      <form
        v-if="mode === 'forgot-password'"
        class="mt-6 space-y-4"
        @submit.prevent="resetPassword"
      >
        <div>
          <label class="label">
            New Password
          </label>

          <div class="relative">
            <input
              v-model="form.newPassword"
              :type="
                showPassword
                  ? 'text'
                  : 'password'
              "
              autocomplete="new-password"
              class="input pr-10"
              placeholder="Enter new password"
            />

            <button
              type="button"
              class="eye"
              @click="
                showPassword = !showPassword
              "
            >
              {{ showPassword ? "🙈" : "👁️" }}
            </button>
          </div>

          <p class="error">
            {{ errors.newPassword }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="label">
            Confirm Password
          </label>

          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="
                showConfirmPassword
                  ? 'text'
                  : 'password'
              "
              autocomplete="new-password"
              class="input pr-10"
              placeholder="Confirm new password"
            />

            <button
              type="button"
              class="eye"
              @click="
                showConfirmPassword =
                  !showConfirmPassword
              "
            >
              {{
                showConfirmPassword
                  ? "🙈"
                  : "👁️"
              }}
            </button>
          </div>

          <p class="error">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="submit-btn"
        >
          {{
            loading
              ? "Resetting..."
              : "Reset Password"
          }}
        </button>
      </form>

      <!-- ============================= -->
      <!-- FOOTER -->
      <!-- ============================= -->

      <div
        class="mt-5 text-center text-sm text-slate-600"
      >
        <!-- LOGIN -->
        <template v-if="mode === 'login'">
          Don't have an account?

          <button
            type="button"
            class="link"
            @click="switchMode('signup')"
          >
            Signup
          </button>
        </template>

        <!-- SIGNUP -->
        <template v-if="mode === 'signup'">
          Already have an account?

          <button
            type="button"
            class="link"
            @click="switchMode('login')"
          >
            Login
          </button>
        </template>

        <!-- FORGOT EMAIL -->
        <template v-if="mode === 'forgot-email'">
          Remembered your password?

          <button
            type="button"
            class="link"
            @click="switchMode('login')"
          >
            Login
          </button>
        </template>

        <!-- FORGOT OTP -->
        <template v-if="mode === 'forgot-otp'">
          Remembered your password?

          <button
            type="button"
            class="link"
            @click="switchMode('login')"
          >
            Login
          </button>
        </template>

        <!-- FORGOT PASSWORD -->
        <template v-if="mode === 'forgot-password'">
          Remembered your password?

          <button
            type="button"
            class="link"
            @click="switchMode('login')"
          >
            Login
          </button>
        </template>
      </div>
    </div>
  </div>

  <!-- Legal Policies -->
  <LegalPolicies
    v-model:open="showPolicies"
    v-model:tab="tabId"
  />
</template>

<script setup lang="ts">
import {
  reactive,
  ref,
  computed,
  onUnmounted,
} from "vue";

import useAuthStore from "../../store/authStore";
import { useFruitsStore } from "../../store/fruitsStore";
import LegalPolicies from "../Policies/LegalPolicies.vue";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits([
  "update:modelValue",
  "authenticated",
]);

const authStore = useAuthStore();
const fruitStore = useFruitsStore();

/* ==================================================
   MODE
================================================== */

type AuthMode =
  | "login"
  | "signup"
  | "forgot-email"
  | "forgot-otp"
  | "forgot-password";

const mode = ref<AuthMode>("login");

/* ==================================================
   STATE
================================================== */

const loading = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const successMessage = ref("");
const errorMessage = ref("");

const resendCountdown = ref(0);

let countdownTimer: ReturnType<
  typeof setInterval
> | null = null;

/* ==================================================
   FORM
================================================== */

const form = reactive({
  name: "",
  phone: "",
  email: "",
  password: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
});

/* ==================================================
   ERRORS
================================================== */

const errors = reactive({
  name: "",
  phone: "",
  email: "",
  password: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
});

/* ==================================================
   OTHER
================================================== */

const acceptTerms = ref(false);

const showPolicies = ref(false);

const tabId = ref<"terms" | "privacy">(
  "terms"
);

/*
 * This token is received after OTP verification.
 * It is only kept in memory and never stored in localStorage.
 */
const resetToken = ref("");

/* ==================================================
   COMPUTED
================================================== */

const title = computed(() => {
  const titles: Record<AuthMode, string> = {
    login: "Welcome Back 👋",
    signup: "Create Account 🍎",
    "forgot-email": "Reset Password 🔐",
    "forgot-otp": "Verify OTP 🔢",
    "forgot-password": "Create New Password 🔐",
  };

  return titles[mode.value];
});

const subtitle = computed(() => {
  const subtitles: Record<AuthMode, string> = {
    login:
      "Login to continue shopping fresh fruits.",

    signup:
      "Signup to order fresh fruits easily.",

    "forgot-email":
      "Enter your registered email to receive an OTP.",

    "forgot-otp":
      "Enter the OTP sent to your email.",

    "forgot-password":
      "Create a new password for your account.",
  };

  return subtitles[mode.value];
});

const buttonText = computed(() => {
  const buttons: Record<AuthMode, string> = {
    login: "Login",
    signup: "Signup",
    "forgot-email": "Send OTP",
    "forgot-otp": "Verify OTP",
    "forgot-password": "Reset Password",
  };

  return buttons[mode.value];
});

/* ==================================================
   MASK EMAIL
================================================== */

const maskedEmail = computed(() => {
  const email = form.email;

  if (!email || !email.includes("@")) {
    return email;
  }

  const [username, domain] =
    email.split("@");

  if (username && username.length <= 2) {
    return `${username[0] || ""}***@${domain}`;
  }

  return `${(username ?? "").slice(
    0,
    2
  )}***@${domain}`;
});

/* ==================================================
   VALIDATION
================================================== */

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = "";
  });
};

const validateEmail = () => {
  if (!form.email) {
    errors.email = "Email is required";
    return false;
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      form.email.trim()
    )
  ) {
    errors.email = "Enter a valid email address";
    return false;
  }

  return true;
};

const validate = () => {
  clearErrors();

  let valid = true;

  /* LOGIN / SIGNUP */

  if (mode.value === "signup") {
    if (!form.name.trim()) {
      errors.name = "Full name required";
      valid = false;
    }

    if (!validateEmail()) {
      valid = false;
    }
  }

  if (
    mode.value === "login" ||
    mode.value === "signup"
  ) {
    if (!/^[0-9]{10}$/.test(form.phone)) {
      errors.phone =
        "Enter valid mobile number";
      valid = false;
    }

    if (form.password.length < 6) {
      errors.password =
        "Minimum 6 characters";
      valid = false;
    }
  }

  return valid;
};

const validateOtp = () => {
  errors.otp = "";

  if (!/^\d{6}$/.test(form.otp)) {
    errors.otp = "Enter a valid 6-digit OTP";
    return false;
  }

  return true;
};

const validateNewPassword = () => {
  errors.newPassword = "";
  errors.confirmPassword = "";

  let valid = true;

  if (form.newPassword.length < 6) {
    errors.newPassword =
      "Minimum 6 characters";
    valid = false;
  }

  if (
    form.newPassword !==
    form.confirmPassword
  ) {
    errors.confirmPassword =
      "Passwords do not match";
    valid = false;
  }

  return valid;
};

/* ==================================================
   PHONE INPUT
================================================== */

const handlePhoneInput = () => {
  form.phone = form.phone
    .replace(/\D/g, "")
    .slice(0, 10);
};

/* ==================================================
   OTP INPUT
================================================== */

const handleOtpInput = () => {
  form.otp = form.otp
    .replace(/\D/g, "")
    .slice(0, 6);
};

/* ==================================================
   LOGIN / SIGNUP
================================================== */

const submit = async () => {
  if (!validate()) {
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    /* LOGIN */

    if (mode.value === "login") {
      const res: any =
        await authStore.login({
          phone: form.phone,
          password: form.password,
        });

      if (res.success) {
        successMessage.value =
          "Login successful 🎉";

        await fetchInitialData();

        emit("authenticated");

        setTimeout(closeModal, 800);
      } else {
        errorMessage.value =
          res.message;
      }
    }

    /* SIGNUP */

    if (mode.value === "signup") {
      const res: any =
        await authStore.signUp({
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password,
        });

      if (res.success) {
        successMessage.value =
          "Account created! Logging in...";

        await fetchInitialData();

        emit("authenticated");

        setTimeout(closeModal, 800);
      } else {
        errorMessage.value =
          res.message;
      }
    }
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    errorMessage.value =
      "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
};

/* ==================================================
   START FORGOT PASSWORD
================================================== */

const startForgotPassword = () => {
  clearErrors();

  errorMessage.value = "";
  successMessage.value = "";

  form.email = "";
  form.otp = "";
  form.newPassword = "";
  form.confirmPassword = "";

  resetToken.value = "";

  mode.value = "forgot-email";
};

/* ==================================================
   SEND OTP
================================================== */

const sendOtp = async () => {
  clearErrors();

  errorMessage.value = "";
  successMessage.value = "";

  if (!validateEmail()) {
    return;
  }

  if (
    mode.value === "forgot-otp" &&
    resendCountdown.value > 0
  ) {
    return;
  }

  loading.value = true;

  try {
    const res: any =
      await authStore.requestPasswordResetOtp(
        form.email.trim().toLowerCase()
      );

    if (res.success) {
      form.otp = "";

      mode.value = "forgot-otp";

      successMessage.value =
        "OTP sent to your email. Please check your inbox.";

      startResendCountdown();
    } else {
      errorMessage.value =
        res.message;
    }
  } catch (error) {
    console.error(
      "Send OTP error:",
      error
    );

    errorMessage.value =
      "Unable to send OTP. Please try again.";
  } finally {
    loading.value = false;
  }
};

/* ==================================================
   VERIFY OTP
================================================== */

const verifyOtp = async () => {
  clearErrors();

  errorMessage.value = "";
  successMessage.value = "";

  if (!validateOtp()) {
    return;
  }

  loading.value = true;

  try {
    const res: any =
      await authStore.verifyPasswordResetOtp({
        email: form.email.trim().toLowerCase(),
        otp: form.otp,
      });

    if (res.success) {
      resetToken.value =
        res.resetToken;

      successMessage.value =
        "OTP verified successfully ✅";

      mode.value = "forgot-password";
    } else {
      errorMessage.value =
        res.message;
    }
  } catch (error) {
    console.error(
      "OTP verification error:",
      error
    );

    errorMessage.value =
      "Unable to verify OTP. Please try again.";
  } finally {
    loading.value = false;
  }
};

/* ==================================================
   RESET PASSWORD
================================================== */

const resetPassword = async () => {
  clearErrors();

  errorMessage.value = "";
  successMessage.value = "";

  if (!resetToken.value) {
    errorMessage.value =
      "Password reset session expired. Please request a new OTP.";

    mode.value = "forgot-email";

    return;
  }

  if (!validateNewPassword()) {
    return;
  }

  loading.value = true;

  try {
    const res: any =
      await authStore.resetPassword({
        resetToken:
          resetToken.value,
        newPassword:
          form.newPassword,
      });

    if (res.success) {
      successMessage.value =
        "Password reset successful! Please login.";

      stopResendCountdown();

      /*
       * Give the user a moment to see success.
       */
      setTimeout(() => {
        clearForgotPasswordState();

        mode.value = "login";
      }, 1200);
    } else {
      errorMessage.value =
        res.message;

      /*
       * If reset token expired,
       * send the user back to email step.
       */
      if (
        res.message
          ?.toLowerCase()
          .includes("expired")
      ) {
        resetToken.value = "";

        setTimeout(() => {
          mode.value =
            "forgot-email";
        }, 1500);
      }
    }
  } catch (error) {
    console.error(
      "Password reset error:",
      error
    );

    errorMessage.value =
      "Unable to reset password. Please try again.";
  } finally {
    loading.value = false;
  }
};

/* ==================================================
   RESEND COUNTDOWN
================================================== */

const startResendCountdown = () => {
  stopResendCountdown();

  resendCountdown.value = 60;

  countdownTimer = setInterval(() => {
    if (resendCountdown.value > 0) {
      resendCountdown.value--;
    }

    if (resendCountdown.value <= 0) {
      stopResendCountdown();
    }
  }, 1000);
};

const stopResendCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  resendCountdown.value = 0;
};

/* ==================================================
   FETCH INITIAL DATA
================================================== */

const fetchInitialData = async () => {
  await fruitStore.fetchAddresses();
  await fruitStore.fetchOrders();
};

/* ==================================================
   SWITCH LOGIN / SIGNUP
================================================== */

const switchMode = (
  newMode: "login" | "signup"
) => {
  clearErrors();

  errorMessage.value = "";
  successMessage.value = "";

  mode.value = newMode;
};

/* ==================================================
   CLEAR FORGOT PASSWORD STATE
================================================== */

const clearForgotPasswordState = () => {
  form.email = "";
  form.otp = "";
  form.newPassword = "";
  form.confirmPassword = "";

  resetToken.value = "";

  stopResendCountdown();
};

/* ==================================================
   CLOSE MODAL
================================================== */

const closeModal = () => {
  emit(
    "update:modelValue",
    false
  );

  stopResendCountdown();

  mode.value = "login";

  Object.keys(form).forEach((key) => {
    form[key as keyof typeof form] = "";
  });

  clearErrors();

  successMessage.value = "";
  errorMessage.value = "";

  acceptTerms.value = false;

  showPassword.value = false;
  showConfirmPassword.value = false;

  resetToken.value = "";
};

/* ==================================================
   CLEANUP
================================================== */

onUnmounted(() => {
  stopResendCountdown();
});
</script>

<style scoped>
.input {
  @apply mt-1 w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100;
}

.label {
  @apply text-sm font-medium text-slate-700;
}

.error {
  @apply mt-1 text-xs text-red-500;
}

.submit-btn {
  @apply w-full rounded-xl bg-gradient-to-r from-lime-500 to-green-600 py-3 font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50;
}

.link {
  @apply ml-1 cursor-pointer font-semibold text-green-600 hover:underline;
}

.eye {
  @apply absolute right-3 top-3 cursor-pointer text-slate-500;
}
</style>