import { transactions } from './state.js';

let timeChartInstance = null;
let categoryChartInstance = null;
let currentRange = 7; // default 7 days

// Returns an array of YYYY-MM-DD dates from (today - days + 1) to today, inclusive
function getDateRange(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
        dates.push(current.toISOString().slice(0,10));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

// Compute cumulative balance up to each date in the range
function getDailyBalances(days) {
    const dates = getDateRange(days);
    const balances = [];
    for (const targetDate of dates) {
        let cumulative = 0;
        const target = new Date(targetDate);
        transactions.forEach(t => {
            const txDate = new Date(t.date);
            if (txDate <= target) {
                cumulative += (t.type === "income" ? t.amount : -t.amount);
            }
        });
        balances.push(cumulative);
    }
    return { dates, balances };
}

function getCategorySpending() {
    const spending = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
    });
    let labels = Object.keys(spending);
    let data = Object.values(spending);
    if (labels.length === 0) {
        labels = ["No Expenses"];
        data = [1];
    }
    return { labels, data };
}

export function renderCharts() {
    const timeCanvas = document.getElementById("timeChart");
    const categoryCanvas = document.getElementById("categoryChart");
    const timeEmptyMsg = document.getElementById("timeChartEmptyMsg");
    const categoryEmptyMsg = document.getElementById("categoryChartEmptyMsg");

    if (!timeCanvas || !categoryCanvas) {
        console.error("Chart canvases not found");
        return;
    }

    if (timeChartInstance) {
        timeChartInstance.destroy();
        timeChartInstance = null;
    }
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
        categoryChartInstance = null;
    }

    const hasTransactions = transactions.length > 0;
    const hasExpenses = transactions.some(t => t.type === "expense");

    // ---- Time Chart ----
    if (!hasTransactions) {
        timeCanvas.style.display = "none";
        if (timeEmptyMsg) timeEmptyMsg.style.display = "block";
    } else {
        timeCanvas.style.display = "block";
        if (timeEmptyMsg) timeEmptyMsg.style.display = "none";
        const { dates, balances } = getDailyBalances(currentRange);
        const textColor = getComputedStyle(document.body).getPropertyValue('--text').trim();
        const textLight = getComputedStyle(document.body).getPropertyValue('--text-light').trim();
        const gridColor = getComputedStyle(document.body).getPropertyValue('--gray-light').trim();
        const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim();

        timeChartInstance = new Chart(timeCanvas, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Cumulative Balance (₹)',
                    data: balances,
                    borderColor: primaryColor,
                    backgroundColor: primaryColor + '20',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: primaryColor,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top', labels: { color: textColor } }
                },
                scales: {
                    y: { ticks: { color: textLight }, grid: { color: gridColor } },
                    x: { ticks: { color: textLight, maxRotation: 45, autoSkip: true }, grid: { color: gridColor } }
                }
            }
        });
    }

    // ---- Category Chart ----
    if (!hasExpenses) {
        categoryCanvas.style.display = "none";
        if (categoryEmptyMsg) categoryEmptyMsg.style.display = "block";
    } else {
        categoryCanvas.style.display = "block";
        if (categoryEmptyMsg) categoryEmptyMsg.style.display = "none";
        const { labels, data } = getCategorySpending();
        const textColor = getComputedStyle(document.body).getPropertyValue('--text').trim();
        const bgColor = getComputedStyle(document.body).getPropertyValue('--card-bg').trim();

        categoryChartInstance = new Chart(categoryCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#4361ee', '#06ffa5', '#ef476f', '#ffd166', '#5e60ce', '#64b5f6', '#ff8c42'],
                    borderWidth: 2,
                    borderColor: bgColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom', labels: { color: textColor } } }
            }
        });
    }
}

export function setTimeRange(days) {
    currentRange = days;
    renderCharts();
}

let resizeTimeout;
window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => renderCharts(), 250);
});