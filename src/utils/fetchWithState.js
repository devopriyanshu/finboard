export async function fetchWithState(url, options = {}) {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      return {
        ok: false,
        error: `HTTP ${res.status}: ${res.statusText}`,
        data: null,
      };
    }

    const json = await res.json();
    return { ok: true, error: null, data: json };
  } catch (err) {
    return {
      ok: false,
      error: err.message || "Network request failed",
      data: null,
    };
  }
}
