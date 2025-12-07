import _ from "lodash";

/**
 * Safely extracts a value from a nested object using a string path.
 * e.g., getNestedValue(response, "data.rates.BTC")
 */
export const getNestedValue = (obj, path) => {
  return _.get(obj, path, "N/A");
};

/**
 * Recursively finds all paths in a JSON object that contain Arrays.
 * Used to help the user select data for Tables and Charts.
 */
export const findArrayPaths = (obj, prefix = "") => {
  let paths = [];
  if (!obj || typeof obj !== "object") return [];

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      paths.push(fullPath);
    } else if (value && typeof value === "object") {
      paths = [...paths, ...findArrayPaths(value, fullPath)];
    }
  });
  return paths;
};

/**
 * Extract keys from the first object in an array to use as Columns.
 */
export const getArrayHeaders = (json, arrayPath) => {
  const arrayData = _.get(json, arrayPath);
  if (!Array.isArray(arrayData) || arrayData.length === 0) return [];

  const firstItem = arrayData[0];
  if (typeof firstItem !== "object") return ["Value"]; // Handle simple arrays [1,2,3]

  // Return all keys (potential columns)
  return Object.keys(firstItem);
};
/* ----------------------------------------------------------
   HELPER: Get nested value safely (e.g., obj['data']['users'])
-----------------------------------------------------------*/
// const getNestedValue = (obj, path) => {
//   if (!path || !obj) return undefined;
//   // Convert "data.users[0]" -> "data.users.0" for easier splitting
//   const cleanPath = path.replace(/\[(\w+)\]/g, ".$1").replace(/^\./, "");
//   return cleanPath.split(".").reduce((acc, part) => acc && acc[part], obj);
// };

/* ----------------------------------------------------------
   1. FIND ARRAY PATHS
   Scans JSON to find where lists of data exist.
-----------------------------------------------------------*/
export const extractArrayPaths = (obj, prefix = "") => {
  let paths = [];
  if (!obj || typeof obj !== "object") return [];

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      paths.push(fullPath);
    } else if (value && typeof value === "object") {
      paths = [...paths, ...extractArrayPaths(value, fullPath)];
    }
  });
  return paths;
};

/* ----------------------------------------------------------
   2. EXTRACT COLUMNS FROM PATH
   Looks at the first item in the array to find available columns.
-----------------------------------------------------------*/
export const extractColumnsFromPath = (json, path) => {
  const arrayData = getNestedValue(json, path);
  if (!Array.isArray(arrayData) || arrayData.length === 0) return [];

  // Look at the first item to get keys
  const firstItem = arrayData[0];
  if (typeof firstItem !== "object") return ["value"]; // Handle array of primitives

  return Object.keys(firstItem);
};

/* ----------------------------------------------------------
   3. THE TABLE MAKER (Core Function)
   Takes API response + Saved Config -> Returns Table Rows
-----------------------------------------------------------*/
export const buildTableData = (apiResponse, arrayPath, selectedColumns) => {
  const rawData = getNestedValue(apiResponse, arrayPath);

  if (!Array.isArray(rawData)) return [];

  return rawData.map((row) => {
    // If it's a simple array [1, 2, 3], return as object
    if (typeof row !== "object") return { value: row };

    // Otherwise filter by selected columns
    const cleanRow = {};
    selectedColumns.forEach((col) => {
      // Handle nested objects in cells by stringifying them
      const cellVal = row[col];
      cleanRow[col] =
        typeof cellVal === "object" ? JSON.stringify(cellVal) : cellVal;
    });
    return cleanRow;
  });
};
