import { useState, useEffect } from "react";
import {
  X,
  RefreshCcw,
  Plus,
  RotateCcw,
  Settings,
  Trash,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { addWidget, deleteWidget } from "@/store/widgetSlice";
import JSONFieldExplorer from "../json/JSONFieldExplorer";

/* ============================================
   UTILITY: Resolve Nested Paths
   Supports: data.rates.INR, data[0].price, a.b[2].c
============================================ */
const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;

  const parts = path.split(".");
  let current = obj;

  for (let part of parts) {
    const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/);

    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current = current?.[key]?.[Number(index)];
    } else {
      current = current?.[part];
    }

    if (current === undefined || current === null) return undefined;
  }

  return current;
};

/* ============================================
   UTILITY: Extract All Nested Fields
============================================ */
const extractNestedFields = (obj, prefix = "") => {
  let paths = [];
  if (!obj || typeof obj !== "object") return [];

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const full = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      paths.push(full);
      value.forEach((item, index) => {
        if (item && typeof item === "object") {
          paths.push(`${full}[${index}]`);
          paths = [...paths, ...extractNestedFields(item, `${full}[${index}]`)];
        } else {
          paths.push(`${full}[${index}]`);
        }
      });
    } else if (value && typeof value === "object") {
      paths = [...paths, ...extractNestedFields(value, full)];
    } else {
      paths.push(full);
    }
  });

  return paths;
};

/* ============================================
   UTILITY: Extract Array Nodes
============================================ */
const extractArrayNodes = (obj, prefix = "") => {
  let nodes = [];
  if (!obj || typeof obj !== "object" || obj === null) return [];

  for (const key of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (Array.isArray(value)) {
      nodes.push(full);
    }

    if (!Array.isArray(value) && typeof value === "object" && value !== null) {
      nodes = [...nodes, ...extractArrayNodes(value, full)];
    }
  }

  return nodes;
};

/* ============================================
   UTILITY: Extract Array Columns
============================================ */
const extractArrayColumns = (json, arrayPath) => {
  try {
    if (!json || !arrayPath) return [];

    const parts = arrayPath.split(".");
    let node = json;

    for (const p of parts) {
      node = node?.[p];
      if (node === undefined) return [];
    }

    if (!Array.isArray(node) || node.length === 0) return [];

    const first = node[0];
    if (!first || typeof first !== "object") return [];

    return Object.keys(first);
  } catch (e) {
    console.error("Column extraction failed:", e);
    return [];
  }
};

