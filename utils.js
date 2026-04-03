import { transactions, filters } from './state.js';

export function getFilteredSortedTransactions() {
    let filtered = transactions.filter(t => {
        // existing text/category/type filters
        const matchesSearch = t.category.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
                              t.type.toLowerCase().includes(filters.searchTerm.toLowerCase());
        const matchesCategory = filters.categoryFilter === "" || t.category === filters.categoryFilter;
        const matchesType = filters.typeFilter === "" || t.type === filters.typeFilter;
        
        // NEW: date range filter
        let matchesDateRange = true;
        if (filters.dateFrom && filters.dateTo) {
            const txDate = new Date(t.date);
            const fromDate = new Date(filters.dateFrom);
            const toDate = new Date(filters.dateTo);
            // set to beginning/end of day for inclusive comparison
            fromDate.setHours(0,0,0,0);
            toDate.setHours(23,59,59,999);
            matchesDateRange = txDate >= fromDate && txDate <= toDate;
        }
        
        return matchesSearch && matchesCategory && matchesType && matchesDateRange;
    });

    switch(filters.sortOption) {
        case "date_desc": filtered.sort((a,b) => new Date(b.date) - new Date(a.date)); break;
        case "date_asc": filtered.sort((a,b) => new Date(a.date) - new Date(b.date)); break;
        case "amount_desc": filtered.sort((a,b) => b.amount - a.amount); break;
        case "amount_asc": filtered.sort((a,b) => a.amount - b.amount); break;
        default: filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    }
    return filtered;
}

export function getTotals() {
    let income = 0, expense = 0;
    transactions.forEach(t => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });
    return { balance: income - expense, income, expense };
}

// NEW: get totals for a specific date range
export function getTotalsForRange(dateFrom, dateTo) {
    if (!dateFrom || !dateTo) return { income: 0, expense: 0, balance: 0 };
    let income = 0, expense = 0;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    from.setHours(0,0,0,0);
    to.setHours(23,59,59,999);
    
    transactions.forEach(t => {
        const txDate = new Date(t.date);
        if (txDate >= from && txDate <= to) {
            if (t.type === "income") income += t.amount;
            else expense += t.amount;
        }
    });
    return { income, expense, balance: income - expense };
}

export function getUniqueCategories() {
    return [...new Set(transactions.map(t => t.category))];
}

export function validateTransaction(date, category, amount, type) {
    if (!date) return "Date is required";
    const today = new Date().toISOString().slice(0,10);
    if (date > today) return "Date cannot be in the future";
    if (!category || category.trim().length < 2) return "Category must be at least 2 characters";
    if (isNaN(amount) || amount <= 0) return "Amount must be a positive number";
    return null;
}