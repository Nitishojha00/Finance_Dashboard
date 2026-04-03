// Global state (exported)
export let transactions = [];
export let currentRole = "viewer";
export let filters = {
    searchTerm: "",
    categoryFilter: "",
    typeFilter: "",
    sortOption: "date_desc",
    dateFrom: null,   // new
    dateTo: null      // new
};

// Helper to persist state
function saveToLocalStorage() {
    localStorage.setItem("financeTransactions", JSON.stringify(transactions));
    localStorage.setItem("financeRole", currentRole);
    localStorage.setItem("financeFilters", JSON.stringify(filters));
}

// Default mock data – used only if localStorage is empty
const DEFAULT_TRANSACTIONS = [
    { id: 1, date: "2025-01-15", amount: 1000, category: "Salary", type: "income" },
    { id: 2, date: "2025-02-10", amount: 200, category: "Food", type: "expense" },
    { id: 3, date: "2025-03-20", amount: 500, category: "Rent", type: "expense" },
    { id: 4, date: "2025-04-01", amount: 1500, category: "Salary", type: "income" }
];

export function loadFromLocalStorage() {
    const stored = localStorage.getItem("financeTransactions");
    if (stored) {
        const parsed = JSON.parse(stored);
        transactions.length = 0;
        transactions.push(...parsed);
    } else {
        transactions.length = 0;
        transactions.push(...DEFAULT_TRANSACTIONS);
        saveToLocalStorage();
    }
    const storedRole = localStorage.getItem("financeRole");
    if (storedRole) currentRole = storedRole;
    const storedFilters = localStorage.getItem("financeFilters");
    if (storedFilters) {
        const parsedFilters = JSON.parse(storedFilters);
        // merge without overwriting new properties
        Object.assign(filters, parsedFilters);
    }
}

// Refresh callback
let refreshCallback = null;

export function setRefreshCallback(cb) {
    refreshCallback = cb;
}

function refreshUI() {
    if (refreshCallback) refreshCallback();
    saveToLocalStorage();
}

export function addTransaction(transaction) {
    const newId = Date.now();
    transactions.push({ id: newId, ...transaction });
    refreshUI();
}

export function updateTransaction(id, updatedData) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updatedData };
        refreshUI();
    }
}

export function deleteTransaction(id) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions.splice(index, 1);
        refreshUI();
    }
}

export function setRole(role) {
    currentRole = role;
    refreshUI();
}

export function setFilter(key, value) {
    filters[key] = value;
    refreshUI();
}