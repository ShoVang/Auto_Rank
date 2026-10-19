import { useEffect, useState } from "react";
import type { DatasetStats } from "../types/stats";

export function useStats() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/stats", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load stats.");
        return response.json();
      })
      .then((data: DatasetStats) => {
        setStats(data);
        setError("");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Stats are unavailable until the DuckDB API is running.");
      });
    return () => controller.abort();
  }, []);

  return { stats, error };
}
