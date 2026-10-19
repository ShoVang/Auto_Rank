import { useEffect, useState } from "react";
import type { LoadStatus, Vehicle } from "../types/vehicle";

const PAGE_SIZE = 25;

export function useVehicles() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setQuery(search.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      q: query,
      offset: String(page * PAGE_SIZE),
    });

    setStatus("loading");
    fetch(`/api/vehicles?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not read the DuckDB table.");
        return response.json();
      })
      .then((data) => {
        setRows(data.rows);
        setTotal(data.total);
        setError("");
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setRows([]);
        setTotal(0);
        setError("The DuckDB API is not running. Start it with npm run server.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [query, page]);

  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return {
    search,
    setSearch,
    page,
    setPage,
    rows,
    total,
    status,
    error,
    pageCount,
    pageSize: PAGE_SIZE,
  };
}