/* ============================================
   ADD WIDGET MODAL
============================================ */
export default function AddWidgetModal({ onClose, onAdd }) {
  const [widgetName, setWidgetName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [interval, setInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState("card");
  const [search, setSearch] = useState("");

  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [params, setParams] = useState([{ key: "", value: "" }]);

  const [availableFields, setAvailableFields] = useState([]);
  const [arrayNodes, setArrayNodes] = useState([]);
  const [selectedArray, setSelectedArray] = useState("");
  const [arrayColumns, setArrayColumns] = useState([]);

  const [cardFields, setCardFields] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [chartXField, setChartXField] = useState("");
  const [chartYField, setChartYField] = useState("");

  const [responseJson, setResponseJson] = useState(null);
  const [tested, setTested] = useState(false);
  const [loading, setLoading] = useState(false);

  const buildFinalUrl = () => {
    let final = apiUrl;
    const q = params
      .filter((p) => p.key.trim() && p.value.trim())
      .map(
        (p) =>
          `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(
            p.value.trim()
          )}`
      )
      .join("&");
    if (q) final += final.includes("?") ? `&${q}` : `?${q}`;
    return final;
  };

  const buildHeaders = () => {
    let h = {};
    headers.forEach((p) => {
      if (p.key.trim() && p.value.trim()) {
        h[p.key.trim()] = p.value.trim();
      }
    });
    return h;
  };

  const handleTestApi = async () => {
    if (!apiUrl.trim()) return alert("Enter API URL first");

    setLoading(true);

    try {
      const res = await fetch(buildFinalUrl(), { headers: buildHeaders() });
      const json = await res.json();

      setResponseJson(json);
      setAvailableFields(extractNestedFields(json));

      const arrays = extractArrayNodes(json);
      setArrayNodes(arrays);

      if (arrays.length === 1) {
        setSelectedArray(arrays[0]);
        const cols = extractArrayColumns(json, arrays[0]);
        setArrayColumns(cols);
      } else {
        setSelectedArray("");
        setArrayColumns([]);
      }

      setTested(true);
    } catch (err) {
      console.error("Test API error:", err);
      alert("Failed to read API response.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (selectedArray && responseJson) {
      const cols = extractArrayColumns(responseJson, selectedArray);
      setArrayColumns(cols);
      setTableColumns([]);
    }
  }, [selectedArray, responseJson]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-slate-900 text-white rounded-xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Widget</h2>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <label className="block mb-2 text-sm font-medium">Widget Name</label>
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 mb-4"
          value={widgetName}
          onChange={(e) => setWidgetName(e.target.value)}
          placeholder="Stock Data / Currency Rates / User List"
        />

        <label className="block mb-2 text-sm font-medium">API URL</label>
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 mb-4"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://api.example.com/data"
        />

        <label className="block mb-2 text-sm font-medium">Headers</label>
        {headers.map((h, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className="flex-1 bg-slate-800 border border-slate-700 rounded p-2"
              placeholder="Key"
              value={h.key}
              onChange={(e) => {
                const copy = [...headers];
                copy[i].key = e.target.value;
                setHeaders(copy);
              }}
            />
            <input
              className="flex-1 bg-slate-800 border border-slate-700 rounded p-2"
              placeholder="Value"
              value={h.value}
              onChange={(e) => {
                const copy = [...headers];
                copy[i].value = e.target.value;
                setHeaders(copy);
              }}
            />
            {i > 0 && (
              <button
                onClick={() =>
                  setHeaders(headers.filter((_, idx) => idx !== i))
                }
                className="text-red-400 hover:text-red-300 px-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setHeaders([...headers, { key: "", value: "" }])}
          className="text-blue-400 hover:text-blue-300 text-sm mb-4"
        >
          + Add Header
        </button>

        <label className="block mb-2 text-sm font-medium">URL Params</label>
        {params.map((p, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className="flex-1 bg-slate-800 border border-slate-700 rounded p-2"
              placeholder="Key"
              value={p.key}
              onChange={(e) => {
                const copy = [...params];
                copy[i].key = e.target.value;
                setParams(copy);
              }}
            />
            <input
              className="flex-1 bg-slate-800 border border-slate-700 rounded p-2"
              placeholder="Value"
              value={p.value}
              onChange={(e) => {
                const copy = [...params];
                copy[i].value = e.target.value;
                setParams(copy);
              }}
            />
            {i > 0 && (
              <button
                onClick={() => setParams(params.filter((_, idx) => idx !== i))}
                className="text-red-400 hover:text-red-300 px-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setParams([...params, { key: "", value: "" }])}
          className="text-blue-400 hover:text-blue-300 text-sm mb-4"
        >
          + Add Param
        </button>

        <label className="block mb-2 text-sm font-medium">
          Refresh Interval (seconds)
        </label>
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 mb-4"
        />

        <button
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded flex items-center gap-2 mb-4"
          onClick={handleTestApi}
          disabled={loading}
        >
          {loading ? (
            "Testing..."
          ) : (
            <>
              <RefreshCcw size={16} /> Test API
            </>
          )}
        </button>

        {!tested && (
          <p className="text-slate-400 mb-4">Test API to load fields</p>
        )}
        <JSONFieldExplorer
          json={responseJson}
          selectedField={
            displayMode === "card"
              ? cardFields[cardFields.length - 1] || "" // last selected card field
              : selectedArray || "" // array path for table mode
          }
          onSelectField={(path) => {
            if (displayMode === "card") {
              // Add to card fields only if new
              setCardFields((prev) =>
                prev.includes(path) ? prev : [...prev, path]
              );
            }

            if (displayMode === "table") {
              setSelectedArray(path); // select array path
            }
          }}
        />

        {tested && (
          <>
            <div className="mt-4 p-3 bg-green-900/40 border border-green-700 rounded mb-4">
              ✓ API Connected — {availableFields.length} fields found,{" "}
              {arrayNodes.length} arrays detected
            </div>

            <label className="block mb-2 text-sm font-medium">
              Display Mode
            </label>
            <div className="flex gap-2 mb-4">
              {["card", "table", "chart"].map((mode) => (
                <button
                  key={mode}
                  className={`px-4 py-2 rounded border ${
                    displayMode === mode
                      ? "bg-green-600 border-green-500"
                      : "bg-slate-800 border-slate-700"
                  }`}
                  onClick={() => {
                    setDisplayMode(mode);
                    setCardFields([]);
                    setTableColumns([]);
                    setSelectedArray("");
                    setChartXField("");
                    setChartYField("");
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {displayMode === "card" && (
              <>
                <label className="block mb-2 text-sm font-medium">
                  Search Fields
                </label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 mb-3"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter fields..."
                />
                <label className="block mb-2 text-sm font-medium">
                  Select Card Fields
                </label>
                <div className="bg-slate-800 border border-slate-700 rounded max-h-60 overflow-y-auto mb-4">
                  {availableFields
                    .filter((f) =>
                      f.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((f) => (
                      <div
                        key={f}
                        className="flex justify-between items-center px-3 py-2 border-b border-slate-700 hover:bg-slate-700/50"
                      >
                        <span className="text-sm font-mono">{f}</span>
                        <button
                          onClick={() =>
                            setCardFields((prev) =>
                              prev.includes(f)
                                ? prev.filter((x) => x !== f)
                                : [...prev, f]
                            )
                          }
                          className={
                            cardFields.includes(f)
                              ? "text-green-400"
                              : "text-slate-400"
                          }
                        >
                          {cardFields.includes(f) ? "✓" : <Plus size={14} />}
                        </button>
                      </div>
                    ))}
                </div>
                {cardFields.length > 0 && (
                  <div className="text-sm text-slate-400 mb-4">
                    Selected: {cardFields.join(", ")}
                  </div>
                )}
              </>
            )}

            {displayMode === "table" && (
              <>
                <label className="block mb-2 text-sm font-medium">
                  Select Data Array
                </label>
                <select
                  value={selectedArray}
                  onChange={(e) => {
                    setSelectedArray(e.target.value);
                    setTableColumns([]);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 mb-3"
                >
                  <option value="">Choose an array...</option>
                  {arrayNodes.map((arr) => (
                    <option key={arr} value={arr}>
                      {arr}
                    </option>
                  ))}
                </select>

                {selectedArray && arrayColumns.length > 0 && (
                  <>
                    <label className="block mb-2 text-sm font-medium">
                      Select Table Columns
                    </label>
                    <div className="bg-slate-800 border border-slate-700 rounded max-h-60 overflow-y-auto mb-4">
                      {arrayColumns.map((col) => (
                        <div
                          key={col}
                          className="flex justify-between items-center px-3 py-2 border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <span className="text-sm font-mono">{col}</span>
                          <button
                            onClick={() =>
                              setTableColumns((prev) =>
                                prev.includes(col)
                                  ? prev.filter((x) => x !== col)
                                  : [...prev, col]
                              )
                            }
                            className={
                              tableColumns.includes(col)
                                ? "text-green-400"
                                : "text-slate-400"
                            }
                          >
                            {tableColumns.includes(col) ? (
                              "✓"
                            ) : (
                              <Plus size={14} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                    {tableColumns.length > 0 && (
                      <div className="text-sm text-slate-400 mb-4">
                        Selected: {tableColumns.join(", ")}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {displayMode === "chart" && (
              <>
                {/* STEP 1: Select Array (just like table mode) */}
                <label className="block mb-2 text-sm font-medium">
                  Select Data Array
                </label>
                <select
                  value={selectedArray}
                  onChange={(e) => {
                    setSelectedArray(e.target.value);
                    setChartXField("");
                    setChartYField("");
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 mb-3"
                >
                  <option value="">Choose an array...</option>
                  {arrayNodes.map((arr) => (
                    <option key={arr} value={arr}>
                      {arr}
                    </option>
                  ))}
                </select>

                {/* STEP 2: Select X and Y from array columns */}
                {selectedArray && arrayColumns.length > 0 && (
                  <>
                    <label className="block mb-2 text-sm font-medium">
                      X Axis Field (usually timestamp/date)
                    </label>
                    <select
                      value={chartXField}
                      onChange={(e) => setChartXField(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 mb-3"
                    >
                      <option value="">Select X axis...</option>
                      {arrayColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>

                    <label className="block mb-2 text-sm font-medium">
                      Y Axis Field (usually price/value)
                    </label>
                    <select
                      value={chartYField}
                      onChange={(e) => setChartYField(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 mb-4"
                    >
                      <option value="">Select Y axis...</option>
                      {arrayColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>

                    {/* Preview selected fields */}
                    {chartXField && chartYField && (
                      <div className="text-sm text-green-400 mb-3 p-2 bg-green-900/20 rounded">
                        Chart: {chartXField} (X) vs {chartYField} (Y)
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!widgetName.trim()) {
                    alert("Please enter a widget name");
                    return;
                  }

                  if (displayMode === "card" && cardFields.length === 0) {
                    alert("Please select at least one field for the card");
                    return;
                  }

                  if (
                    displayMode === "table" &&
                    (!selectedArray || tableColumns.length === 0)
                  ) {
                    alert("Please select an array and at least one column");
                    return;
                  }

                  if (
                    displayMode === "chart" &&
                    (!chartXField || !chartYField)
                  ) {
                    alert("Please select both X and Y axis fields");
                    return;
                  }

                  onAdd({
                    id: crypto.randomUUID(),
                    name: widgetName,
                    apiUrl,
                    interval: Number(interval),
                    displayMode,
                    headers: headers.filter((h) => h.key && h.value),
                    params: params.filter((p) => p.key && p.value),
                    cardFields,
                    chartXField,
                    chartYField,
                    arrayPath: selectedArray,
                    tableColumns,
                    availableFields,
                  });
                }}
                className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded"
              >
                Add Widget
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
