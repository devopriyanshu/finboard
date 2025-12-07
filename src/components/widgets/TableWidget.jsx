"use client";

import {
  RotateCcw,
  Settings,
  Trash,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

/* -------------------------------------------------------
    Resolve nested path: a.b.c
--------------------------------------------------------*/
/* -------------------------------------------------------
    Resolve nested path: supports a.b.c[2].price
--------------------------------------------------------*/
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

/* -------------------------------------------------------
    COMPONENT
--------------------------------------------------------*/
export const EnhancedTableWidget = ({ widget, onDelete, onConfigure }) => {
  const [apiData, setApiData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("--");
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const pageSize = 10;

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
    try {
      const url = buildUrl();
      const headers = buildHeaders();
      const res = await fetch(url, { headers });
      const json = await res.json();
      setApiData(json);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Table Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, (widget.interval ?? 30) * 1000);
    return () => clearInterval(timer);
  }, [widget.apiUrl, widget.params, widget.headers, widget.interval]);

  const extractRows = (data, arrayPath) => {
    if (!data || !arrayPath) return [];
    const arr = resolvePath(data, arrayPath);
    return Array.isArray(arr) ? arr : [];
  };

  const rows = extractRows(apiData, widget.arrayPath);

  const searched = rows.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(searchText.toLowerCase())
  );

  const sorted = [...searched].sort((a, b) => {
    if (sortField === null) return 0;
    const columnName = widget.tableColumns[sortField];
    const A = a[columnName];
    const B = b[columnName];
    if (A === undefined) return 1;
    if (B === undefined) return -1;
    if (typeof A === "number" && typeof B === "number") {
      return sortAsc ? A - B : B - A;
    }
    return sortAsc
      ? String(A).localeCompare(String(B))
      : String(B).localeCompare(String(A));
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-5 shadow-xl text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex gap-2 items-center">
          <h2 className="text-base sm:text-lg font-semibold">{widget.name}</h2>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded">
            {widget.interval}s
          </span>
        </div>
        <div className="flex gap-2 sm:gap-3 text-slate-400">
          <RotateCcw
            className="cursor-pointer hover:text-white transition-colors"
            size={18}
            onClick={fetchData}
          />
          <Trash
            className="cursor-pointer hover:text-red-400 transition-colors"
            size={18}
            onClick={() => onDelete(widget.id)}
          />
        </div>
      </div>

      <div className="relative mb-4">
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 pl-8 text-sm focus:outline-none focus:border-slate-600"
          placeholder="Search table..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Search size={16} className="absolute left-2 top-2.5 text-slate-500" />
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-700 text-slate-400">
              <tr>
                {widget.tableColumns?.map((columnName, idx) => (
                  <th
                    key={idx}
                    className="py-2 px-3 text-left cursor-pointer hover:text-white select-none whitespace-nowrap transition-colors"
                    onClick={() => {
                      if (sortField === idx) setSortAsc(!sortAsc);
                      else {
                        setSortField(idx);
                        setSortAsc(true);
                      }
                    }}
                  >
                    {columnName}
                    {sortField === idx ? (sortAsc ? " ↑" : " ↓") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!apiData ? (
                <tr>
                  <td
                    colSpan={widget.tableColumns?.length || 1}
                    className="py-4 text-center text-slate-500"
                  >
                    <div className="animate-pulse">Loading...</div>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={widget.tableColumns?.length || 1}
                    className="py-4 text-center text-slate-500"
                  >
                    {rows.length === 0
                      ? "No data available"
                      : "No results found"}
                  </td>
                </tr>
              ) : (
                pageRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    {widget.tableColumns?.map((columnName, colIndex) => {
                      const value = row[columnName];
                      return (
                        <td
                          key={colIndex}
                          className="py-2 px-3 whitespace-nowrap"
                        >
                          {value !== undefined && value !== null
                            ? String(value)
                            : "--"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 text-sm text-slate-400">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex gap-1 items-center disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-center">
            Page {page} / {totalPages} • {pageRows.length} of {searched.length}{" "}
            rows
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex gap-1 items-center disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className="text-xs text-slate-500 border-t border-slate-700 pt-2 mt-3">
        Last updated: {lastUpdated} • {rows.length} total rows
      </div>
    </div>
  );
};
