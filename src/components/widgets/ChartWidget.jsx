import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { RefreshCcw, Trash, Settings } from "lucide-react";

// Same path resolver from your dashboard
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

// Extract array rows
const extractRows = (data, arrayPath) => {
  if (!data || !arrayPath) return [];
  const arr = resolvePath(data, arrayPath);
  return Array.isArray(arr) ? arr : [];
};

export const EnhancedChartWidget = ({ widget, onDelete, onConfigure }) => {
  const [apiData, setApiData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("--");
  const [loading, setLoading] = useState(true);

  const buildUrl = () => {
    let url = widget.apiUrl;
    if (widget.params?.length > 0) {
      const query = widget.params
        .filter((p) => p.key && p.value)
        .map(
          (p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`
        )
        .join("&");
      url += url.includes("?") ? `&${query}` : `?${query}`;
    }
    return url;
  };

  const buildHeaders = () => {
    const h = {};
    widget.headers?.forEach((item) => {
      if (item.key && item.value) h[item.key] = item.value;
    });
    return h;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = buildUrl();
      const headers = buildHeaders();
      const res = await fetch(url, { headers });
      const json = await res.json();
      setApiData(json);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Chart Fetch Error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, (widget.interval ?? 30) * 1000);
    return () => clearInterval(timer);
  }, [widget.apiUrl, widget.params, widget.headers, widget.interval]);

  const rows = extractRows(apiData, widget.arrayPath);

  const chartData = rows.map((row) => ({
    [widget.chartXField]: row[widget.chartXField],
    [widget.chartYField]: row[widget.chartYField],
  }));

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-5 shadow-xl text-white h-full">
      {/* -----------------------------------------------------------
          HEADER WITH SETTINGS BUTTON (NEW)
      ------------------------------------------------------------ */}
      <div className="flex justify-between items-center mb-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-semibold">{widget.name}</h2>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded">
            {widget.interval}s
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 text-slate-400">
          {/* Refresh */}
          <RefreshCcw
            className="cursor-pointer hover:text-white transition-colors"
            size={18}
            onClick={fetchData}
          />

          {/* ✅ CONFIG SETTINGS BUTTON */}
          <Settings
            className="cursor-pointer hover:text-white transition-colors"
            size={18}
            onClick={() => onConfigure(widget)}
          />

          {/* Delete */}
          <Trash
            className="cursor-pointer hover:text-red-400 transition-colors"
            size={18}
            onClick={() => onDelete(widget.id)}
          />
        </div>
      </div>

      {/* -----------------------------------------------------------
          CHART AREA
      ------------------------------------------------------------ */}
      <div className="h-64 sm:h-80 lg:h-96">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="animate-pulse">Loading chart...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey={widget.chartXField}
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey={widget.chartYField}
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* -----------------------------------------------------------
          FOOTER
      ------------------------------------------------------------ */}
      <div className="text-xs text-slate-500 border-t border-slate-700 pt-2 mt-3">
        Last updated: {lastUpdated} • {chartData.length} data points
      </div>
    </div>
  );
};
