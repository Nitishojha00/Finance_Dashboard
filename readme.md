# 💰 Finance Dashboard

A full-featured **personal finance tracker** built with **vanilla JavaScript, HTML5, and CSS3**.  
It helps users manage income and expense transactions, visualize spending trends, filter data with custom date ranges, and gain actionable financial insights — all with a clean UI, dark mode, and role-based access.

Data is persisted locally using the browser’s `localStorage`, making the app lightweight and fully client-side.

---

## ✨ Features

### 🔐 Role-Based Access
- **Admin Role** → Full control (Add, Edit, Delete transactions)
- **Viewer Role** → Read-only access

### 💳 Transaction Management
- Add, edit, and delete transactions
- Supports both **income and expense**
- Instant UI updates after every operation

### 📊 Real-Time Summary
- Total Balance  
- Total Income  
- Total Expenses  
*(All values update dynamically)*

### 📈 Interactive Charts
- **Line Chart** – Shows cumulative balance over time with time filters: 3D, 7D, 30D, 2M, 3M, 1Y  
- **Doughnut Chart** – Expense distribution by category  

### 🔍 Advanced Filtering & Sorting
- Search by category/type  
- Filter by category or transaction type  
- Sort by date (newest/oldest) or amount (high/low)  

### 📅 Custom Date Range Filter
- Select any **start and end date**  
- View filtered transactions  
- Displays a **Period Summary Card** with:
  - Total Income  
  - Total Expenses  
  - Net Change  

### 🧠 Smart Insights
- Highest spending category  
- Month-over-month expense comparison  
- Average expense per transaction  
- Savings rate calculation  

### 🌙 Dark / Light Mode
- Toggle theme easily  
- Preference saved automatically  

### 💾 Persistent Storage
- Uses `localStorage`  
- Data remains after page refresh  

### 📱 Fully Responsive
- Works on desktop, tablet, and mobile  

---

## 🛠️ Tech Stack

| Layer    | Technology                            |
|----------|--------------------------------------|
| Frontend | HTML5, CSS3, JavaScript (ES6 Modules)|
| Charts   | Chart.js                             |
| Icons    | Font Awesome                         |
| Fonts    | Google Fonts (Inter)                 |
| Storage  | localStorage                         |
| Styling  | Flexbox, Grid, CSS Variables         |

**No frameworks. No build tools. Pure modular JavaScript.**

---


## ⚙️ How It Works (Core Logic)

### 🔁 Reactive Update Pattern (Pub/Sub)
- `state.js` holds the **single source of truth** – `transactions`, `currentRole`, `filters`.
- A `refreshCallback` is registered by `main.js` using `setRefreshCallback()`.
- Every time data changes (add, edit, delete, filter, role, date range, dark mode), `refreshUI()` is called → saves to `localStorage` → triggers the callback.
- The callback then **re‑renders everything** – summaries, charts, transaction table, insights, period summary.

### 📦 Data Flow
1. User action (click Add, change filter, select date range, toggle dark mode)
2. Event handler in `main.js` calls the corresponding `state.js` function (e.g., `addTransaction`, `setFilter`, `setRole`)
3. `state.js` updates the global array/object → calls `refreshUI()` → saves to `localStorage` → calls the registered callback
4. Callback runs `refreshAll()` in `main.js` → re‑renders all UI components using the latest state

### 🧩 Pure Functions for Filtering & Sorting
- `utils.js` contains **pure functions** – they take the current state and return a new filtered/sorted array without mutating the original.
- This makes the logic predictable and easy to test.

### 📊 Chart Re‑rendering
- Charts are destroyed and recreated on **every data change** (including dark mode toggle).
- Line chart fetches cumulative balance for the selected range (3D to 1Y) by iterating through all transactions up to each date.
- Doughnut chart groups expenses by category on the fly.
- Both charts read CSS variables (`--primary`, `--text`, etc.) so they automatically adapt to dark/light mode.

### 💾 Persistence
- On page load, `loadFromLocalStorage()` restores data. If empty, default mock data is inserted.
- Any mutation immediately overwrites the `localStorage` keys.

### 🌐 Why ES Modules + Local Server?
- The code uses `import/export` (ES6 modules) for clean separation of concerns.
- Browsers block module imports when opening `file://` due to CORS. Hence a local server (Live Server, Python, Node.js) is **required**.

---

# ⚙️ Core Logic – How It Works

## 🔁 Reactive Update Pattern (Pub/Sub)

- **Single source of truth** → `state.js` holds all data:
  - `transactions`
  - `currentRole`
  - `filters` (search, category, type, sort, date range)

- **Refresh callback** → `main.js` registers a function using `setRefreshCallback()` that re-renders the entire UI.

- **Automatic updates** → Every time data changes:
  - Add / Edit / Delete transaction  
  - Change filter  
  - Switch role  
  - Toggle dark mode  
  - Apply date range  

  👉 `refreshUI()` is called, which:
  - Saves updated state to `localStorage`
  - Triggers the registered callback

- **Full UI Re-render** → The callback updates:
  - Summary cards  
  - Charts (Line + Doughnut)  
  - Transaction table  
  - Insights section  
  - Period summary  

✅ Result: UI is always perfectly in sync with data (no manual DOM updates scattered around)

---

## 📦 Data Flow (Step by Step)

1. **User Action**
   - Clicks “Add”, types search, selects date range, toggles theme, etc.

2. **Event Handling**
   - `main.js` calls functions from `state.js`  
     *(e.g., `addTransaction()`, `setFilter()`, `setRole()`)*

3. **State Update**
   - Global state in `state.js` is updated

4. **Trigger Refresh**
   - `refreshUI()`:
     - Saves to `localStorage`
     - Calls registered callback

