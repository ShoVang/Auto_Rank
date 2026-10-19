import type { LoadStatus, Vehicle } from "../types/vehicle";

type VehicleTableProps = {
  rows: Vehicle[];
  status: LoadStatus;
};

function money(value: number | null) {
  if (value === null || value === undefined) return "—";
  return `$${Number(value).toLocaleString()}`;
}

export function VehicleTable({ rows, status }: VehicleTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Make</th>
            <th>Model</th>
            <th>Class</th>
            <th>Comb</th>
            <th>City</th>
            <th>Hwy</th>
            <th>Fuel cost</th>
            <th>Drive</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((car) => (
            <tr key={car.id}>
              <td>{car.year}</td>
              <td>{car.make}</td>
              <td>{car.model}</td>
              <td>{car.vehicle_class}</td>
              <td>{car.comb08}</td>
              <td>{car.city08}</td>
              <td>{car.highway08}</td>
              <td>{money(car.fuel_cost)}</td>
              <td>{car.drive || "—"}</td>
            </tr>
          ))}
          {status === "ready" && rows.length === 0 ? (
            <tr>
              <td colSpan={9}>No vehicles match that search.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
