"use client";

import { useState, useEffect } from "react";
import { X, RefreshCcw, Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateWidget } from "@/store/widgetSlice";

/* UTILITIES (same as before) */
const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let current = obj;

  for (let part of parts) {
    const arr = part.match(/^(.+?)\[(\d+)\]$/);
    if (arr) current = current?.[arr[1]]?.[Number(arr[2])];
    else current = current?.[part];
    if (current === undefined || current === null) return undefined;
  }
  return current;
};

const extractNestedFields = (obj, prefix = "") => {
  let paths = [];
  if (!obj || typeof obj !== "object") return [];
  Object.entries(obj).forEach(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      paths.push(full);
      value.forEach((v, i) => {
        const arrPath = `${full}[${i}]`;
        if (typeof v === "object")
          paths = [...paths, arrPath, ...extractNestedFields(v, arrPath)];
        else paths.push(arrPath);
      });
    } else if (typeof value === "object")
      paths = [...paths, ...extractNestedFields(value, full)];
    else paths.push(full);
  });
  return paths;
};

const extractArrayNodes = (obj, prefix = "") => {
  let nodes = [];
  if (!obj || typeof obj !== "object") return [];
  Object.entries(obj).forEach(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) nodes.push(full);
    else if (typeof value === "object")
      nodes = [...nodes, ...extractArrayNodes(value, full)];
  });
  return nodes;
};

const extractArrayColumns = (json, arrayPath) => {
  try {
    let node = json;
    arrayPath.split(".").forEach((p) => (node = node?.[p]));
    if (!Array.isArray(node) || !node[0] || typeof node[0] !== "object")
      return [];
    return Object.keys(node[0]);
  } catch {
    return [];
  }
};

