"use client";

import { useQuery } from "@tanstack/react-query";

export function useTestApiQuery(finalUrl, headers, enabled) {
  return useQuery({
    queryKey: ["testApi", finalUrl, headers],
    queryFn: async () => {
      const res = await fetch(finalUrl, { headers });
      if (!res.ok) throw new Error("API request failed");
      return res.json();
    },
    enabled: enabled && !!finalUrl,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
