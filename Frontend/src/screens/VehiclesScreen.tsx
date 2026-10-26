import { Pager } from "../components/Pager";
import { VehicleFilters } from "../components/VehicleFilters";
import { VehicleTable } from "../components/VehicleTable";
import { useVehicles } from "../hooks/useVehicles";

export function VehiclesScreen() {
  const vehicles = useVehicles();

  return (
    <main>
      <header>
        <p className="eyebrow">AutoRank</p>
        <h1>Vehicles</h1>
        <p className="lede">
          EPA fuel economy ratings from fueleconomy.gov. Search by make, model,
          or year, or check a fuel type and drive to narrow the list.
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
