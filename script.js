const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = {
  method: "UPI",
  filter: "All",
  transactions: [
    { name: "Ravi Kumar", mobile: "9876543210", vehicle: "TN38 AB 1234", premium: 699, method: "UPI", status: "PAID", policy: "Pending", order: "POP202610220001" },
    { name: "Suresh", mobile: "9887654321", vehicle: "TN37 CD 5678", premium: 749, method: "Card", status: "PENDING", policy: "—", order: "POP202610220002" },
    { name: "Manoj", mobile: "9798765432", vehicle: "TN39 EF 9012", premium: 699, method: "UPI", status: "PAID", policy: "Issued", order: "POP202610220003" },
    { name: "Karthik", mobile: "9834267890", vehicle: "TN66 GH 3456", premium: 599, method: "Net Banking", status: "FAILED", policy: "—", order: "POP202610220004" },
    { name: "Prakash", mobile: "9623456789", vehicle: "TN38 IJ 7890", premium: 749, method: "QR Code", status: "PENDING", policy: "Pending", order: "POP202610220005" }
  ],
  currentOrder: null
};

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}
function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);
}
function getCustomer() {
  return {
    name: $("#customerName").value.trim() || "Customer",
    mobile: $("#mobileNumber").value.trim(),
    vehicle: $("#vehicleNumber").value.trim() || "Not provided",
    model: $("#vehicleModel").value.trim() || "Not provided",
    expiry: $("#policyExpiry").value,
    premium: Math.round(Number($("#premiumAmount").value) || 0)
  };
}
function formattedDate(value) {
  if (!value) return "Not set";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function syncCustomerPreview() {
  const customer = getCustomer();
  $("#whatsappGreeting").textContent = `Vanakkam ${customer.name} 👋`;
  $("#waVehicle").textContent = customer.vehicle;
  $("#waExpiry").textContent = formattedDate(customer.expiry);
  $("#waPremium").textContent = money(customer.premium);
  $("#totalAmount").textContent = money(customer.premium);
  $("#payNowBtn").textContent = `Pay ${money(customer.premium)} now`;
  $("#receiptCustomer").textContent = customer.name;
  $("#receiptAmount").textContent = money(customer.premium);
  $("#receiptMethod").textContent = state.method;
  $("#waPayBtn").textContent = `↗  Pay ${money(customer.premium)} securely`;
}
function selectMethod(method) {
  state.method = method;
  $$(".method-option").forEach(button => {
    const selected = button.dataset.method === method;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  syncCustomerPreview();
}
function validateCustomer() {
  const customer = getCustomer();
  if (!customer.name) return "Please enter the customer name.";
  if (!/^\d{10}$/.test(customer.mobile)) return "Enter a valid 10-digit mobile number.";
  if (!customer.vehicle.trim()) return "Please enter the vehicle number.";
  if (!Number.isFinite(customer.premium) || customer.premium < 1 || customer.premium > 100000) return "Enter a premium between ₹1 and ₹1,00,000.";
  return "";
}
function makeOrderId() {
  return `POP${new Date().toISOString().slice(0,10).replaceAll("-","")}${String(Date.now()).slice(-6)}`;
}
function simulatePayment() {
  const validationError = validateCustomer();
  if (validationError) {
    showToast(validationError);
    return;
  }
  const customer = getCustomer();
  const orderId = makeOrderId();
  // Frontend demo only: no real payment request is sent.
  const statuses = ["PAID", "PENDING", "FAILED"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const transaction = {
    name: customer.name,
    mobile: customer.mobile,
    vehicle: customer.vehicle,
    premium: customer.premium,
    method: state.method,
    status,
    policy: status === "PAID" ? "Pending" : "—",
    order: orderId
  };
  state.currentOrder = { ...transaction, expiry: customer.expiry, model: customer.model, date: new Date() };
  state.transactions.unshift(transaction);
  const statusClass = status === "PAID" ? "status-paid" : status === "FAILED" ? "status-failed" : "status-pending";
  $("#resultIcon").textContent = status === "PAID" ? "✓" : status === "FAILED" ? "!" : "…";
  $("#resultIcon").style.background = status === "PAID" ? "#e5f8ef" : status === "FAILED" ? "#ffeaed" : "#fff4dc";
  $("#resultIcon").style.color = status === "PAID" ? "#14865b" : status === "FAILED" ? "#c8102e" : "#986307";
  $("#resultTitle").textContent = status === "PAID" ? "Demo payment successful" : status === "FAILED" ? "Demo payment failed" : "Payment is pending";
  $("#resultDescription").textContent = status === "PAID"
    ? "The demo transaction is marked as paid. This is not a real payment."
    : status === "FAILED"
      ? "The demo transaction is marked as failed. No money was charged."
      : "The demo transaction is pending. A real app must verify status using a backend webhook.";
  $("#receiptOrder").textContent = orderId;
  $("#receiptCustomer").textContent = customer.name;
  $("#receiptAmount").textContent = money(customer.premium);
  $("#receiptMethod").textContent = state.method;
  $("#receiptDate").textContent = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  $("#receiptStatus").textContent = status;
  $("#receiptStatus").className = `status-pill ${statusClass}`;
  renderTransactions();
  $("#resultPanel").scrollIntoView({ behavior: "smooth", block: "center" });
  showToast(`Demo transaction created: ${status}`);
}
function statusTag(status) {
  const cls = status === "PAID" ? "status-paid" : status === "FAILED" ? "status-failed" : "status-pending";
  return `<span class="status-tag ${cls}">${escapeHtml(status)}</span>`;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
function renderTransactions() {
  const query = $("#searchInput").value.trim().toLowerCase();
  const filtered = state.transactions.filter(item => {
    const statusMatch = state.filter === "All" || item.status === state.filter;
    const queryMatch = [item.name, item.mobile, item.vehicle, item.order].some(value => String(value).toLowerCase().includes(query));
    return statusMatch && queryMatch;
  });
  $("#transactionTableBody").innerHTML = filtered.map(item => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.mobile)}</td>
      <td>${escapeHtml(item.vehicle)}</td>
      <td>${money(item.premium)}</td>
      <td>${escapeHtml(item.method)}</td>
      <td>${statusTag(item.status)}</td>
      <td>${escapeHtml(item.policy)}</td>
      <td>${escapeHtml(item.order)}</td>
    </tr>`).join("");
  $("#emptyState").classList.toggle("hidden", filtered.length > 0);
  $("#tableSummary").textContent = `Showing ${filtered.length} of ${state.transactions.length} transactions`;
  const count = status => state.transactions.filter(item => item.status === status).length;
  $("#totalCount").textContent = state.transactions.length;
  $("#paidCount").textContent = count("PAID");
  $("#pendingCount").textContent = count("PENDING");
  $("#failedCount").textContent = count("FAILED");
  $("#allTabCount").textContent = state.transactions.length;
  $("#paidTabCount").textContent = count("PAID");
  $("#pendingTabCount").textContent = count("PENDING");
  $("#failedTabCount").textContent = count("FAILED");
  $$(".filter-tab").forEach(button => button.classList.toggle("active", button.dataset.filter === state.filter));
}
function exportCsv() {
  const columns = [
    ["Customer Name", "name"], ["Mobile Number", "mobile"], ["Vehicle Number", "vehicle"],
    ["Premium", "premium"], ["Payment Method", "method"], ["Payment Status", "status"],
    ["Policy Status", "policy"], ["Order ID", "order"]
  ];
  const csvCell = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    columns.map(column => csvCell(column[0])).join(","),
    ...state.transactions.map(item => columns.map(column => csvCell(item[column[1]])).join(","))
  ].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "popoye-payment-transactions.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("CSV report downloaded.");
}
function downloadReceipt() {
  if (!state.currentOrder) {
    showToast("Create a demo transaction first.");
    return;
  }
  const order = state.currentOrder;
  const content = [
    "POPOYE INSURANCE — DEMO RECEIPT",
    "--------------------------------",
    `Customer: ${order.name}`,
    `Mobile: ${order.mobile}`,
    `Vehicle: ${order.vehicle}`,
    `Vehicle model: ${order.model}`,
    `Policy expiry: ${formattedDate(order.expiry)}`,
    `Amount: ${money(order.premium)}`,
    `Payment method: ${order.method}`,
    `Order ID: ${order.order}`,
    `Status: ${order.status}`,
    `Date: ${order.date.toLocaleString("en-IN")}`,
    "",
    "DEMO ONLY — this receipt does not confirm a real payment or policy issuance."
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${order.order}-demo-receipt.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Demo receipt downloaded.");
}

["customerName", "mobileNumber", "vehicleNumber", "vehicleModel", "policyExpiry", "premiumAmount"].forEach(id => {
  $("#" + id).addEventListener("input", syncCustomerPreview);
  $("#" + id).addEventListener("change", syncCustomerPreview);
});
$$(".method-option").forEach(button => button.addEventListener("click", () => selectMethod(button.dataset.method)));
$("#continuePaymentBtn").addEventListener("click", () => {
  const error = validateCustomer();
  if (error) return showToast(error);
  $("#payment").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("Customer details validated. Choose a payment method.");
});
$("#payNowBtn").addEventListener("click", simulatePayment);
$("#waPayBtn").addEventListener("click", () => {
  $("#payment").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("WhatsApp payment link preview opened.");
});
$("#searchInput").addEventListener("input", renderTransactions);
$$(".filter-tab").forEach(button => button.addEventListener("click", () => {
  state.filter = button.dataset.filter;
  renderTransactions();
}));
$("#exportCsvBtn").addEventListener("click", exportCsv);
$("#downloadReceiptBtn").addEventListener("click", downloadReceipt);
$("#showDashboardBtn").addEventListener("click", () => $("#dashboard").scrollIntoView({ behavior: "smooth" }));
$("#year").textContent = new Date().getFullYear();

syncCustomerPreview();
renderTransactions();
