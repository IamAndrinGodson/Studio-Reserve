const STORAGE_KEY = "studioreserve:v1";

const seed = {
  clients: [
    { name: "Northstar Films", type: "Retainer", health: 92, monthly: 4200 },
    { name: "Marlow Studio", type: "Project", health: 76, monthly: 6800 },
    { name: "Atlas Coffee", type: "Campaign", health: 64, monthly: 2400 },
    { name: "Indigo Labs", type: "Advisory", health: 88, monthly: 3100 }
  ],
  projects: [
    { name: "Launch film package", client: "Northstar Films", budget: 18000, spent: 7400, status: "On margin" },
    { name: "Brand refresh sprint", client: "Marlow Studio", budget: 12000, spent: 8200, status: "Watch scope" },
    { name: "Seasonal ad set", client: "Atlas Coffee", budget: 7600, spent: 3100, status: "Healthy" }
  ],
  invoices: [
    { client: "Marlow Studio", label: "Milestone 2", amount: 4400, due: "2026-06-14" },
    { client: "Northstar Films", label: "June retainer", amount: 4200, due: "2026-06-21" },
    { client: "Indigo Labs", label: "Advisory block", amount: 1800, due: "2026-06-28" }
  ],
  entries: [
    { id: crypto.randomUUID(), type: "income", amount: 4200, description: "June retainer paid", client: "Northstar Films", project: "Launch film package", date: "2026-06-03" },
    { id: crypto.randomUUID(), type: "income", amount: 3600, description: "Brand sprint deposit", client: "Marlow Studio", project: "Brand refresh sprint", date: "2026-06-05" },
    { id: crypto.randomUUID(), type: "expense", amount: 720, description: "Contract editor", client: "Northstar Films", project: "Launch film package", date: "2026-06-07" },
    { id: crypto.randomUUID(), type: "expense", amount: 380, description: "Motion software annual plan", client: "Studio", project: "Operations", date: "2026-06-09" },
    { id: crypto.randomUUID(), type: "tax", amount: 1872, description: "Quarterly tax reserve transfer", client: "Studio", project: "Tax Vault", date: "2026-06-10" },
    { id: crypto.randomUUID(), type: "income", amount: 2400, description: "Campaign concept approval", client: "Atlas Coffee", project: "Seasonal ad set", date: "2026-06-11" },
    { id: crypto.randomUUID(), type: "expense", amount: 310, description: "Client travel", client: "Atlas Coffee", project: "Seasonal ad set", date: "2026-06-13" }
  ],
  cashBalance: 38400,
  taxRate: 0.24,
  monthlyBurn: 6200
};

let state = load();
let activeView = "cockpit";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(seed);
  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(seed);
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function byDateDesc(a, b) {
  return new Date(b.date) - new Date(a.date);
}

function selectedMonth() {
  return document.querySelector("#monthSelect")?.value || "2026-06";
}

function monthEntries(month = selectedMonth()) {
  return state.entries.filter((entry) => entry.date.startsWith(month));
}

function sum(type, entries = monthEntries()) {
  return entries.filter((entry) => entry.type === type).reduce((total, entry) => total + Number(entry.amount), 0);
}

function income(entries = monthEntries()) {
  return sum("income", entries);
}

function outflow(entries = monthEntries()) {
  return sum("expense", entries) + sum("tax", entries);
}

function render() {
  renderMonthSelect();
  renderMetrics();
  renderChart();
  renderPulse();
  renderInvoices();
  renderEntries();
  renderClients();
  renderProjects();
  renderTax();
  renderInputs();
  save();
}

function renderMonthSelect() {
  const select = document.querySelector("#monthSelect");
  const months = [...new Set(state.entries.map((entry) => entry.date.slice(0, 7)))].sort().reverse();
  const current = select.value || months[0];
  select.innerHTML = months.map((month) => `<option value="${month}">${formatMonth(month)}</option>`).join("");
  select.value = months.includes(current) ? current : months[0];
}

function renderMetrics() {
  const entries = monthEntries();
  const monthIncome = income(entries);
  const monthExpenses = sum("expense", entries);
  const taxReserve = Math.round(monthIncome * state.taxRate);
  const margin = monthIncome ? Math.round(((monthIncome - monthExpenses - taxReserve) / monthIncome) * 100) : 0;
  const runway = Math.max(0, state.cashBalance / state.monthlyBurn).toFixed(1);

  document.querySelector("#runwayMetric").textContent = `${runway} mo`;
  document.querySelector("#taxMetric").textContent = currency.format(taxReserve);
  document.querySelector("#incomeMetric").textContent = currency.format(monthIncome);
  document.querySelector("#marginMetric").textContent = `${margin}%`;
  document.querySelector("#taxHint").textContent = `${Math.round(state.taxRate * 100)}% of collected income`;
}

function renderChart() {
  const months = [...new Set(state.entries.map((entry) => entry.date.slice(0, 7)))].sort().slice(-6);
  const rows = months.map((month) => {
    const entries = monthEntries(month);
    return { month, income: income(entries), outflow: outflow(entries) };
  });
  const max = Math.max(1, ...rows.flatMap((row) => [row.income, row.outflow]));

  document.querySelector("#runwayChart").innerHTML = rows.map((row) => `
    <div class="chart-month">
      <div class="bar-pair">
        <div class="bar income" title="Income ${currency.format(row.income)}" style="height:${Math.max(8, (row.income / max) * 180)}px"></div>
        <div class="bar outflow" title="Outflow ${currency.format(row.outflow)}" style="height:${Math.max(8, (row.outflow / max) * 180)}px"></div>
      </div>
      <div class="bar-label">${formatMonth(row.month, true)}</div>
    </div>
  `).join("");
}

