# FinBoard – Custom Finance Dashboard

[cite_start]A customizable **real-time finance dashboard** that lets users build their own monitoring panels by connecting to any financial API and mapping the data dynamically[cite: 4, 18, 87].

[cite_start]The application supports robust state management, data persistence, and intuitive widget configuration[cite: 9, 33].

---

## 📌 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🏗 Architecture](#-architecture)
- [🔧 Widget Types](#-widget-types)
- [🔌 API Integration](#-api-integration)
- [🗄 State Management](#-state-management)
- [⚡ Performance Optimizations](#-performance-optimizations)
- [🎨 Customization](#-customization)
- [📤 Export / Import](#-export--import)
- [🚀 Deployment](#-deployment)
- [❗ Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## ✨ Features

### 🔧 1. Build & Customize Widgets

[cite_start]The system supports creating and managing widgets, including deletion and configuration[cite: 17, 31, 33].

| Type                 | Description                                                                                             | Use Case                                                                           |
| :------------------- | :------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- |
| **📊 Card Widgets**  | [cite_start]Displays single key metrics, prices, change %, etc..                                        | [cite_start]Watchlist metrics, Market Gainers, Performance Data[cite: 23, 25, 27]. |
| **📋 Table Widgets** | [cite_start]A paginated list or grid of data with filters and search functionality.                     | [cite_start]Stock screeners, comprehensive financial data lists[cite: 28].         |
| **📈 Chart Widgets** | [cite_start]Line or Candle graphs showing stock prices over various intervals (Daily, Weekly, Monthly). | Historical trends and volatility analysis.                                         |

**Widget Capabilities**

- [cite_start]Add unlimited widgets[cite: 18].
- [cite_start]Configure each widget independently[cite: 33].
- [cite_start]Auto-refresh with configurable intervals[cite: 46, 88].
- [cite_start]Fully responsive layout[cite: 92].

### 🌐 2. Advanced API Handling

- [cite_start]**Smart Data Mapping:** Users can explore API responses and select specific fields to display, supporting dynamic integration with multiple financial APIs[cite: 7, 87, 99].
- [cite_start]**API Controls:** Supports custom headers, dynamic query params, flexible refresh intervals[cite: 46, 88].
- [cite_start]**Error Handling:** Comprehensive handling of loading, error, and empty data states[cite: 93].

### 🎨 3. Modern, Clean UI

- **Design:** Dark theme with Tailwind CSS.
- [cite_start]**Experience:** Mobile-friendly layout and accessible modals[cite: 92].
- [cite_start]**States:** Smooth skeleton loaders for handling loading and error states[cite: 93].

### 💾 4. Data Persistence

- [cite_start]**Browser Storage Integration:** All widget configurations and dashboard layouts persist across sessions using Redux Toolkit[cite: 9, 95].
- [cite_start]**State Recovery:** Complete dashboard restoration upon page refresh[cite: 96].
- [cite_start]**Configuration Backup:** Export/import functionality for dashboard configurations.

### ⚡ 5. Performance Optimizations

- Lazy-loaded modals via `React.Suspense`
- Memoized widgets (`React.memo`)
- [cite_start]Efficient data fetching with optimized polling intervals.
- Debounced table search

---

## 🛠 Tech Stack

| Category      | Tools                                                     |
| :------------ | :-------------------------------------------------------- |
| **Framework** | [cite_start]**Next.js 14** [cite: 11]                     |
| **Styling**   | [cite_start]**Tailwind CSS** [cite: 12]                   |
| **State**     | [cite_start]**Redux Toolkit** [cite: 13]                  |
| **Charts**    | [cite_start]**Recharts** (or Chart.js/similar) [cite: 14] |
| **Icons**     | **Lucide React**                                          |

---

## 🚀 Getting Started

**Prerequisites**

- Node.js 18+
- npm / yarn / pnpm

### Installation

1.  **Clone the Repo**
    ```bash
    git clone [https://github.com/yourusername/finboard.git](https://github.com/yourusername/finboard.git)
    cd finboard
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Start Dev Server**
    ```bash
    npm run dev
    ```
    Open → `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```
