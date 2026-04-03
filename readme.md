# 💰 Finance Dashboard

A full-featured **Personal Finance Tracker** built using **Vanilla JavaScript, HTML5, and CSS3**.

This application helps users:

* Track income & expenses
* Visualize financial trends
* Apply filters & date ranges
* Generate smart financial insights

⚡ Fully client-side → uses `localStorage` (no backend required)

---

# 🚀 Live Features

## 🔐 Role-Based Access

* **Admin** → Add, Edit, Delete transactions
* **Viewer** → Read-only mode

## 💳 Transaction Management

* Add / Edit / Delete transactions
* Supports **income & expense**
* Instant UI updates

## 📊 Real-Time Summary

* Total Balance
* Total Income
* Total Expenses

## 📈 Interactive Charts

* **Line Chart** → Balance over time (3D, 7D, 30D, etc.)
* **Doughnut Chart** → Category-wise spending

## 🔍 Filtering & Sorting

* Search by category/type
* Filter by category & type
* Sort by date or amount

## 📅 Date Range Filter

* Custom start & end date
* Shows **period summary**:

  * Income
  * Expense
  * Net change

## 🧠 Smart Insights

* Highest spending category
* Monthly comparison
* Average expense
* Savings rate

## 🌙 Dark Mode

* Toggle light/dark theme
* Auto adapts charts

## 💾 Data Persistence

* Uses `localStorage`
* Data remains after refresh

## 📱 Responsive Design

* Works on mobile, tablet, desktop

---

# 🛠️ Tech Stack

| Layer    | Technology                            |
| -------- | ------------------------------------- |
| Frontend | HTML5, CSS3, JavaScript (ES6 Modules) |
| Charts   | Chart.js                              |
| Icons    | Font Awesome                          |
| Fonts    | Google Fonts (Inter)                  |
| Storage  | localStorage                          |

🚀 No frameworks. Pure JavaScript.

---

# ⚙️ How This Project Works (Core Logic)

## 🧠 1. Overall Architecture

This app is divided into 4 main parts:

* 📦 `state.js` → Stores all data (brain)
* 🎮 `main.js` → Handles UI & user actions
* 🧮 `utils.js` → Logic (filters, calculations)
* 📊 `chart.js` → Charts & visualization

---

## 🔁 2. Reactive System (Auto UI Update)

This project follows a **reactive pattern (Pub/Sub)**

### Flow:

```text
User Action → State Update → refreshUI() → UI Re-render
```

### How it works:

* `main.js` registers:

```js
setRefreshCallback(refreshAll)
```

* Every change triggers:

```js
refreshUI()
```

* Which:

  * Saves data
  * Calls `refreshAll()`

---

## 📦 3. Data Flow (Step-by-Step)

1. User clicks (Add / Filter / etc.)
2. `main.js` handles event
3. Calls `state.js` function
4. State updates
5. `refreshUI()` runs
6. UI updates completely

---

## 📊 4. State Management

All data is stored in:

```js
transactions
currentRole
filters
```

### Filters include:

```js
searchTerm
categoryFilter
typeFilter
sortOption
dateFrom
dateTo
```

💡 Single source of truth = predictable app

---

## 🧩 5. Filtering & Sorting Logic

Handled in `utils.js`

### Includes:

* Search
* Category filter
* Type filter
* Date range

### Date Range Logic:

```js
txDate >= fromDate && txDate <= toDate
```

### Sorting:

* Date (new/old)
* Amount (high/low)

---

## 📊 6. Calculations

### Totals:

```js
balance = income - expense
```

### Date Range:

```js
getTotalsForRange(from, to)
```

---

## 📈 7. Charts Logic

### 🔁 Important:

Charts are **re-created every update**

### 📈 Line Chart:

* Shows balance over time
* Uses cumulative calculation

### 🍩 Doughnut Chart:

* Groups expenses by category

### 🌙 Dark Mode:

* Uses CSS variables
* Auto updates charts

---

## 📅 8. Date Range Feature

* User selects date range
* Filters transactions
* Shows summary:

  * Income
  * Expense
  * Net change

---

## 💾 9. LocalStorage

### On Load:

```js
loadFromLocalStorage()
```

### On Update:

```js
localStorage.setItem(...)
```

✅ No data loss after refresh

---

## 🎭 10. Role-Based UI

```js
currentRole === "admin"
```

* Admin → Full control
* Viewer → Read-only

---

## 🌐 11. Why Local Server?

Because of ES6 Modules:

```js
import/export
```

❌ Doesn't work with `file://`
✅ Use local server

---

# 📁 Project Structure

```
finance-dashboard/
├── index.html
├── styles.css
├── state.js
├── utils.js
├── chart.js
├── main.js
└── README.md
```

---

# 🚀 How to Run

## ✅ Method 1: Live Server (Recommended)

* Install VS Code
* Install Live Server extension
* Right-click → Open with Live Server

---

## ✅ Method 2: Python

```bash
python -m http.server 8000
```

Open: http://localhost:8000

---

## ✅ Method 3: Node

```bash
npx http-server
```

---

# 📖 How to Use

1. Select **Admin role**
2. Add transactions
3. Apply filters
4. Select date range
5. View charts & insights
6. Toggle dark mode

---

# 🔧 Customization

Edit default data in `state.js`:

```js
const DEFAULT_TRANSACTIONS = [
  { id: 1, date: "2025-01-15", amount: 1000, category: "Salary", type: "income" }
];
```

---

# 🧪 Limitations

* No backend (client-side only)
* Limited by browser storage
* Not optimized for very large data

---

# 🤝 Contributing

Pull requests are welcome! 🚀
Feel free to open issues

---

# 🙌 Acknowledgements

* Chart.js
* Font Awesome
* Google Fonts

---

# 👨‍💻 Author

Made with ❤️ by **Nitish Ojha**
