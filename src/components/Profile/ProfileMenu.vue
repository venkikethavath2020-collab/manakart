<template>
  <div class="relative" ref="menuRef">
    <!-- If Logged In -->
    <div v-if="isLoggedIn">
      <button
        @click="toggle"
        class="flex h-10 w-10 items-center justify-center rounded-full
               bg-green-600 text-white font-semibold shadow-md"
      >
        {{ userInitial }}
      </button>

      <!-- Dropdown -->
      <div
        v-if="open"
        class="absolute right-0 mt-3 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden z-50"
      >
        <div class="px-4 py-3 border-b">
          <p class="font-semibold text-slate-800">
            {{ user?.name }}
          </p>
          <p class="text-xs text-slate-500">
            {{ user?.phone }}
          </p>
          <span
            v-if="isAdmin"
            class="inline-block mt-1 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"
          >
            Admin
          </span>
        </div>

        <button
          class="dropdown-item"
          @click="goToProfile"
        >
          <User class="w-4 h-4" /> My Profile
        </button>

        <button
          class="dropdown-item"
          @click="goToOrders"
        >
          <Package class="w-4 h-4" /> My Orders
        </button>

        <button
          v-if="isAdmin"
          class="dropdown-item text-amber-700"
          @click="goToAdmin"
        >
          <Shield class="w-4 h-4" /> Admin Panel
        </button>

        <button
          class="dropdown-item text-red-600 border-t"
          @click="logout"
        >
          <LogOut class="w-4 h-4" /> Logout
        </button>
      </div>
    </div>

    <!-- If Not Logged In -->
    <button
      v-else
      @click="openAuth"
      class="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow"
    >
      Login / Signup
    </button>
  </div>
  <AuthModal :model-value="showAuth" @update:model-value="showAuth = false" />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import useAuthStore from "../../store/authStore"
import AuthModal from "../Auth/AuthModal.vue"
import { User, Package, Shield, LogOut } from "lucide-vue-next"
import { useFruitsStore } from "../../store/fruitsStore"

const router = useRouter()
const authStore = useAuthStore()
const fruitsStore = useFruitsStore()
const open = ref(false)
const showAuth = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const user = computed(() => authStore.getUser)
const isLoggedIn = computed(() => authStore.isLoggedIn)
const isAdmin = computed(() => authStore.isAdmin)

const userInitial = computed(() =>
  user.value?.name?.charAt(0)?.toUpperCase() || "U"
)

const toggle = () => (open.value = !open.value)

const goToProfile = () => {
  open.value = false
  router.push("/profile")
}

const goToOrders = () => {
  open.value = false
  router.push("/profile")
}

const goToAdmin = () => {
  open.value = false
  router.push("/admin")
}

const logout = () => {
  authStore.logout()
  fruitsStore.clearCart()
  fruitsStore.$reset()
  open.value = false
  router.push("/")
}

const openAuth = () => {
  showAuth.value = true
}

/* Close on outside click */
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})
</script>

<style scoped>
.dropdown-item {
  @apply flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100;
}
</style>
