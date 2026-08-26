<template>
  <section class="mx-auto max-w-5xl px-4 py-8 space-y-6">
    <!-- USER HEADER -->
    <div class="user-header">
      <div class="flex items-center gap-4">
        <div class="avatar">{{ userInitial }}</div>

        <div>
          <h2 class="text-white text-lg font-semibold">{{ profile?.name }}</h2>
          <p class="text-white/80 text-sm">{{ profile?.phone }}</p>
          <p class="text-white/80 text-sm">{{ profile?.email }}</p>
        </div>
      </div>

      <button @click="goBack" class="icon-btn bg-white/20 text-white">
        <ArrowLeft class="w-5 h-5" />
      </button>
    </div>

    <!-- ADDRESSES -->
    <div class="card">
      <div class="section-header">
        <h3>Saved Addresses</h3>

        <button @click="toggleAdd" class="icon-primary-btn">
          <Plus class="w-4 h-4" />
          Add
        </button>
      </div>

      <AddressForm
        v-if="showAddressForm"
        @saved="handleAddressSaved"
        @cancel="showAddressForm = false"
      />

      <div v-if="addresses.length" class="grid gap-4 mt-5">
        <div v-for="address in addresses" :key="address.id" class="address-card">
          <AddressForm
            v-if="editingId === address.id"
            :initialData="address"
            @saved="handleAddressSaved"
            @cancel="editingId = null"
          />

          <div v-else>
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-slate-800">
                  {{ address.house }}, {{ address.street }}
                </p>

                <p class="text-sm text-slate-500">
                  {{ address.area }} - {{ address.pincode }}
                </p>
              </div>

              <span v-if="address.is_default" class="default-chip"> Default </span>
            </div>

            <p v-if="address.landmark" class="landmark">
              {{ address.landmark }}
            </p>

            <!-- ACTIONS -->
            <div class="action-icons">
              <button @click="editingId = address.id" class="icon-btn">
                <Pencil class="w-4 h-4" />
              </button>

              <button
                @click="deleteAddress(address.id)"
                class="icon-btn text-red-500 hover:bg-red-50"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <MapPin class="w-6 h-6 mb-2" />
        No address added yet
      </div>
    </div>

    <!-- ORDERS -->
    <div class="card">
      <div class="section-header">
        <h3>My Orders</h3>
      </div>

      <div v-if="orders.length" class="space-y-3 mt-5">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card cursor-pointer"
          @click="toggleOrder(order.id)"
        >
          <!-- ORDER SUMMARY ROW -->
          <div class="flex justify-between items-center">
            <div>
              <p class="order-id">#{{ order.id.slice(0, 8) }}</p>
              <p class="order-date">
                {{ new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) }}
              </p>
              <p
                v-if="false && order.delivery_date && order.status !== 'cancelled' && order.status !== 'delivered'"
                class="mt-1 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700"
              >
                🚚 {{ deliveryLabel(order.delivery_date) }}
              </p>
            </div>

            <div class="text-right flex items-center gap-3">
              <div>
                <p class="order-price">&#8377;{{ order.grand_total }}</p>
                <span class="status-pill" :class="statusColor(order.status)">
                  {{ order.status }}
                </span>
              </div>
              <ChevronDown
                class="w-4 h-4 text-slate-400 transition-transform"
                :class="expandedOrder === order.id ? 'rotate-180' : ''"
              />
            </div>
          </div>

          <!-- ORDER DETAILS (EXPANDED) -->
          <div
            v-if="expandedOrder === order.id"
            class="mt-4 pt-4 border-t border-slate-100 space-y-3"
            @click.stop
          >
            <!-- STATUS TRACKER -->
            <div class="flex items-center gap-1 overflow-x-auto pb-2">
              <div
                v-for="(step, idx) in statusSteps"
                :key="step.key"
                class="flex items-center"
              >
                <div class="flex flex-col items-center min-w-[60px]">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    :class="getStepClass(order.status, step.key)"
                  >
                    <component
                      :is="step.icon"
                      class="w-4 h-4"
                    />
                  </div>
                  <p class="text-[10px] mt-1 text-slate-500 text-center">{{ step.label }}</p>
                </div>
                <div
                  v-if="idx < statusSteps.length - 1"
                  class="w-6 h-0.5 mb-4"
                  :class="isStepPassed(order.status, statusSteps[idx + 1]?.key ?? '')
                    ? 'bg-green-500' : 'bg-slate-200'"
                ></div>
              </div>
            </div>

            <!-- ITEMS LIST -->
            <div class="space-y-2">
              <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Items</p>
              <div
                v-for="item in order.items"
                :key="item.id + (item.unitGrams || '') + (item.unitLabel || '')"
                class="flex items-center gap-3 bg-slate-50 rounded-lg p-2"
              >
                <img
                  :src="`/fruits_images/${item.name?.toLowerCase()}.webp`"
                  class="w-10 h-10 rounded-lg object-cover"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-800">{{ item.name }}</p>
                  <p class="text-xs text-slate-500">{{ formatItemQuantity(item) }}</p>
                </div>
                <p
                  v-if="getItemLineTotal(item) != null"
                  class="shrink-0 text-sm font-semibold text-slate-800"
                >
                  &#8377;{{ getItemLineTotal(item) }}
                </p>
              </div>
            </div>

            <!-- PRICE BREAKDOWN -->
            <div class="text-xs space-y-1 pt-2 border-t border-slate-100">
              <div class="flex justify-between">
                <span class="text-slate-500">Subtotal</span>
                <span>&#8377;{{ order.subtotal }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Delivery</span>
                <span :class="order.delivery_charge === 0 ? 'text-green-600' : ''">
                  {{ order.delivery_charge === 0 ? 'FREE' : '&#8377;' + order.delivery_charge }}
                </span>
              </div>
              <div class="flex justify-between font-semibold text-sm pt-1 border-t border-slate-100">
                <span>Total</span>
                <span>&#8377;{{ order.grand_total }}</span>
              </div>
            </div>

            <!-- ADMIN NOTE -->
            <div
              v-if="order.admin_note"
              class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800"
            >
              <span class="font-semibold">Note:</span> {{ order.admin_note }}
            </div>

            <!-- DOWNLOAD INVOICE (delivered only) -->
            <button
              v-if="order.status === 'delivered'"
              type="button"
              class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              @click="downloadInvoice(order)"
            >
              📄 Download Invoice
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <Package class="w-6 h-6 mb-2" />
        No orders placed yet
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  ArrowLeft, Plus, Pencil, Trash2, MapPin, Package,
  ChevronDown, Clock, CheckCircle, Truck, PackageCheck
} from "lucide-vue-next";
import useAuthStore from "../../store/authStore";
import AddressForm from "./AddressForm.vue";
import { useFruitsStore } from "../../store/fruitsStore";

