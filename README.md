# FinBoard – Custom Finance Dashboard

A customizable real-time finance dashboard that lets users build their own monitoring panels by connecting to any financial API, mapping fields dynamically, and visualizing data using cards, tables, and charts.

The application includes JSON explorer tools, caching, export/import,state management, data persistence and a fully modular widget system with advanced configuration options.

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

The system supports creating and managing widgets, including deletion and configuration.

| Type                 | Description                                                                                 | Use Case                                             |
| :------------------- | :------------------------------------------------------------------------------------------ | :--------------------------------------------------- |
| **📊 Card Widgets**  | Displays single key metrics, prices, change %, etc..                                        | Watchlist metrics, Market Gainers, Performance Data. |
| **📋 Table Widgets** | A paginated list or grid of data with filters and search functionality.                     | Stock screeners, comprehensive financial data lists. |
| **📈 Chart Widgets** | Line or Candle graphs showing stock prices over various intervals (Daily, Weekly, Monthly). | Historical trends and volatility analysis.           |

**Widget Capabilities**

- Add unlimited widgets.
- Configure each widget independently.
- Auto-refresh with configurable intervals.
- Fully responsive layout.

### 🌐 2. Advanced API Handling

- **Smart Data Mapping:** Users can explore API responses and select specific fields to display, supporting dynamic integration with multiple financial APIs.
- **API Controls:** Supports custom headers, dynamic query params, flexible refresh intervals.
- **Error Handling:** Comprehensive handling of loading, error, and empty data states.

### 🎨 3. Modern, Clean UI

- **Design:** Dark theme with Tailwind CSS.
- **Experience:** Mobile-friendly layout and accessible modals.
- **States:** Smooth skeleton loaders for handling loading and error states.

### 💾 4. Data Persistence

- **Browser Storage Integration:** All widget configurations and dashboard layouts persist across sessions using Redux Toolkit.
- **State Recovery:** Complete dashboard restoration upon page refresh.
- **Configuration Backup:** Export/import functionality for dashboard configurations.

### ⚡ 5. Performance Optimizations

- Lazy-loaded modals via `React.Suspense`
- Memoized widgets (`React.memo`)
- Efficient data fetching with optimized polling intervals.
- Debounced table search

---

## 🛠 Tech Stack

| Category      | Tools             |
| :------------ | :---------------- |
| **Framework** | **Next.js 14**    |
| **Styling**   | **Tailwind CSS**  |
| **State**     | **Redux Toolkit** |
| **Charts**    | **Recharts**      |
| **Icons**     | **Lucide React**  |

---

## 🚀 Getting Started

**Prerequisites**

- Node.js 18+
- npm / yarn / pnpm

### Installation

1.  **Clone the Repo**
    ```bash
    git clone [https://github.com/devopriyanshu/finboard.git](https://github.com/devopriyanshu/finboard.git)
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