function renderPulse() {
  const entries = monthEntries();
  const reserveTarget = Math.round(income(entries) * state.taxRate);
  const reserveActual = sum("tax", entries);
  const openInvoices = state.invoices.reduce((total, invoice) => total + invoice.amount, 0);

  const pulse = [
    { label: "Tax reserve coverage", value: `${Math.min(100, Math.round((reserveActual / Math.max(1, reserveTarget)) * 100))}%` },
    { label: "Open invoice pipeline", value: currency.format(openInvoices) },
    { label: "Average client health", value: `${Math.round(state.clients.reduce((total, client) => total + client.health, 0) / state.clients.length)}%` }
  ];

  document.querySelector("#pulseList").innerHTML = pulse.map((item) => `
    <div class="pulse-row">
      <span class="pulse-dot"></span>
      <strong>${item.label}</strong>
      <span>${item.value}</span>
    </div>
  `).join("");
}

function renderInvoices() {
  document.querySelector("#invoiceList").innerHTML = state.invoices.map((invoice) => `
    <div class="stack-row">
      <div>
        <strong>${invoice.label}</strong>
        <span>${invoice.client} · due ${formatDate(invoice.due)}</span>
      </div>
      <strong>${currency.format(invoice.amount)}</strong>
    </div>
  `).join("");
}

function renderEntries() {
  document.querySelector("#entryList").innerHTML = [...state.entries].sort(byDateDesc).map((entry) => `
    <div class="entry-row">
      <div class="entry-main">
        <strong>${entry.description}</strong>
        <span class="entry-meta">${entry.client} · ${entry.project} · ${formatDate(entry.date)}</span>
      </div>
      <strong class="amount ${entry.type}">${entry.type === "income" ? "+" : "-"}${currency.format(entry.amount)}</strong>
    </div>
  `).join("");
}

function renderClients() {
  document.querySelector("#clientGrid").innerHTML = state.clients.map((client) => `
    <article class="client-card">
      <strong>${client.name}</strong>
      <span>${client.type} · ${currency.format(client.monthly)} monthly value</span>
      <div class="progress-track"><div class="progress-fill" style="width:${client.health}%"></div></div>
    </article>
  `).join("");
}

function renderProjects() {
  document.querySelector("#projectGrid").innerHTML = state.projects.map((project) => {
    const used = Math.round((project.spent / project.budget) * 100);
    return `
      <article class="project-card">
        <strong>${project.name}</strong>
        <span>${project.client} · ${project.status}</span>
        <div class="progress-top">
          <span>${currency.format(project.spent)} spent</span>
          <span>${currency.format(project.budget)} budget</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, used)}%"></div></div>
      </article>
    `;
  }).join("");
}

function renderTax() {
  const entries = monthEntries();
  const monthIncome = income(entries);
  const taxActual = sum("tax", entries);
  const percent = Math.round((taxActual / Math.max(1, monthIncome)) * 100);

  document.querySelector("#taxPercent").textContent = `${percent}%`;
  document.querySelector("#taxBreakdown").innerHTML = [
    ["Collected income", currency.format(monthIncome)],
    ["Reserved this month", currency.format(taxActual)],
    ["Recommended reserve", currency.format(Math.round(monthIncome * state.taxRate))],
    ["Remaining to reserve", currency.format(Math.max(0, Math.round(monthIncome * state.taxRate) - taxActual))]
  ].map(([label, value]) => `
    <div class="stack-row">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderInputs() {
  document.querySelector("#clientInput").innerHTML = ["Studio", ...state.clients.map((client) => client.name)].map((name) => `<option>${name}</option>`).join("");
  document.querySelector("#projectInput").innerHTML = ["Operations", "Tax Vault", ...state.projects.map((project) => project.name)].map((name) => `<option>${name}</option>`).join("");
}

function formatMonth(month, short = false) {
  const [year, monthNumber] = month.split("-");
  return new Date(Number(year), Number(monthNumber) - 1, 1).toLocaleDateString("en-US", {
    month: short ? "short" : "long",
    year: short ? undefined : "numeric"
  });
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function switchView(view) {
  activeView = view;
  document.querySelectorAll("[data-panel]").forEach((panel) => panel.classList.toggle("hidden", panel.dataset.panel !== view));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  document.querySelector("#viewTitle").textContent = view === "tax" ? "Tax Reserve" : view[0].toUpperCase() + view.slice(1);
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelector("#monthSelect").addEventListener("change", render);

document.querySelector("#openEntry").addEventListener("click", () => {
  document.querySelector("[name='date']").valueAsDate = new Date();
  document.querySelector("#entryDialog").showModal();
});

document.querySelector("#entryForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.entries.push({
    id: crypto.randomUUID(),
    type: data.get("type"),
    amount: Number(data.get("amount")),
    description: data.get("description").trim(),
    client: data.get("client"),
    project: data.get("project"),
    date: data.get("date")
  });
  event.currentTarget.reset();
  document.querySelector("#entryDialog").close();
  render();
});

document.querySelector("#exportData").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `studioreserve-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

document.querySelector("#resetData").addEventListener("click", () => {
  state = structuredClone(seed);
  render();
});

document.querySelector("#openAuth").addEventListener("click", () => document.querySelector("#authDialog").showModal());
document.querySelector("#closeAuth").addEventListener("click", () => document.querySelector("#authDialog").close());

document.querySelectorAll(".provider-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#authMessage").textContent = `${button.dataset.provider} backup needs OAuth credentials before syncing can start.`;
  });
});

switchView(activeView);
render();