/* =====================================================
   CONFIGURE WIDGET MODAL (MODE LOCKED)
===================================================== */
export default function ConfigureWidgetModal({ widget, onClose }) {
  const dispatch = useDispatch();

  /* PRE-FILLED FIELDS */
  const [widgetName, setWidgetName] = useState(widget.name);
  const [apiUrl, setApiUrl] = useState(widget.apiUrl);
  const [interval, setInterval] = useState(widget.interval);

  const [headers, setHeaders] = useState(widget.headers || []);
  const [params, setParams] = useState(widget.params || []);

  const displayMode = widget.displayMode; // 🔒 LOCKED MODE

  const [responseJson, setResponseJson] = useState(null);
  const [availableFields, setAvailableFields] = useState(
    widget.availableFields || []
  );
  const [arrayNodes, setArrayNodes] = useState([]);
  const [selectedArray, setSelectedArray] = useState(widget.arrayPath || "");
  const [arrayColumns, setArrayColumns] = useState([]);

  const [cardFields, setCardFields] = useState(widget.cardFields || []);
  const [tableColumns, setTableColumns] = useState(widget.tableColumns || []);

  const [chartXField, setChartXField] = useState(widget.chartXField || "");
  const [chartYField, setChartYField] = useState(widget.chartYField || "");

  const [tested, setTested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* Build request */
  const buildFinalUrl = () => {
    const q = params
      .filter((p) => p.key && p.value)
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");
    return q ? `${apiUrl}${apiUrl.includes("?") ? "&" : "?"}${q}` : apiUrl;
  };

  const buildHeaders = () => {
    const obj = {};
    headers.forEach((h) => h.key && h.value && (obj[h.key] = h.value));
    return obj;
  };

  /* Test API */
  const handleTestApi = async () => {
    if (!apiUrl.trim()) return alert("Enter API URL first.");
    setLoading(true);

    try {
      const res = await fetch(buildFinalUrl(), { headers: buildHeaders() });
      const json = await res.json();

      setResponseJson(json);

      const fields = extractNestedFields(json);
      setAvailableFields(fields);

      const arrays = extractArrayNodes(json);
      setArrayNodes(arrays);

      if (selectedArray) {
        const cols = extractArrayColumns(json, selectedArray);
        setArrayColumns(cols);
      }

      setTested(true);
    } catch (err) {
      alert("Failed to fetch API.");
    }
    setLoading(false);
  };

  /* Auto-update columns */
  useEffect(() => {
    if (selectedArray && responseJson) {
      const cols = extractArrayColumns(responseJson, selectedArray);
      setArrayColumns(cols);
    }
  }, [selectedArray, responseJson]);

  /* Save */
  const handleSave = () => {
    dispatch(
      updateWidget({
        id: widget.id,
        data: {
          name: widgetName,
          apiUrl,
          interval,
          headers: headers.filter((h) => h.key && h.value),
          params: params.filter((p) => p.key && p.value),
          availableFields,
          arrayPath: selectedArray,
          cardFields,
          tableColumns,
          chartXField,
          chartYField,
        },
      })
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="w-full max-w-2xl bg-slate-900 p-6 rounded-xl max-h-[90vh] overflow-y-auto text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Configure Widget</h2>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Widget Name */}
        <label className="block mb-2">Widget Name</label>
        <input
          value={widgetName}
          onChange={(e) => setWidgetName(e.target.value)}
          className="w-full bg-slate-800 p-2 rounded mb-4"
        />

        {/* API URL */}
        <label className="block mb-2">API URL</label>
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="w-full bg-slate-800 p-2 rounded mb-4"
        />

        {/* HEADERS */}
        <label className="block mb-2">Headers</label>
        {headers.map((h, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className="bg-slate-800 p-2 rounded flex-1"
              placeholder="Key"
              value={h.key}
              onChange={(e) => {
                const copy = [...headers];
                copy[i].key = e.target.value;
                setHeaders(copy);
              }}
            />
            <input
              className="bg-slate-800 p-2 rounded flex-1"
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
                className="text-red-400"
                onClick={() => setHeaders(headers.filter((_, id) => id !== i))}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          className="text-blue-400 text-sm mb-4"
          onClick={() => setHeaders([...headers, { key: "", value: "" }])}
        >
          + Add Header
        </button>

        {/* PARAMS */}
        <label className="block mb-2">URL Params</label>
        {params.map((p, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className="bg-slate-800 p-2 rounded flex-1"
              placeholder="Key"
              value={p.key}
              onChange={(e) => {
                const copy = [...params];
                copy[i].key = e.target.value;
                setParams(copy);
              }}
            />
            <input
              className="bg-slate-800 p-2 rounded flex-1"
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
                className="text-red-400"
                onClick={() => setParams(params.filter((_, id) => id !== i))}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          className="text-blue-400 text-sm mb-4"
          onClick={() => setParams([...params, { key: "", value: "" }])}
        >
          + Add Param
        </button>

        {/* INTERVAL */}
        <label className="block mb-2">Refresh Interval (seconds)</label>
        <input
          type="number"
          className="bg-slate-800 p-2 rounded w-full mb-4"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        />

        {/* TEST API BUTTON */}
        <button
          className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2 mb-4"
          disabled={loading}
          onClick={handleTestApi}
        >
          {loading ? (
            "Testing..."
          ) : (
            <>
              <RefreshCcw size={16} /> Test API
            </>
          )}
        </button>

        {/* CONDITIONAL UI BASED ON MODE (LOCKED) */}

        {/* CARD MODE */}
        {displayMode === "card" && tested && (
          <>
            <label className="block mb-2">Search Fields</label>
            <input
              className="bg-slate-800 p-2 rounded w-full mb-3"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <label>Select Card Fields</label>
            <div className="bg-slate-800 border border-slate-700 rounded max-h-60 overflow-y-auto mb-4">
              {availableFields
                .filter((f) => f.toLowerCase().includes(search.toLowerCase()))
                .map((f) => (
                  <div
                    key={f}
                    className="flex justify-between px-3 py-2 border-b border-slate-700"
                  >
                    <span className="font-mono text-sm">{f}</span>
                    <button
                      className={
                        cardFields.includes(f)
                          ? "text-green-400"
                          : "text-gray-400"
                      }
                      onClick={() =>
                        setCardFields((prev) =>
                          prev.includes(f)
                            ? prev.filter((x) => x !== f)
                            : [...prev, f]
                        )
                      }
                    >
                      {cardFields.includes(f) ? "✓" : <Plus size={14} />}
                    </button>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* TABLE MODE */}
        {displayMode === "table" && tested && (
          <>
            <label>Select Data Array</label>
            <select
              className="bg-slate-800 p-2 rounded w-full mb-3"
              value={selectedArray}
              onChange={(e) => setSelectedArray(e.target.value)}
            >
              <option value="">Select array...</option>
              {arrayNodes.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            {selectedArray && arrayColumns.length > 0 && (
              <>
                <label>Select Table Columns</label>
                <div className="bg-slate-800 border border-slate-700 rounded max-h-60 overflow-y-auto mb-4">
                  {arrayColumns.map((col) => (
                    <div
                      key={col}
                      className="flex justify-between px-3 py-2 border-b border-slate-700"
                    >
                      <span>{col}</span>
                      <button
                        className={
                          tableColumns.includes(col)
                            ? "text-green-400"
                            : "text-gray-400"
                        }
                        onClick={() =>
                          setTableColumns((prev) =>
                            prev.includes(col)
                              ? prev.filter((x) => x !== col)
                              : [...prev, col]
                          )
                        }
                      >
                        {tableColumns.includes(col) ? "✓" : <Plus size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* CHART MODE */}
        {displayMode === "chart" && tested && (
          <>
            <label>X Axis Field</label>
            <select
              className="bg-slate-800 p-2 rounded w-full mb-3"
              value={chartXField}
              onChange={(e) => setChartXField(e.target.value)}
            >
              <option value="">Select field...</option>
              {availableFields.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>

            <label>Y Axis Field</label>
            <select
              className="bg-slate-800 p-2 rounded w-full mb-3"
              value={chartYField}
              onChange={(e) => setChartYField(e.target.value)}
            >
              <option value="">Select field...</option>
              {availableFields.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end mt-6 gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
