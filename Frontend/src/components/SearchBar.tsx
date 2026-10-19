import type { LoadStatus } from "../types/vehicle";

type SearchBarProps = {
  search: string;
  total: number;
  status: LoadStatus;
  onSearch: (value: string) => void;
};

export function SearchBar({ search, total, status, onSearch }: SearchBarProps) {
  return (
    <section className="toolbar">
      <label>
        Search
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Make, model, or year"
        />
      </label>
      <p className="count">
        {status === "loading" ? "Loading…" : `${total.toLocaleString()} cars`}
      </p>
    </section>
  );
}
