<template>
  <!-- NOT LOGGED IN -->
  <div
    v-if="!isLoggedIn"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4"
  >
    <div class="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20">
        <span class="text-3xl">🚚</span>
      </div>
      <h2 class="mt-4 text-center text-2xl font-bold text-white">Rider Access</h2>
      <p class="mt-2 text-center text-sm text-slate-400">
        Please login with your rider account to continue.
      </p>
      <button
        class="mt-6 w-full rounded-xl bg-lime-500 px-4 py-3 font-semibold text-slate-900 transition hover:bg-lime-400"
        @click="router.push('/')"
      >
        Go to Store Login
      </button>
      <button
        class="mt-3 w-full rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
        @click="goHome"
      >
        ← Back to Store
      </button>
    </div>
  </div>

  <!-- LOGGED IN BUT NOT RIDER -->
  <div
    v-else-if="!isRider"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4"
  >
    <div class="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
        <span class="text-3xl">🔒</span>
      </div>
      <h2 class="text-xl font-bold text-white">Access Denied</h2>
      <p class="mt-2 text-sm text-slate-400">Your account does not have rider privileges.</p>
      <button
        class="mt-6 w-full rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
        @click="goHome"
      >
        ← Back to Store
      </button>
      <button
        class="mt-3 w-full rounded-xl border border-red-300/30 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
        @click="logout"
      >
        Logout
      </button>
    </div>
  </div>

  <!-- RIDER DASHBOARD -->
  <div v-else class="min-h-screen bg-slate-50">
    <!-- NEW ORDER ALERT -->
    <div
      v-if="newOrderAlert"
      class="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-green-200 bg-white p-4 shadow-2xl"
    >
      <div class="flex items-start gap-3">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl">🔔</div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-bold text-slate-900">{{ alertTitle }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ newOrderAlertText }}</p>
            </div>
            <button class="text-slate-400 hover:text-slate-700" @click="newOrderAlert = false">✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- TOP BAR -->
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div class="flex min-w-0 items-center gap-2">
          <span class="text-2xl">🚚</span>
          <div class="min-w-0">
            <p class="font-display text-base font-extrabold leading-tight text-slate-900">Manakart Rider</p>
            <p class="truncate text-[11px] text-slate-500">{{ riderName }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="!notificationsEnabled"
            class="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm transition hover:bg-amber-100"
            @click="enableNotifications"
          >
            🔔 Enable Alerts
          </button>
          <span v-else class="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            🔔 Alerts On
          </span>
          <span
            class="hidden rounded-full px-3 py-1.5 text-xs font-semibold sm:inline-flex"
            :class="socketConnected ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'"
          >
            {{ socketConnected ? "● Live" : "○ Offline" }}
          </span>
          <button
            class="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            @click="goHome"
          >
            ← Store
          </button>
          <button
            class="rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- DASHBOARD -->
    <main class="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <!-- WELCOME -->
      <div class="mb-6">
        <p class="text-sm text-slate-500">Good day 👋</p>
        <h1 class="mt-1 text-2xl font-bold text-slate-900">Welcome, {{ riderName }}</h1>
        <p class="mt-1 text-sm text-slate-500">Manage your deliveries from here.</p>
      </div>

      <!-- SUMMARY CARDS (clickable tabs) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <!-- New / Pending – switches to Active tab -->
        <button
          type="button"
          class="rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200"
          :class="
            activeTab === 'active'
              ? 'border-red-300 bg-red-50/60 ring-1 ring-red-100'
              : 'border-red-100 bg-white hover:border-red-200'
          "
          @click="activeTab = 'active'"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">New Orders</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ pendingOrders }}</p>
            </div>
            <div class="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">🔴</div>
          </div>
        </button>

        <!-- Active Deliveries – switches to Active tab -->
        <button
          type="button"
          class="rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-200"
          :class="
            activeTab === 'active'
              ? 'border-amber-300 bg-amber-50/60 ring-1 ring-amber-100'
              : 'border-amber-100 bg-white hover:border-amber-200'
          "
          @click="activeTab = 'active'"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Active Deliveries</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ activeOrders }}</p>
            </div>
            <div class="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">🛵</div>
          </div>
        </button>

        <!-- Delivered – switches to History tab -->
        <button
          type="button"
          class="rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-200"
          :class="
            activeTab === 'history'
              ? 'border-green-300 bg-green-50/60 ring-1 ring-green-100'
              : 'border-green-100 bg-white hover:border-green-200'
          "
          @click="activeTab = 'history'"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Delivered</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ deliveredOrders }}</p>
            </div>
            <div class="flex h-11 w-11 items-center justify-center rounded-full bg-green-50">✅</div>
          </div>
        </button>
      </div>

      <!-- TAB BAR -->
      <div class="mt-8">
        <div class="flex gap-1 rounded-2xl bg-slate-100/80 p-1.5">
          <button
            type="button"
            class="relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
            :class="
              activeTab === 'active'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="activeTab = 'active'"
          >
            <span class="inline-flex items-center gap-2">
              🛵 Active Orders
              <span
                v-if="pendingOrders > 0"
                class="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
              >
                {{ pendingOrders }}
              </span>
            </span>
          </button>
          <button
            type="button"
            class="relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
            :class="
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="activeTab = 'history'"
          >
            <span class="inline-flex items-center gap-2">
              📜 Delivery History
              <span
                v-if="deliveredOrders > 0"
                class="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700"
              >
                {{ deliveredOrders }}
              </span>
            </span>
          </button>
        </div>
      </div>

      <!-- ===================== ACTIVE ORDERS TAB ===================== -->
      <section v-show="activeTab === 'active'" class="mt-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Active Orders</h2>
            <p class="mt-1 text-sm text-slate-500">Manage your assigned deliveries.</p>
          </div>
          <span
            v-if="pendingOrders > 0"
            class="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
          >
            {{ pendingOrders }} pending
          </span>
        </div>

        <div v-if="orderError" class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p class="text-sm font-medium text-red-700">{{ orderError }}</p>
          <button
            class="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            @click="fetchRiderOrders"
          >
            Try Again
          </button>
        </div>

        <div
          v-if="loadingOrders"
          class="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center"
        >
          <div class="text-2xl">📦</div>
          <p class="mt-3 text-sm text-slate-500">Loading orders...</p>
        </div>

        <div
          v-else-if="!orderError && orders.length === 0"
          class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
        >
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <span class="text-3xl">📦</span>
          </div>
          <h3 class="mt-4 font-semibold text-slate-800">No active orders</h3>
          <p class="mt-1 text-sm text-slate-500">New delivery orders will appear here automatically.</p>
        </div>

        <!-- SMALL CARDS GRID -->
        <div
          v-else-if="!loadingOrders && orders.length > 0"
          class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <article
            v-for="order in orders"
            :key="order.id"
            class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <!-- Header -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <span
                  v-if="order.status === 'pending'"
                  class="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600"
                >
                  🔴 NEW
                </span>
                <span
                  v-else-if="order.status === 'confirmed'"
                  class="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700"
                >
                  🟡 ACCEPTED
                </span>
                <span
                  v-else-if="order.status === 'shipped'"
                  class="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700"
                >
                  🔵 OUT
                </span>
                <span
                  v-else-if="order.status === 'delivered'"
                  class="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700"
                >
                  🟢 DONE
                </span>
                <span
                  v-else
                  class="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600"
                >
                  {{ order.status }}
                </span>
                <p class="mt-1 text-sm font-bold text-slate-900">#{{ shortOrderId(order.id) }}</p>
              </div>
              <p class="text-base font-bold text-slate-900">₹{{ order.grand_total }}</p>
            </div>

            <!-- Customer -->
            <p class="mt-2 truncate text-sm font-medium text-slate-800">
              👤 {{ order.customer_name || "Customer" }}
            </p>
            <a
              v-if="order.customer_phone"
              :href="`tel:${order.customer_phone}`"
              class="mt-0.5 block text-xs text-blue-600 hover:underline"
            >
              📞 {{ order.customer_phone }}
            </a>

            <!-- Address -->
            <p class="mt-2 line-clamp-2 text-xs text-slate-600">
              📍 {{ order.house || "" }} {{ order.street || "" }}, {{ order.area || "" }}
            </p>

            <!-- ORDER ITEMS (compact) -->
            <div class="mt-3">
              <div class="flex items-center justify-between">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Order Items
                </p>
                <p class="text-[10px] font-medium text-slate-500">
                  {{ itemCount(order) }} products
                </p>
              </div>

              <div
                v-if="getOrderItems(order).length > 0"
                class="mt-1.5 divide-y divide-slate-100 rounded-lg border border-slate-200"
              >
                <div
                  v-for="(item, index) in getOrderItems(order).slice(0, 3)"
                  :key="item.id || index"
                  class="flex items-center justify-between gap-2 px-3 py-2"
                >
                  <p class="min-w-0 truncate text-xs font-semibold text-slate-800">
                    {{ item.name || "Item" }}
                  </p>
                  <span class="shrink-0 text-[10px] font-bold text-slate-700">
                    {{ formatItemQuantity(item) }}
                  </span>
                </div>
                <div
                  v-if="getOrderItems(order).length > 3"
                  class="px-3 py-1.5 text-center text-[10px] text-slate-500"
                >
                  +{{ getOrderItems(order).length - 3 }} more
                </div>
              </div>
              <p v-else class="mt-1.5 rounded-lg bg-slate-50 p-2 text-[10px] text-slate-500">
                Item details unavailable.
              </p>
            </div>

            <!-- Slot -->
            <div class="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <span class="rounded bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                {{ order.delivery_date || "Not set" }}
              </span>
              <span class="rounded bg-purple-50 px-2 py-0.5 font-medium text-purple-700">
                {{ order.delivery_slot || "Evening" }}
              </span>
            </div>

            <!-- Actions -->
            <div class="mt-3 flex flex-col gap-1.5">
              <button
                type="button"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                @click="openOrderModal(order)"
              >
                View Details
              </button>

              <button
                v-if="order.status === 'pending'"
                type="button"
                :disabled="acceptingOrderId === order.id"
                class="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                @click="acceptOrder(order.id)"
              >
                {{ acceptingOrderId === order.id ? "Accepting..." : "Accept" }}
              </button>

              <button
                v-else-if="order.status === 'confirmed'"
                type="button"
                :disabled="updatingOrderId === order.id"
                class="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                @click="updateOrderStatus(order.id, 'shipped')"
              >
                {{ updatingOrderId === order.id ? "Starting..." : "Start Delivery" }}
              </button>

              <button
                v-else-if="order.status === 'shipped'"
                type="button"
                :disabled="updatingOrderId === order.id"
                class="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                @click="updateOrderStatus(order.id, 'delivered')"
              >
                {{ updatingOrderId === order.id ? "Updating..." : "Mark Delivered" }}
              </button>

              <div
                v-else-if="order.status === 'delivered'"
                class="rounded-lg bg-green-50 px-3 py-2 text-center text-xs font-semibold text-green-700"
              >
                ✅ Delivered
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- ===================== DELIVERY HISTORY TAB ===================== -->
      <section v-show="activeTab === 'history'" class="mt-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Delivery History</h2>
            <p class="mt-1 text-sm text-slate-500">Your completed and cancelled deliveries.</p>
          </div>
          <span class="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            {{ deliveredOrders }} delivered
          </span>
        </div>

        <div
          v-if="loadingHistory"
          class="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center"
        >
          <p class="text-sm text-slate-500">Loading delivery history...</p>
        </div>

        <div v-else-if="historyError" class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p class="text-sm text-red-700">{{ historyError }}</p>
          <button
            class="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white"
            @click="fetchRiderHistory"
          >
            Try Again
          </button>
        </div>

        <div
          v-else-if="historyOrders.length === 0"
          class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center"
        >
          <div class="text-3xl">📜</div>
          <p class="mt-3 font-semibold text-slate-800">No delivery history yet</p>
          <p class="mt-1 text-sm text-slate-500">Completed deliveries will appear here.</p>
        </div>

        <!-- TABLE -->
        <div v-else class="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Order</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="order in historyOrders"
                :key="order.id"
                class="hover:bg-slate-50"
              >
                <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                  #{{ shortOrderId(order.id) }}
                </td>
                <td class="px-4 py-3 text-slate-700">
                  {{ order.customer_name || "Customer" }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                  ₹{{ order.grand_total }}
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="order.status === 'delivered'"
                    class="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700"
                  >
                    ✅ Delivered
                  </span>
                  <span
                    v-else
                    class="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700"
                  >
                    ❌ Cancelled
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                  {{ formatDate(order.updated_at) }}
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    @click="openOrderModal(order)"
                  >
                    Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- ===================== MODERN ORDER DETAILS MODAL ===================== -->
    <div
      v-if="showOrderModal && selectedOrder"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      @click.self="closeOrderModal"
    >
      <div
        class="max-h-[92vh] w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <!-- Gradient header -->
        <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 pb-6 pt-5 text-white">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Order</p>
              <h3 class="mt-0.5 text-xl font-bold tracking-tight text-white">
                #{{ shortOrderId(selectedOrder.id) }}
              </h3>
            </div>
            <button
              class="rounded-full bg-white/10 p-2 text-slate-300 transition hover:bg-white/20 hover:text-white"
              @click="closeOrderModal"
            >
              ✕
            </button>
          </div>

          <!-- Status + Amount row -->
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <span
              v-if="selectedOrder.status === 'pending'"
              class="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300 ring-1 ring-red-400/30"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
              NEW ORDER
            </span>
            <span
              v-else-if="selectedOrder.status === 'confirmed'"
              class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              ACCEPTED
            </span>
            <span
              v-else-if="selectedOrder.status === 'shipped'"
              class="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 ring-1 ring-blue-400/30"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              OUT FOR DELIVERY
            </span>
            <span
              v-else-if="selectedOrder.status === 'delivered'"
              class="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300 ring-1 ring-green-400/30"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
              DELIVERED
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300 ring-1 ring-red-400/30"
            >
              ❌ {{ selectedOrder.status?.toUpperCase() || "CANCELLED" }}
            </span>

            <p class="ml-auto text-2xl font-extrabold tracking-tight text-white">
              ₹{{ selectedOrder.grand_total }}
            </p>
          </div>
        </div>

        <!-- Scrollable body -->
        <div class="max-h-[60vh] overflow-y-auto px-5 py-5">
          <!-- Customer card -->
          <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Customer</p>
            <p class="mt-1.5 text-base font-semibold text-slate-900">
              {{ selectedOrder.customer_name || "Customer" }}
            </p>
            <a
              v-if="selectedOrder.customer_phone"
              :href="`tel:${selectedOrder.customer_phone}`"
              class="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-blue-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50"
            >
              📞 {{ selectedOrder.customer_phone }}
            </a>
          </div>

          <!-- Address card -->
          <div class="mt-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Delivery Address
            </p>
            <p class="mt-1.5 text-sm font-medium leading-relaxed text-slate-800">
              {{ selectedOrder.house || "" }}
              {{ selectedOrder.street || "" }}{{ selectedOrder.street || selectedOrder.house ? "," : "" }}
              {{ selectedOrder.area || "" }}
            </p>
            <p v-if="selectedOrder.landmark" class="mt-1 text-xs text-slate-500">
              Near {{ selectedOrder.landmark }}
            </p>
            <p class="mt-1 text-xs text-slate-500">
              Pincode: {{ selectedOrder.address_pincode || selectedOrder.pincode || "—" }}
            </p>

            <a
              v-if="hasLocation(selectedOrder)"
              :href="googleMapsUrl(selectedOrder)"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              📍 Open in Google Maps
            </a>
          </div>

          <!-- Items -->
          <div class="mt-5">
            <div class="flex items-center justify-between">
              <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Order Items
              </p>
              <p class="text-xs text-slate-500">
                {{ itemCount(selectedOrder) }} products
              </p>
            </div>

            <div
              v-if="getOrderItems(selectedOrder).length > 0"
              class="mt-2 space-y-2"
            >
              <div
                v-for="(item, index) in getOrderItems(selectedOrder)"
                :key="item.id || index"
                class="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm"
              >
                <p class="min-w-0 truncate text-sm font-semibold text-slate-800">
                  {{ item.name || "Item" }}
                </p>
                <span class="shrink-0 text-sm font-bold text-slate-900">
                  {{ formatItemQuantity(item) }}
                </span>
              </div>
            </div>
            <p
              v-else
              class="mt-2 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500"
            >
              Item details unavailable.
            </p>
          </div>

          <!-- Meta -->
          <p class="mt-5 text-center text-[11px] text-slate-400">
            Last updated · {{ formatDate(selectedOrder.updated_at) }}
          </p>
        </div>

        <!-- Sticky footer -->
        <div class="border-t border-slate-100 bg-white px-5 py-4">
          <button
            class="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 active:scale-[0.98]"
            @click="closeOrderModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import useAuthStore from "../store/authStore";
import apiClient from "../service/axios";
import socket from "../service/socket";

/* TYPES */
interface RiderOrder {
  id: string;
  items: any[];
  subtotal: number;
  delivery_charge: number;
  grand_total: number;
  pincode: string;
  status: string;
  delivery_date: string | null;
  delivery_slot: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  house: string | null;
  street: string | null;
  area: string | null;
  address_pincode: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  assigned_rider_id: string | null;
}

/* STORES */
const router = useRouter();
const authStore = useAuthStore();

/* AUTH */
const isLoggedIn = computed(() => authStore.isLoggedIn);
const isRider = computed(() => authStore.getUser?.role === "rider");
const riderName = computed(() => authStore.getUser?.name || "Rider");

/* TABS */
const activeTab = ref<"active" | "history">("active");

/* ORDERS */
const orders = ref<RiderOrder[]>([]);
const loadingOrders = ref(false);
const orderError = ref("");
const acceptingOrderId = ref<string | null>(null);
const updatingOrderId = ref<string | null>(null);

/* HISTORY */
const historyOrders = ref<RiderOrder[]>([]);
const loadingHistory = ref(false);
const historyError = ref("");

/* MODAL (shared for Active + History) */
const showOrderModal = ref(false);
const selectedOrder = ref<RiderOrder | null>(null);

const openOrderModal = (order: RiderOrder) => {
  selectedOrder.value = order;
  showOrderModal.value = true;
};

const closeOrderModal = () => {
  showOrderModal.value = false;
  selectedOrder.value = null;
};

/* SOCKET */
const socketConnected = ref(false);

/* NOTIFICATIONS */
const notificationsEnabled = ref(false);
const newOrderAlert = ref(false);
const newOrderAlertText = ref("");
const alertTitle = ref("New Order Received");

const formatDate = (date: string) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* DASHBOARD COUNTS */
const pendingOrders = computed(() =>
  orders.value.filter((order) => order.status === "pending").length
);

const activeOrders = computed(() =>
  orders.value.filter(
    (order) => order.status === "confirmed" || order.status === "shipped"
  ).length
);

const deliveredOrders = computed(() =>
  historyOrders.value.filter((order) => order.status === "delivered").length
);

/* HELPERS */
const shortOrderId = (id: string) => id.slice(0, 8).toUpperCase();

const getOrderItems = (order: RiderOrder) => {
  if (!Array.isArray(order.items)) return [];
  return order.items;
};

const itemCount = (order: RiderOrder) => getOrderItems(order).length;

/**
 * Formats the final deliverable quantity for a rider.
 * Uses the price snapshot's variant label, so all catalog unit types display correctly.
 */
const formatItemQuantity = (item: any) => {
  const quantity = Number(item.quantity || 0);
  if (!quantity) return "";

  return item.variantLabel ? `${quantity} × ${item.variantLabel}` : String(quantity);
};

const hasLocation = (order: RiderOrder) =>
  order.latitude !== null && order.longitude !== null;

const googleMapsUrl = (order: RiderOrder) => {
  if (!hasLocation(order)) return "#";
  return `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
};

/* FETCH ORDERS */
const fetchRiderOrders = async () => {
  loadingOrders.value = true;
  orderError.value = "";
  try {
    const response = await apiClient.get("/rider/orders");
    orders.value = response.data.orders || [];
  } catch (error: any) {
    console.error("Failed to fetch rider orders:", error);
    orderError.value =
      error.response?.data?.message || "Unable to load orders.";
  } finally {
    loadingOrders.value = false;
  }
};

/* ACCEPT ORDER */
const acceptOrder = async (orderId: string) => {
  acceptingOrderId.value = orderId;
  orderError.value = "";
  try {
    await apiClient.patch(`/rider/orders/${orderId}/accept`);
    await fetchRiderOrders();
  } catch (error: any) {
    console.error("Failed to accept order:", error);
    orderError.value =
      error.response?.data?.message || "Unable to accept this order.";
  } finally {
    acceptingOrderId.value = null;
  }
};

/* UPDATE ORDER STATUS */
const updateOrderStatus = async (
  orderId: string,
  status: "shipped" | "delivered"
) => {
  updatingOrderId.value = orderId;
  orderError.value = "";
  try {
    await apiClient.patch(`/rider/orders/${orderId}/status`, { status });
    await fetchRiderOrders();
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    orderError.value =
      error.response?.data?.message || "Unable to update order status.";
  } finally {
    updatingOrderId.value = null;
  }
};

/* HISTORY */
const fetchRiderHistory = async () => {
  loadingHistory.value = true;
  historyError.value = "";
  try {
    const response = await apiClient.get("/rider/history");
    historyOrders.value = response.data.orders || [];
  } catch (error: any) {
    console.error("Failed to fetch rider history:", error);
    historyError.value =
      error.response?.data?.message || "Unable to load delivery history.";
  } finally {
    loadingHistory.value = false;
  }
};

/* NOTIFICATIONS */
const enableNotifications = async () => {
  try {
    const audio = new Audio("/sounds/new-order.mp3");
    audio.volume = 0;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    notificationsEnabled.value = true;
  } catch (error) {
    console.warn("Unable to enable order alerts:", error);
  }
};

const playOrderSound = () => {
  if (!notificationsEnabled.value) return;
  const audio = new Audio("/sounds/new-order.mp3");
  audio.volume = 1;
  audio.play().catch((error) => {
    console.warn("Unable to play order notification:", error);
  });
};

const showNewOrderAlert = (order: any) => {
  alertTitle.value = "New Order Received";
  newOrderAlertText.value = `Order #${shortOrderId(order.id)} · ₹${order.grand_total}`;
  newOrderAlert.value = true;
  setTimeout(() => {
    newOrderAlert.value = false;
  }, 5000);
};

/* SOCKET */
const connectSocket = () => {
  console.log("🔌 Connecting to rider socket...");
  socket.connect();
  socket.on("connect", handleSocketConnect);
  socket.on("disconnect", handleSocketDisconnect);
  socket.on("connect_error", handleSocketError);
  socket.on("new_order", handleNewOrder);
  socket.on("order_updated", handleOrderUpdated);
};

const handleSocketConnect = () => {
  socketConnected.value = true;
  console.log("🔌 Rider socket connected:", socket.id);
};

const handleSocketDisconnect = (reason: string) => {
  socketConnected.value = false;
  console.warn("⚠️ Rider socket disconnected:", reason);
};

const handleSocketError = (error: Error) => {
  socketConnected.value = false;
  console.error("❌ Rider socket connection error:", error.message);
};

const handleNewOrder = async (order: any) => {
  console.log("🔔 NEW ORDER RECEIVED:", order);
  await fetchRiderOrders();
  playOrderSound();
  showNewOrderAlert(order);
  // Switch to active tab when a new order arrives
  activeTab.value = "active";
};

const handleOrderUpdated = async (order: any) => {
  console.log("📦 ORDER UPDATED:", order);
  await Promise.all([fetchRiderOrders(), fetchRiderHistory()]);
};

const disconnectSocket = () => {
  socket.off("connect", handleSocketConnect);
  socket.off("disconnect", handleSocketDisconnect);
  socket.off("connect_error", handleSocketError);
  socket.off("new_order", handleNewOrder);
  socket.off("order_updated", handleOrderUpdated);
  socketConnected.value = false;
  socket.disconnect();
  console.log("🔌 Rider socket disconnected");
};

/* LIFECYCLE */
onMounted(async () => {
  await Promise.all([fetchRiderOrders(), fetchRiderHistory()]);
  connectSocket();
});

onUnmounted(() => {
  disconnectSocket();
});

/* NAVIGATION */
const goHome = () => {
  router.push("/");
};

const logout = () => {
  disconnectSocket();
  authStore.logout();
  router.push("/");
};
</script>
