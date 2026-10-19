import { Pager } from "../components/Pager";
import { SearchBar } from "../components/SearchBar";
import { VehicleTable } from "../components/VehicleTable";
import { useVehicles } from "../hooks/useVehicles";

export function VehiclesScreen() {
  const vehicles = useVehicles();

  return (
    <main>
      <header>
        <p className="eyebrow">AutoRank</p>
        <h1>Vehicles</h1>
        <p className="lede">Loaded from the DuckDB file at Data/vehicles.duckdb.</p>
      </header>

      <SearchBar
        search={vehicles.search}
        total={vehicles.total}
        status={vehicles.status}
        onSearch={vehicles.setSearch}
      />
      {vehicles.error ? <p className="error">{vehicles.error}</p> : null}
      <VehicleTable rows={vehicles.rows} status={vehicles.status} />
      <Pager
        page={vehicles.page}
        pageCount={vehicles.pageCount}
        total={vehicles.total}
        pageSize={vehicles.pageSize}
        onPage={vehicles.setPage}
      />
    </main>
  );
}