const authStore = useAuthStore();
const useStore = useFruitsStore();

const profile = computed(() => authStore.getUser);
const addresses = computed(() => useStore.userAddresses);
const orders = computed(() => useStore.userOrders);

const showAddressForm = ref(false);
const editingId = ref<string | null>(null);
const expandedOrder = ref<string | null>(null);

const userInitial = computed(() => profile.value?.name?.charAt(0)?.toUpperCase() || "U");

const statusSteps = [
  { key: "pending", label: "Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

const statusOrder = ["pending", "confirmed", "shipped", "delivered"];

const getStepClass = (orderStatus: string, stepKey: string) => {
  if (orderStatus === "cancelled") {
    return stepKey === "pending"
      ? "bg-red-100 text-red-600"
      : "bg-slate-100 text-slate-400";
  }
  const orderIdx = statusOrder.indexOf(orderStatus);
  const stepIdx = statusOrder.indexOf(stepKey);
  if (stepIdx <= orderIdx) return "bg-green-100 text-green-600";
  return "bg-slate-100 text-slate-400";
};

const isStepPassed = (orderStatus: string, stepKey: string) => {
  if (orderStatus === "cancelled") return false;
  const orderIdx = statusOrder.indexOf(orderStatus);
  const stepIdx = statusOrder.indexOf(stepKey);
  return stepIdx <= orderIdx;
};

const toggleOrder = (id: string) => {
  expandedOrder.value = expandedOrder.value === id ? null : id;
};

const toggleAdd = () => {
  showAddressForm.value = !showAddressForm.value;
  editingId.value = null;
};

const handleAddressSaved = async () => {
  showAddressForm.value = false;
  editingId.value = null;
};

const deleteAddress = async (id: string) => {
  if (!confirm("Are you sure you want to delete this address?")) return;
  await useStore.deleteAddress(id);
};

const goBack = () => {
  window.history.back();
};

const statusColor = (status: string) => {
  if (status === "pending") return "bg-amber-100 text-amber-700";
  if (status === "confirmed") return "bg-blue-100 text-blue-700";
  if (status === "shipped") return "bg-purple-100 text-purple-700";
  if (status === "delivered") return "bg-green-100 text-green-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-500";
};

/* Delivery-day label: Today / Tomorrow / date, all in the 4–8 PM window. */
const istDateKey = (offsetDays = 0) => {
  const ist = new Date(Date.now() + (5 * 60 + 30) * 60 * 1000);
  ist.setUTCDate(ist.getUTCDate() + offsetDays);
  return ist.toISOString().slice(0, 10);
};
const deliveryLabel = (date: string) => {
  const key = (date || "").slice(0, 10);
  if (key === istDateKey(0)) return "Today, 4–8 PM";
  if (key === istDateKey(1)) return "Tomorrow, 4–8 PM";
  return new Date(key).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ", 4–8 PM";
};

/**
 * Final deliverable quantity for display.
 * Dozen → "6 dozen"; weight → "250 g" / "2 kg"; other units preserved.
 */
const formatItemQuantity = (item: any) => {
  const quantity = Number(item.quantity || 0);
  if (!quantity) return "";

  if (item.unitLabel?.toLowerCase() === "dozen") {
    return `${quantity} dozen`;
  }

  const unitGrams = Number(item.unitGrams || 0);
  if (unitGrams) {
    const totalGrams = unitGrams * quantity;
    if (totalGrams >= 1000) {
      const kg = totalGrams / 1000;
      const kgDisplay = kg % 1 === 0 ? String(kg) : parseFloat(kg.toFixed(2)).toString();
      return `${kgDisplay} kg`;
    }
    return `${totalGrams} g`;
  }

  if (item.unitLabel) {
    return `${quantity} ${String(item.unitLabel).toLowerCase()}`;
  }

  return String(quantity);
};

/** Line total: explicit total, or unit price × quantity */
const getItemLineTotal = (item: any): number | null => {
  const quantity = Number(item.quantity || 0);
  const pricePerKg = Number(item.pricePerKgAtAdd);

  if (
    Number.isFinite(quantity) &&
    quantity >= 0 &&
    Number.isFinite(pricePerKg) &&
    pricePerKg >= 0
  ) {
    return quantity * pricePerKg;
  }

  // Fallback for older order data
  const totalCandidates = [
    item.total,
    item.line_total,
    item.lineTotal,
    item.amount,
  ];

  for (const value of totalCandidates) {
    const number = Number(value);

    if (Number.isFinite(number) && number >= 0) {
      return number;
    }
  }

  return null;
};

const escapeHtml = (text: string) =>
  String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Build invoice from existing order data (no extra API) and open print/save dialog.
 */
 const downloadInvoice = (order: any) => {
  if (!order) {
    alert("Unable to generate invoice. Order details are missing.");
    return;
  }

  const items = Array.isArray(order.items) ? order.items : [];

  const formatMoney = (value: unknown) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "₹0.00";
    }

    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const safeNumber = (value: unknown, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };

  const orderId = String(order.id || "");
  const orderIdShort = orderId
    ? orderId.slice(0, 8).toUpperCase()
    : "N/A";

  const created = order.created_at
    ? new Date(order.created_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  /*
   * Support both:
   * order.house / order.street / ...
   * and:
   * order.address.house / order.address.street / ...
   */
  const address = order.address || {};

  const customerName = escapeHtml(
    order.customer_name ||
      order.customerName ||
      profile.value?.name ||
      "Customer"
  );

  const customerPhone = escapeHtml(
    order.customer_phone ||
      order.customerPhone ||
      profile.value?.phone ||
      ""
  );

  const addressParts = [
    order.house || address.house,
    order.street || address.street,
    order.area || address.area,
    order.landmark || address.landmark,
    order.address_pincode ||
      order.pincode ||
      address.pincode ||
      address.address_pincode,
  ]
    .filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    )
    .map((value) => escapeHtml(String(value)));

  const addressLine = addressParts.length
    ? addressParts.join(", ")
    : "Address not available";

  /*
   * Generate item rows.
   */
  
   const itemRows = items
  .map((item: any, index: number) => {
    const name = escapeHtml(item.name || "Item");
    const qty = escapeHtml(formatItemQuantity(item) || "—");

    const lineTotal = getItemLineTotal(item);

    return `
      <tr>
        <td>${index + 1}</td>

        <td>
          <strong>${name}</strong>
        </td>

        <td class="right">
          ${qty}
        </td>

        <td class="right amount">
          ${lineTotal != null ? formatMoney(lineTotal) : "—"}
        </td>
      </tr>
    `;
  })
  .join("");

  /*
   * Always use numeric values for totals.
   */
  const subtotal = safeNumber(order.subtotal);

  const deliveryCharge = Math.max(
    0,
    safeNumber(
      order.delivery_charge ??
        order.deliveryCharge ??
        order.shipping_charge ??
        0
    )
  );

  const grandTotal = safeNumber(
    order.grand_total ??
      order.grandTotal ??
      order.total ??
      subtotal + deliveryCharge
  );

  const deliveryText =
    deliveryCharge === 0 ? "FREE" : formatMoney(deliveryCharge);

  const deliveryDate = order.delivery_date
    ? new Date(order.delivery_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const deliverySlot = order.delivery_slot
    ? escapeHtml(String(order.delivery_slot))
    : "";

  const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Invoice #${escapeHtml(orderIdShort)} - Manakart</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 30px;
      background: #ffffff;
      color: #0f172a;
      font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    .invoice {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      gap: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #16a34a;
    }

    .brand {
      font-size: 28px;
      font-weight: 800;
      color: #16a34a;
    }

    .tagline {
      margin-top: 4px;
      color: #64748b;
      font-size: 13px;
    }

    .invoice-title {
      text-align: right;
    }

    .invoice-title h1 {
      margin: 0;
      font-size: 26px;
    }

    .muted {
      color: #64748b;
      font-size: 12px;
    }

    .status {
      display: inline-block;
      margin-top: 8px;
      padding: 5px 12px;
      border-radius: 999px;
      background: #dcfce7;
      color: #15803d;
      font-size: 11px;
      font-weight: 700;
    }

    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin: 28px 0;
    }

    .section-title {
      margin-bottom: 8px;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .customer-name {
      font-size: 15px;
      font-weight: 700;
    }

    .address {
      margin-top: 5px;
      line-height: 1.5;
      color: #475569;
      font-size: 12px;
    }

    .order-details {
      text-align: right;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 13px;
    }

    th {
      padding: 11px 10px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 11px;
      text-align: left;
      text-transform: uppercase;
    }

    td {
      padding: 11px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }

    .right {
      text-align: right;
    }

    .amount {
      font-weight: 700;
    }

    .empty {
      padding: 25px;
      text-align: center;
      color: #94a3b8;
    }

    .totals {
      width: 300px;
      max-width: 100%;
      margin: 20px 0 0 auto;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      padding: 6px 0;
      color: #475569;
      font-size: 13px;
    }

    .grand-total {
      margin-top: 7px;
      padding-top: 10px;
      border-top: 2px solid #0f172a;
      color: #0f172a;
      font-size: 17px;
      font-weight: 800;
    }

    .footer {
      margin-top: 45px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      color: #94a3b8;
      font-size: 11px;
      text-align: center;
    }

    .actions {
      margin-top: 25px;
      text-align: center;
    }

    .print-button {
      padding: 11px 22px;
      border: 0;
      border-radius: 10px;
      background: #16a34a;
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
    }

    .print-button:hover {
      background: #15803d;
    }

    @media print {
      body {
        padding: 0;
      }

      .actions {
        display: none !important;
      }

      .invoice {
        max-width: none;
      }
    }

    @media (max-width: 600px) {
      body {
        padding: 15px;
      }

      .header {
        flex-direction: column;
      }

      .invoice-title,
      .order-details {
        text-align: left;
      }

      .details {
        grid-template-columns: 1fr;
      }

      table {
        font-size: 11px;
      }

      th,
      td {
        padding: 8px 5px;
      }
    }
  </style>
</head>

<body>
  <div class="invoice">

    <div class="header">
      <div>
        <div class="brand">Manakart</div>
        <div class="tagline">Fresh fruits delivered</div>
      </div>

      <div class="invoice-title">
        <h1>Invoice</h1>

        <div class="muted">
          #${escapeHtml(orderIdShort)}
        </div>

        <div class="muted">
          ${escapeHtml(created)}
        </div>

        <span class="status">
          ${escapeHtml(String(order.status || "DELIVERED").toUpperCase())}
        </span>
      </div>
    </div>

    <div class="details">

      <div>
        <div class="section-title">
          Bill To
        </div>

        <div class="customer-name">
          ${customerName}
        </div>

        ${
          customerPhone
            ? `<div class="muted">${customerPhone}</div>`
            : ""
        }

        <div class="address">
          ${addressLine}
        </div>
      </div>

      <div class="order-details">
        <div class="section-title">
          Order Details
        </div>

        <div class="muted">
          Order ID: ${escapeHtml(orderId)}
        </div>

        ${
          deliveryDate
            ? `<div class="muted">Delivery: ${escapeHtml(deliveryDate)}</div>`
            : ""
        }

        ${
          deliverySlot
            ? `<div class="muted">Slot: ${deliverySlot}</div>`
            : ""
        }
      </div>

    </div>

    <table>
      <thead>
        <tr>
  <th style="width: 40px;">#</th>
  <th>Item</th>
  <th class="right">Qty</th>
  <th class="right">Amount</th>
</tr>
      </thead>

      <tbody>
        ${
          itemRows ||
          `
          <tr>
            <td colspan="4" class="empty">
              No items found for this order.
            </td>
          </tr>
          `
        }
      </tbody>
    </table>

    <div class="totals">

      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatMoney(subtotal)}</span>
      </div>

      <div class="total-row">
        <span>Delivery</span>
        <span>${deliveryText}</span>
      </div>

      <div class="total-row grand-total">
        <span>Total</span>
        <span>${formatMoney(grandTotal)}</span>
      </div>

    </div>

    <div class="footer">
      Thank you for ordering with Manakart.
      <br />
      This is a computer-generated invoice.
    </div>

    <div class="actions">
      <button
        class="print-button"
        onclick="window.print()"
      >
        Print / Save as PDF
      </button>
    </div>

  </div>

  <script>
    window.addEventListener("load", function () {
      setTimeout(function () {
        window.print();
      }, 500);
    });
  <\/script>
</body>
</html>
`;

  /*
   * Create the invoice document through a Blob URL.
   * This is more reliable than document.write().
   */
  const blob = new Blob([invoiceHtml], {
    type: "text/html;charset=utf-8",
  });

  const invoiceUrl = URL.createObjectURL(blob);

  const win = window.open(
    invoiceUrl,
    "_blank",
    "width=850,height=950,noopener,noreferrer"
  );

  if (!win) {
    URL.revokeObjectURL(invoiceUrl);

    alert(
      "Unable to open the invoice. Please allow pop-ups for this website and try again."
    );

    return;
  }

  /*
   * Clean up the temporary Blob URL after the invoice
   * has had enough time to load.
   */
  setTimeout(() => {
    URL.revokeObjectURL(invoiceUrl);
  }, 60_000);
};

onMounted(() => {
  useStore.fetchAddresses();
  useStore.fetchOrders();
});
</script>

<style scoped>
.user-header {
  @apply flex justify-between items-center rounded-3xl p-6 text-white shadow-lg;
  background: linear-gradient(135deg, #16a34a, #22c55e);
}

.avatar {
  @apply h-14 w-14 rounded-full bg-white text-green-600 flex items-center justify-center text-xl font-bold shadow-md;
}

.card {
  @apply rounded-3xl bg-white/80 backdrop-blur border border-slate-200 p-6 shadow-sm;
}

.section-header {
  @apply flex justify-between items-center;
}

.section-header h3 {
  @apply text-lg font-semibold text-slate-800;
}

.address-card {
  @apply rounded-2xl border border-slate-200 p-4 bg-white hover:shadow-md transition;
}

.default-chip {
  @apply text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold;
}

.landmark {
  @apply text-xs text-slate-400 mt-1;
}

.icon-btn {
  @apply p-2 rounded-lg hover:bg-slate-100 transition;
}

.icon-primary-btn {
  @apply flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition;
}

.action-icons {
  @apply flex gap-2 mt-4;
}

.order-card {
  @apply rounded-2xl border border-slate-200 p-4 bg-white hover:shadow-md transition;
}

.order-id {
  @apply text-sm font-medium text-slate-700;
}

.order-date {
  @apply text-xs text-slate-400;
}

.order-price {
  @apply font-semibold text-slate-800;
}

.status-pill {
  @apply text-xs px-3 py-1 rounded-full font-semibold capitalize inline-block mt-1;
}

.empty-state {
  @apply flex flex-col items-center text-slate-400 text-sm py-6;
}
</style>