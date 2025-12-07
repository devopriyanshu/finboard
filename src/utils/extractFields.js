export function extractGenericFields(json) {
  let fields = [];

  const explore = (obj, prefix = "") => {
    if (Array.isArray(obj)) {
      // Detect table-like structure
      if (obj.length > 0 && typeof obj[0] === "object") {
        fields = fields.concat(Object.keys(obj[0]));
      }
      return;
    }

    if (typeof obj !== "object" || obj === null) return;

    for (let key in obj) {
      const value = obj[key];

      // Ignore meta data blocks
      if (key.toLowerCase().includes("meta")) continue;

      if (typeof value === "object") {
        explore(value, key);
      }
    }
  };

  explore(json);
  return [...new Set(fields)];
}