5. **UI Re-render**
   - `refreshAll()` in `main.js` updates everything

✅ Result: Always consistent and predictable UI

---

## 🧩 Pure Functions for Filtering & Sorting

- Located in `utils.js`
- Do **not mutate original data**
- Always return a new processed array

### Benefits:
- Predictable behavior  
- Easy testing  
- No side effects  

### Examples:
- `getFilteredSortedTransactions()`
- `getTotalsForRange()`

---

## 📊 Chart Re-rendering

- Charts are **destroyed & recreated** on every update

### 📈 Line Chart
- Shows cumulative balance over time
- Supports ranges: `3D`, `7D`, `30D`, `2M`, `3M`, `1Y`
- Iterates through transactions up to each date

### 🍩 Doughnut Chart
- Groups expenses by category dynamically

### 🌙 Dark Mode Support
- Uses CSS variables:
  - `--primary`
  - `--text`
  - `--card-bg`
- Charts automatically adapt on theme change

---

## 💾 Persistence (LocalStorage)

- On load → `loadFromLocalStorage()` restores:
  - Transactions  
  - Role  
  - Filters  

- If empty → default mock data is used

- Every update automatically saves:
  - Add / Edit / Delete  
  - Filter changes  
  - Role changes  
  - Date range  

✅ Page refresh = no data loss

---

## 🌍 Why ES Modules + Local Server?

- Uses **ES6 Modules (`import/export`)**:
  - `state.js` → data layer  
  - `utils.js` → logic layer  
  - `chart.js` → chart handling  
  - `main.js` → UI + events  

- ❌ Browsers block modules via `file://` (CORS issue)

- ✅ Solution:
  - Live Server  
  - `python -m http.server`  
  - `npx http-server`  

---

# ✨ Features Overview

| Feature | How It Works |
|--------|-------------|
| **Summary Cards** | `getTotals()` computes balance, income, expenses |
| **Role-based Access** | `currentRole` controls UI (admin/viewer) |
| **Search & Filters** | `setFilter()` + `getFilteredSortedTransactions()` |
| **Date Range Filter** | Filters transactions + shows period summary |
| **Transaction Table** | Dynamically rendered; edit/delete for admin only |
| **Insights Section** | Calculates trends, averages, savings rate |
| **Dark Mode Toggle** | Adds `.dark` class; updates CSS variables |
| **Charts** | Line (balance) + Doughnut (category breakdown) |
| **LocalStorage** | Full data persistence (no backend needed) |

---

## ✅ Final Outcome

- Clean architecture  
- Fully reactive UI  
- Modular design  
- Easy to scale & maintain  
- No frameworks required 🚀

# 📁 File Structure

```
finance-dashboard/
├── index.html        # Main UI structure
├── styles.css        # Styling (light/dark + responsive)
├── state.js          # Global state & localStorage handling
├── utils.js          # Filtering, sorting, calculations
├── chart.js          # Chart rendering logic
├── main.js           # Event handling & UI updates
└── README.md
```

---

# 🚀 How to Run Locally

⚠️ Since the project uses **ES6 Modules**, you must run it using a local server.

## ✅ Method 1: Live Server (Recommended)

1. Install VS Code
2. Install **Live Server extension**
3. Right-click `index.html`
4. Click **Open with Live Server**

---

## ✅ Method 2: Python Server

```bash
python -m http.server 8000
```

Open: http://localhost:8000

---

## ✅ Method 3: Node.js

```bash
npx http-server
```

---

# 🧠 Architecture & Approach

## State Management (`state.js`)
- Centralized state: `transactions`, `currentRole`, `filters`
- Uses a callback system: `setRefreshCallback()` → re-renders UI
- All operations trigger UI refresh + localStorage update

---

## Filtering & Sorting (`utils.js`)
- `getFilteredSortedTransactions()` handles search, filters, sorting
- `getTotalsForRange()` computes custom range summary
- Input validation:
  - No future dates
  - Positive values only

---

## Chart System (`chart.js`)
- Uses **Chart.js**
- Charts re-render on:
  - Data change
  - Theme change
- Features:
  - Dynamic time range selection
  - Theme-based colors

---

## UI Logic (`main.js`)
- DOM caching for performance
- Event delegation for dynamic elements
- Modal reused for:
  - Add
  - Edit
- Filters auto-refresh UI

---

## Persistence
- Stored in `localStorage`:
  - `financeTransactions`
  - `financeRole`
  - `financeFilters`

---

## Dark Mode
- Controlled via CSS variables
- Applied using `.dark` class
- Charts update automatically

---

# 📖 How to Use

## 1. Switch Role
- Select **Admin** to enable editing

## 2. Add Transaction
- Click **Add**
- Fill details → Save

## 3. Filter Data
- Use search / dropdown filters

## 4. Apply Date Range
- Select dates → Apply
- View period summary

## 5. Analyze Charts
- Change time range
- Hover for details

## 6. View Insights
- Auto-generated financial analysis

## 7. Toggle Theme
- Switch between dark/light

---

# 🔧 Customization

## Modify Default Data
Edit in `state.js`:

```javascript
const DEFAULT_TRANSACTIONS = [
  { id: 1, date: "2025-01-15", amount: 1000, category: "Salary", type: "income" }
];

# 🧪 Limitations

* No backend (client-side only)
* Data limited to browser storage
* Large datasets may need pagination

---


# 🤝 Contributing

Pull requests are welcome!
Feel free to open issues for improvements.


---

# 🙌 Acknowledgements

* Chart.js
* Font Awesome
* Google Fonts

---

# 👨‍💻 Author

Made with ❤️ by **Nitish Ojha**
