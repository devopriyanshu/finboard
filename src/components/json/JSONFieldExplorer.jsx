"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Square, CheckSquare } from "lucide-react";

/* =====================================================
    Helper: Detect type
===================================================== */
const getType = (val) => {
  if (Array.isArray(val)) return "array";
  if (val === null) return "null";
  return typeof val;
};

/* =====================================================
    Recursive Tree Component
===================================================== */
function TreeNode({ label, value, path, onSelect, selected }) {
  const [open, setOpen] = useState(false);

  const type = getType(value);
  const isObject = type === "object";
  const isArray = type === "array";

  const toggle = () => setOpen(!open);

  // Highlight selected node
  const isSelected = selected === path;

  return (
    <div className="ml-3 text-sm">
      {/* ROW */}
      <div
        className={`flex items-center gap-1 py-1 px-1 rounded cursor-pointer ${
          isSelected ? "bg-blue-700/40" : "hover:bg-slate-700/40"
        }`}
      >
        {/* Expand Icon */}
        {isObject || isArray ? (
          open ? (
            <ChevronDown
              size={14}
              className="cursor-pointer"
              onClick={toggle}
            />
          ) : (
            <ChevronRight
              size={14}
              className="cursor-pointer"
              onClick={toggle}
            />
          )
        ) : (
          <div className="w-[14px]" /> // spacer
        )}

        {/* Select Toggle */}
        <button className="text-blue-400" onClick={() => onSelect(path, value)}>
          {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
        </button>

        {/* Key Label */}
        <span className="text-white">{label}</span>

        {/* Value Preview */}
        {!isObject && !isArray && (
          <span className="text-slate-400 ml-2">
            ({String(value).slice(0, 20)})
          </span>
        )}

        {/* Type */}
        <span className="ml-auto text-slate-500 text-xs">[{type}]</span>
      </div>

      {/* Children */}
      {open && (isObject || isArray) && (
        <div className="ml-4">
          {isObject &&
            Object.keys(value).map((key) => {
              const childPath = path ? `${path}.${key}` : key;
              return (
                <TreeNode
                  key={childPath}
                  label={key}
                  value={value[key]}
                  path={childPath}
                  selected={selected}
                  onSelect={onSelect}
                />
              );
            })}

          {isArray &&
            value.map((item, index) => {
              const childPath = `${path}[${index}]`;
              return (
                <TreeNode
                  key={childPath}
                  label={`[${index}]`}
                  value={item}
                  path={childPath}
                  selected={selected}
                  onSelect={onSelect}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}

/* =====================================================
     JSON EXPLORER MAIN COMPONENT
===================================================== */
export default function JSONFieldExplorer({
  json,
  selectedField,
  onSelectField,
}) {
  if (!json) return <p className="text-slate-500 text-sm">No data loaded</p>;

  return (
    <div className="flex gap-4">
      {/* JSON Tree Panel */}
      <div className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg p-3 overflow-y-auto max-h-80">
        <h2 className="text-white text-sm mb-2">JSON Explorer</h2>

        <TreeNode
          label="root"
          value={json}
          path=""
          selected={selectedField}
          onSelect={(path, value) => onSelectField(path, value)}
        />
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg p-3">
        <h2 className="text-white text-sm mb-2">Field Preview</h2>

        {selectedField ? (
          <>
            <p className="text-slate-300 text-xs">
              <strong>Path:</strong>{" "}
              <span className="font-mono">{selectedField}</span>
            </p>

            <p className="text-slate-300 text-xs mt-2">
              <strong>Type:</strong>{" "}
              {getType(
                selectedField.split(".").reduce((acc, key) => acc?.[key], json)
              )}
            </p>

            <div className="bg-slate-900 mt-3 p-2 rounded text-xs text-slate-300 font-mono max-h-40 overflow-y-auto">
              <pre>
                {JSON.stringify(resolvePreview(json, selectedField), null, 2)}
              </pre>
            </div>
          </>
        ) : (
          <p className="text-slate-500 text-xs">Select a field to preview</p>
        )}
      </div>
    </div>
  );
}

/* =====================================================
    Resolve preview value
===================================================== */
function resolvePreview(obj, path) {
  if (!path) return null;

  try {
    return path.split(".").reduce((acc, part) => {
      const arrayMatch = part.match(/(.+?)\[(\d+)\]/);
      if (arrayMatch) {
        const [, key, index] = arrayMatch;
        return acc[key][Number(index)];
      }
      return acc[part];
    }, obj);
  } catch {
    return null;
  }
}
