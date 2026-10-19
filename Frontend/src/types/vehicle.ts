export type Vehicle = {
  id: number;
  year: number;
  make: string;
  model: string;
  vehicle_class: string;
  comb08: number;
  city08: number;
  highway08: number;
  fuel_cost: number | null;
  drive: string | null;
};

export type VehiclesResponse = {
  total: number;
  rows: Vehicle[];
};

export type LoadStatus = "loading" | "ready" | "error";
