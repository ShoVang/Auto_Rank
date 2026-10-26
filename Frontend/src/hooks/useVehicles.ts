import { useEffect, useState } from "react";
import type { FilterOptions, LoadStatus, Vehicle } from "../types/vehicle";

const PAGE_SIZE = 25;

const emptyOptions: FilterOptions = {
  makes: [],
  models: [],
  classes: [],
  years: [],
  fuels: [],
  drives: [],
};

export function useVehicles() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [make, setMakeState] = useState("");
  const [model, setModel] = useState("");
  const [vClass, setVClass] = useState("");
  const [year, setYear] = useState("");
  const [minMpg, setMinMpg] = useState("");
  const [fuels, setFuels] = useState<string[]>([]);
  const [drives, setDrives] = useState<string[]>([]);
  const [options, setOptions] = useState<FilterOptions>(emptyOptions);
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
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    fetch(`/api/filters?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load filters.");
        return response.json();
      })
      .then((data: FilterOptions) => setOptions(data))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
      });
    return () => controller.abort();
  }, [make]);

  function choose(value: string, setValue: (next: string) => void) {
    setPage(0);
    setValue(value);
  }

  function setMake(value: string) {
    setPage(0);
    setMakeState(value);
    setModel("");
  }

  function toggle(value: string, setSelected: (update: (current: string[]) => string[]) => void) {
    setPage(0);
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function reset() {
    setSearch("");
    setQuery("");
    setMakeState("");
    setModel("");
    setVClass("");
    setYear("");
    setMinMpg("");
    setFuels([]);
    setDrives([]);
    setPage(0);
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const params = new URLSearchParams({
      q: query,
      offset: String(page * PAGE_SIZE),
    });
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (vClass) params.set("class", vClass);
    if (year) params.set("year", year);
    if (minMpg) params.set("min_mpg", minMpg);
    fuels.forEach((fuel) => params.append("fuel", fuel));
    drives.forEach((drive) => params.append("drive", drive));

    setStatus("loading");
    fetch(`/api/vehicles?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not read the DuckDB table.");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setRows(data.rows);
        setTotal(data.total);
        setError("");
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (!active || (err instanceof DOMException && err.name === "AbortError")) return;
        setRows([]);
        setTotal(0);
        setError("The DuckDB API is not running. Start it with npm run server.");
        setStatus("error");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [query, page, fuels, drives, make, model, vClass, year, minMpg]);

  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return {
    search,
    setSearch,
    options,
    make,
    model,
    vClass,
    year,
    minMpg,
    setMake,
    setModel: (value: string) => choose(value, setModel),
    setVClass: (value: string) => choose(value, setVClass),
    setYear: (value: string) => choose(value, setYear),
    setMinMpg: (value: string) => choose(value, setMinMpg),
    fuels,
    drives,
    toggleFuel: (value: string) => toggle(value, setFuels),
    toggleDrive: (value: string) => toggle(value, setDrives),
    reset,
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
