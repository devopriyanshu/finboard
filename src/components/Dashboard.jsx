"use client";
import { useSelector, useDispatch } from "react-redux";
import { addWidget, deleteWidget } from "@/store/widgetSlice";
import { useState, useEffect, lazy, Suspense, useRef } from "react";
import {
  Plus,
  RotateCcw,
  Trash,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Download,
  Upload,
} from "lucide-react";

import AddWidgetModal from "./modals/AddWidgetModal";
import ConfigureWidgetModal from "./modals/ConfigureWidgetModal";

import CardWidget from "./widgets/CardWidget";

import { EnhancedChartWidget } from "./widgets/ChartWidget";
import { EnhancedTableWidget } from "./widgets/TableWidget";

const WidgetSkeleton = ({ type }) => (
  <div
    className={`bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-xl animate-pulse ${
      type === "chart"
        ? "col-span-full lg:col-span-2"
        : type === "table"
        ? "col-span-full"
        : ""
    }`}
  >
    <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-800 rounded"></div>
      <div className="h-4 bg-slate-800 rounded w-5/6"></div>
      <div className="h-4 bg-slate-800 rounded w-4/6"></div>
    </div>
  </div>
);

export default function Dashboard() {
  const widgets = useSelector((state) => state.widgets.list);
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configWidget, setConfigWidget] = useState(null);
  const [loadedWidgets, setLoadedWidgets] = useState(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef(null);

  // Load from memory state (simulating localStorage)
  useEffect(() => {
    console.log("Loaded widgets:", widgets);
  }, []);

  // Save to memory state whenever widgets change
  useEffect(() => {
    if (widgets.length > 0) {
      console.log("Saving widgets:", widgets);
    }
  }, [widgets]);

  const handleAddWidget = (widget) => {
    dispatch(addWidget(widget));
    setIsModalOpen(false);
  };

  const handleConfigureWidget = (widget) => {
    setConfigWidget(widget);
  };

  const handleDeleteWidget = (id) => {
    if (confirm("Delete this widget?")) {
      dispatch(deleteWidget(id));
    }
  };

  // Mark widget as loaded (for lazy loading effect)
  const handleWidgetLoad = (id) => {
    setLoadedWidgets((prev) => new Set([...prev, id]));
  };

  // Export dashboard configuration
  const handleExport = () => {
    const config = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      widgets: widgets,
      totalWidgets: widgets.length,
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard-config-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
  };

  // Import dashboard configuration
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        const config = JSON.parse(content);

        // Validate the configuration
        if (!config.widgets || !Array.isArray(config.widgets)) {
          alert("Invalid configuration file format");
          return;
        }

        // Ask user how to import
        const replace = confirm(
          `Import ${config.widgets.length} widget(s)?\n\n` +
            `Click OK to REPLACE current widgets\n` +
            `Click Cancel to MERGE with current widgets`
        );

        if (replace) {
          // Replace all widgets
          config.widgets.forEach((widget, index) => {
            if (index === 0) {
              // Delete all existing widgets first
              widgets.forEach((w) => dispatch(deleteWidget(w.id)));
            }
            dispatch(addWidget(widget));
          });
        } else {
          // Merge - add to existing widgets
          config.widgets.forEach((widget) => {
            // Generate new ID to avoid conflicts
            const newWidget = {
              ...widget,
              id: `widget-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            };
            dispatch(addWidget(newWidget));
          });
        }

        alert(`Successfully imported ${config.widgets.length} widget(s)!`);
      } catch (error) {
        console.error("Import error:", error);
        alert("Failed to import configuration. Please check the file format.");
      }
    };

    reader.readAsText(file);
    event.target.value = ""; // Reset file input
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              API Dashboard
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Monitor your APIs in real-time
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3">
            {/* Export/Import Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors whitespace-nowrap border border-slate-700"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export/Import</span>
              </button>

              {/* Dropdown Menu */}
              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                    <button
                      onClick={handleExport}
                      disabled={widgets.length === 0}
                      className="w-full px-4 py-3 text-left hover:bg-slate-700 text-white flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={16} />
                      <span>Export Config</span>
                    </button>
                    <button
                      onClick={handleImportClick}
                      className="w-full px-4 py-3 text-left hover:bg-slate-700 text-white flex items-center gap-3 transition-colors border-t border-slate-700"
                    >
                      <Upload size={16} />
                      <span>Import Config</span>
                    </button>
                  </div>
                </>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>

            {/* Add Widget Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors whitespace-nowrap"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add Widget</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* MAIN GRID - Responsive with better sizing */}
        {widgets.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="text-slate-500 mb-4 text-base sm:text-lg">
              No widgets yet
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors"
            >
              Create Your First Widget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 auto-rows-auto">
            {widgets.map((widget) => {
              // Determine grid span based on widget type
              const getGridClass = () => {
                switch (widget.displayMode) {
                  case "chart":
                    // Charts take 2 columns on large screens, full width on mobile
                    return "col-span-1 lg:col-span-2 xl:col-span-2";
                  case "table":
                    // Tables take full width
                    return "col-span-1 lg:col-span-2 xl:col-span-3";
                  case "card":
                  default:
                    // Cards take 1 column
                    return "col-span-1";
                }
              };

              return (
                <div key={widget.id} className={getGridClass()}>
                  <Suspense
                    fallback={<WidgetSkeleton type={widget.displayMode} />}
                  >
                    {widget.displayMode === "card" && (
                      <CardWidget
                        widget={widget}
                        onDelete={handleDeleteWidget}
                        onConfigure={handleConfigureWidget}
                      />
                    )}

                    {widget.displayMode === "table" && (
                      <EnhancedTableWidget
                        widget={widget}
                        onDelete={handleDeleteWidget}
                        onConfigure={handleConfigureWidget}
                      />
                    )}

                    {widget.displayMode === "chart" && (
                      <EnhancedChartWidget
                        widget={widget}
                        onDelete={handleDeleteWidget}
                        onConfigure={handleConfigureWidget}
                      />
                    )}
                  </Suspense>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD WIDGET MODAL */}
        {isModalOpen && (
          <Suspense
            fallback={
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white">Loading...</div>
              </div>
            }
          >
            <AddWidgetModal
              onClose={() => setIsModalOpen(false)}
              onAdd={handleAddWidget}
            />
          </Suspense>
        )}

        {/* CONFIGURE WIDGET MODAL */}
        {configWidget && (
          <Suspense
            fallback={
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white">Loading...</div>
              </div>
            }
          >
            <ConfigureWidgetModal
              widget={configWidget}
              onClose={() => setConfigWidget(null)}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
