"use client";

import { RotateCcw, Settings, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ConfigureWidgetModal from "../modals/ConfigureWidgetModal";
import { updateWidget, deleteWidget } from "@/store/widgetSlice";

/* ------------------------------------------------------
   ✅ Smart Nested Value Resolver
   Supports:
     - data.rates.INR
     - data.items[0].price
     - a.b.c[2].meta.value
------------------------------------------------------- */
const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;

  return path.split(".").reduce((acc, key) => {
    if (!acc) return undefined;

    // Handle array syntax → field[3]
    const match = key.match(/(\w+)\[(\d+)\]/);

    if (match) {
      const [, arrKey, idx] = match;
      return acc[arrKey]?.[Number(idx)];
    }

    return acc[key];
  }, obj);
};

// ------------------------------------------------------
// Build URL
// ------------------------------------------------------
const buildUrl = (widget) => {
  let url = widget.apiUrl;

  if (widget.params?.length > 0) {
    const query = widget.params
      .filter((p) => p.key && p.value)
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");

    url += url.includes("?") ? `&${query}` : `?${query}`;
  }

  return url;
};

// ------------------------------------------------------
// Build Headers
// ------------------------------------------------------
const buildHeaders = (widget) => {
  const h = {};
  widget.headers?.forEach((item) => {
    if (item.key && item.value) h[item.key] = item.value;
  });
  return h;
};

// ------------------------------------------------------
// COMPONENT
// ------------------------------------------------------
export default function CardWidget({ widget, onConfigure, onDelete }) {
  const dispatch = useDispatch();

  const [apiData, setApiData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("--");
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  /* ------------------------------------------------------
     🔄 FETCH API
  ------------------------------------------------------ */
  const fetchData = async () => {
    try {
      const url = buildUrl(widget);
      const headers = buildHeaders(widget);

      const res = await fetch(url, { headers });
      const json = await res.json();

      setApiData(json);
      const now = new Date().toLocaleTimeString();
      setLastUpdated(now);

      dispatch(
        updateWidget({
          id: widget.id,
          changes: { lastUpdated: now },
        })
      );
    } catch (err) {
      console.error("API Fetch Error →", err);
    }
  };

  /* ------------------------------------------------------
     ⏱️ AUTO REFRESH
  ------------------------------------------------------ */
  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, (widget.interval ?? 30) * 1000);
    return () => clearInterval(timer);
  }, [widget.apiUrl, widget.params, widget.headers, widget.interval]);

  /* ------------------------------------------------------
     🧠 COMPUTE CARD VALUES USING NESTED PATHS
  ------------------------------------------------------ */
  const fields =
    widget.cardFields?.map((path) => ({
      label: path,
      value: apiData ? resolvePath(apiData, path) : "--",
    })) ?? [];

  /* ------------------------------------------------------
     UI
  ------------------------------------------------------ */
  return (
    <>
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-80 shadow-xl hover:border-slate-500 transition">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-medium">{widget.name}</h2>
            <span className="bg-slate-700 text-xs px-2 py-0.5 rounded">
              {widget.interval}s
            </span>
          </div>

          <div className="flex gap-3 text-slate-400">
            <RotateCcw
              size={17}
              className="cursor-pointer hover:text-white"
              onClick={fetchData}
            />

            <Settings
              size={17}
              className="cursor-pointer hover:text-white"
              onClick={() => onConfigure(widget)}
            />

            <Trash
              size={17}
              className="cursor-pointer hover:text-red-400"
              onClick={() => onDelete(widget.id)}
            />
          </div>
        </div>

        {/* FIELDS */}
        <div className="space-y-3 mt-3">
          {fields.map((f) => (
            <div key={f.label} className="flex justify-between">
              <span className="text-slate-400 text-sm">{f.label}</span>

              <span className="text-white font-medium">
                {f.value !== undefined && f.value !== null
                  ? String(f.value)
                  : "--"}
              </span>
            </div>
          ))}
        </div>

        {/* LAST UPDATED */}
        <p className="text-xs text-slate-500 mt-4 border-t border-slate-700 pt-2">
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* CONFIGURE MODAL */}
      {isConfigOpen && (
        <ConfigureWidgetModal
          widget={widget}
          onClose={() => setIsConfigOpen(false)}
          onUpdate={(changes) =>
            dispatch(updateWidget({ id: widget.id, changes }))
          }
        />
      )}
    </>
  );
}
