import { Pager } from "../components/Pager";
import { VehicleFilters } from "../components/VehicleFilters";
import { VehicleTable } from "../components/VehicleTable";
import { useVehicles } from "../hooks/useVehicles";
import type { Vehicle } from "../types/vehicle";

type VehiclesScreenProps = {
  selected: Vehicle | null;
  onSelect: (car: Vehicle) => void;
  onCompare: (car: Vehicle) => void;
};

export function VehiclesScreen({ selected, onSelect, onCompare }: VehiclesScreenProps) {
  const vehicles = useVehicles();

  return (
    <main>
      <header>
        <p className="eyebrow">AutoRank</p>
        <h1>Vehicles</h1>
        <p className="lede">
          EPA fuel economy ratings from fueleconomy.gov. Search by make, model,
          or year, then select a vehicle and compare it with the catalog.
        </p>
      </header>

      <VehicleFilters
        search={vehicles.search}
        total={vehicles.total}
        status={vehicles.status}
        onSearch={vehicles.setSearch}
        makes={vehicles.options.makes}
        models={vehicles.options.models}
        classes={vehicles.options.classes}
        fuels={vehicles.options.fuels}
        drives={vehicles.options.drives}
        years={vehicles.options.years}
        make={vehicles.make}
        model={vehicles.model}
        vClass={vehicles.vClass}
        year={vehicles.year}
        minMpg={vehicles.minMpg}
        selectedFuels={vehicles.fuels}
        selectedDrives={vehicles.drives}
        onMake={vehicles.setMake}
        onModel={vehicles.setModel}
        onClass={vehicles.setVClass}
        onYear={vehicles.setYear}
        onMinMpg={vehicles.setMinMpg}
        onFuel={vehicles.toggleFuel}
        onDrive={vehicles.toggleDrive}
        onReset={vehicles.reset}
      />
      {vehicles.error ? <p className="error">{vehicles.error}</p> : null}
      <div className="compare-bar">
        <p>
          {selected
            ? `${selected.year} ${selected.make} ${selected.model} selected`
            : "Select a vehicle in the table."}
        </p>
        <button
          type="button"
          className="primary"
          disabled={!selected}
          onClick={() => selected && onCompare(selected)}
        >
          Compare
        </button>
      </div>
      <VehicleTable
        rows={vehicles.rows}
        status={vehicles.status}
        selectedId={selected?.id ?? null}
        onSelect={onSelect}
      />
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
