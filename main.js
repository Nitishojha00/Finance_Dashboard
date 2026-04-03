import { 
    transactions, currentRole, filters,
    loadFromLocalStorage, setRole, setFilter,
    addTransaction, updateTransaction, deleteTransaction,
    setRefreshCallback
} from './state.js';
import { getFilteredSortedTransactions, getTotals, getUniqueCategories, validateTransaction, getTotalsForRange } from './utils.js';
import { renderCharts, setTimeRange } from './chart.js';

// DOM elements
const roleSelect = document.getElementById("roleSelect");
const addBtn = document.getElementById("addTransactionBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilterSelect = document.getElementById("categoryFilter");
const typeFilterSelect = document.getElementById("typeFilter");
const sortSelect = document.getElementById("sortBy");
const modal = document.getElementById("transactionModal");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalCategory = document.getElementById("modalCategory");
const modalAmount = document.getElementById("modalAmount");
const modalType = document.getElementById("modalType");
const modalSave = document.getElementById("modalSave");
const modalCancel = document.getElementById("modalCancel");
const darkModeToggle = document.getElementById("darkModeToggle");
const transactionTbody = document.getElementById("transactionTbody");

// NEW: date range elements
const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");
const applyRangeBtn = document.getElementById("applyRangeBtn");
const clearRangeBtn = document.getElementById("clearRangeBtn");
const periodSummaryDiv = document.getElementById("periodSummary");

let editingId = null;

// ---- UI Updates ----
function renderSummary() {
    const { balance, income, expense } = getTotals();
    document.getElementById("totalBalance").innerHTML = `₹${balance.toFixed(2)}`;
    document.getElementById("totalIncome").innerHTML = `₹${income.toFixed(2)}`;
    document.getElementById("totalExpenses").innerHTML = `₹${expense.toFixed(2)}`;
}

// NEW: update period summary based on current date range filter
function updatePeriodSummary() {
    if (!periodSummaryDiv) return;
    const { dateFrom, dateTo } = filters;
    if (dateFrom && dateTo) {
        const { income, expense, balance } = getTotalsForRange(dateFrom, dateTo);
        periodSummaryDiv.innerHTML = `
            <div class="period-summary-card">
                <h4>📅 Period Summary (${dateFrom} → ${dateTo})</h4>
                <div class="period-stats">
                    <div><strong>Total Income</strong> <span>₹${income.toFixed(2)}</span></div>
                    <div><strong>Total Expenses</strong> <span>₹${expense.toFixed(2)}</span></div>
                    <div><strong>Net Change</strong> <span>₹${balance.toFixed(2)}</span></div>
                </div>
            </div>
        `;
        periodSummaryDiv.style.display = "block";
    } else {
        periodSummaryDiv.style.display = "none";
    }
}

function renderTransactionTable() {
    const filtered = getFilteredSortedTransactions();
    if (filtered.length === 0) {
        transactionTbody.innerHTML = `<tr><td colspan="5" class="empty-msg">No transactions found</td></tr>`;
        return;
    }
    transactionTbody.innerHTML = "";
    filtered.forEach(t => {
        const row = transactionTbody.insertRow();
        const dateCell = row.insertCell(0);
        dateCell.textContent = new Date(t.date).toLocaleDateString();
        const categoryCell = row.insertCell(1);
        categoryCell.textContent = t.category;
        const amountCell = row.insertCell(2);
        amountCell.textContent = `₹${t.amount.toFixed(2)}`;
        const typeCell = row.insertCell(3);
        typeCell.innerHTML = t.type === "income" ? "<span style='color:green'>Income</span>" : "<span style='color:red'>Expense</span>";
        const actionsCell = row.insertCell(4);
        if (currentRole === "admin") {
            actionsCell.innerHTML = `
                <div class="transaction-actions">
                    <button class="btn btn-sm" data-id="${t.id}" data-action="edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" data-id="${t.id}" data-action="delete"><i class="fas fa-trash"></i></button>
                </div>
            `;
        } else {
            actionsCell.textContent = "—";
        }
        const headers = ["Date", "Category", "Amount (₹)", "Type", "Actions"];
        for (let i = 0; i < row.cells.length; i++) {
            row.cells[i].setAttribute("data-label", headers[i]);
        }
    });
}

function renderInsights() {
    const { income, expense } = getTotals();
    const catSpending = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
        catSpending[t.category] = (catSpending[t.category] || 0) + t.amount;
    });
    let highestCategory = "None";
    let highestAmount = 0;
    for (const [cat, amt] of Object.entries(catSpending)) {
        if (amt > highestAmount) {
            highestAmount = amt;
            highestCategory = cat;
        }
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let currentExpense = 0, prevExpense = 0;
    transactions.forEach(t => {
        if (t.type === "expense") {
            const d = new Date(t.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) currentExpense += t.amount;
            if (d.getMonth() === prevMonth && d.getFullYear() === prevYear) prevExpense += t.amount;
        }
    });
    let monthCompare = "No previous data";
    if (prevExpense > 0) {
        const diff = ((currentExpense - prevExpense) / prevExpense * 100).toFixed(1);
        monthCompare = `${diff}% ${diff >= 0 ? 'increase' : 'decrease'} from last month (₹${prevExpense})`;
    } else if (currentExpense > 0) {
        monthCompare = "New spending this month";
    }

    const avgExpense = expense / (transactions.filter(t => t.type === "expense").length || 1);
    document.getElementById("insightsGrid").innerHTML = `
        <div class="insight-card"><strong>🏆 Highest Spending Category</strong><br>${highestCategory} (₹${highestAmount.toFixed(2)})</div>
        <div class="insight-card"><strong>📅 Monthly Expense Trend</strong><br>Current month: ₹${currentExpense.toFixed(2)}<br>${monthCompare}</div>
        <div class="insight-card"><strong>💰 Average Expense</strong><br>₹${avgExpense.toFixed(2)} per transaction</div>
        <div class="insight-card"><strong>💵 Savings Rate</strong><br>${income === 0 ? "N/A" : ((income - expense) / income * 100).toFixed(1)}% of income saved</div>
    `;
}

function updateCategoryFilterOptions() {
    const cats = getUniqueCategories();
    const currentValue = filters.categoryFilter;
    categoryFilterSelect.innerHTML = '<option value="">All Categories</option>';
    cats.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilterSelect.appendChild(option);
    });
    if (currentValue && cats.includes(currentValue)) {
        categoryFilterSelect.value = currentValue;
    } else {
        categoryFilterSelect.value = "";
        if (filters.categoryFilter !== "") {
            setFilter("categoryFilter", "");
        }
    }
}

function updateUIBasedOnRole() {
    addBtn.style.display = currentRole === "admin" ? "inline-flex" : "none";
    renderTransactionTable();
}

function refreshAll() {
    renderSummary();
    renderCharts();
    renderTransactionTable();
    renderInsights();
    updateCategoryFilterOptions();
    updateUIBasedOnRole();
    updatePeriodSummary();   // NEW: refresh period summary
}

// ---- Modal Functions ----
function openAddModal() {
    editingId = null;
    modalTitle.textContent = "Add Transaction";
    modalDate.value = new Date().toISOString().slice(0,10);
    modalCategory.value = "";
    modalAmount.value = "";
    modalType.value = "expense";
    modal.style.display = "flex";
}

function openEditModal(id) {
    const trans = transactions.find(t => t.id === id);
    if (!trans) return;
    editingId = id;
    modalTitle.textContent = "Edit Transaction";
    modalDate.value = trans.date;
    modalCategory.value = trans.category;
    modalAmount.value = trans.amount;
    modalType.value = trans.type;
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
    editingId = null;
}

function saveModal() {
    const date = modalDate.value;
    const category = modalCategory.value.trim();
    const amount = parseFloat(modalAmount.value);
    const type = modalType.value;

    const validationError = validateTransaction(date, category, amount, type);
    if (validationError) {
        alert(validationError);
        return;
    }

    const newData = { date, category, amount, type };
    if (editingId === null) {
        addTransaction(newData);
    } else {
        updateTransaction(editingId, newData);
    }
    closeModal();
}

// ---- Event Handling with Delegation ----
transactionTbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    if (btn.dataset.action === "edit") openEditModal(id);
    if (btn.dataset.action === "delete" && confirm("Delete this transaction?")) deleteTransaction(id);
});

// Filters
searchInput.addEventListener("input", (e) => setFilter("searchTerm", e.target.value));
categoryFilterSelect.addEventListener("change", (e) => setFilter("categoryFilter", e.target.value));
typeFilterSelect.addEventListener("change", (e) => setFilter("typeFilter", e.target.value));
sortSelect.addEventListener("change", (e) => setFilter("sortOption", e.target.value));
roleSelect.addEventListener("change", (e) => setRole(e.target.value));
addBtn.addEventListener("click", openAddModal);
modalCancel.addEventListener("click", closeModal);
modalSave.addEventListener("click", saveModal);
window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

// NEW: date range handlers
function applyDateRange() {
    const from = dateFromInput.value;
    const to = dateToInput.value;
    if (from && to) {
        if (new Date(from) > new Date(to)) {
            alert("Start date cannot be after end date.");
            return;
        }
        setFilter("dateFrom", from);
        setFilter("dateTo", to);
    } else {
        alert("Please select both start and end dates.");
    }
}
function clearDateRange() {
    setFilter("dateFrom", null);
    setFilter("dateTo", null);
    dateFromInput.value = "";
    dateToInput.value = "";
}
if (applyRangeBtn) applyRangeBtn.addEventListener("click", applyDateRange);
if (clearRangeBtn) clearRangeBtn.addEventListener("click", clearDateRange);

// Range buttons for time chart
const rangeButtons = document.querySelectorAll('.range-btn');
rangeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const days = parseInt(btn.dataset.range);
        if (!isNaN(days)) {
            rangeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setTimeRange(days);
        }
    });
});

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const icon = darkModeToggle.querySelector("i");
    if (document.body.classList.contains("dark")) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark';
    }
    renderCharts();
});

// Initial load
loadFromLocalStorage();
setRefreshCallback(refreshAll);
refreshAll();

// Initialize filter UI from state
searchInput.value = filters.searchTerm;
typeFilterSelect.value = filters.typeFilter;
sortSelect.value = filters.sortOption;
roleSelect.value = currentRole;
// NEW: restore date range inputs if any
if (filters.dateFrom && filters.dateTo) {
    dateFromInput.value = filters.dateFrom;
    dateToInput.value = filters.dateTo;
    updatePeriodSummary();
}