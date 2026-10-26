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
  fuel_type: string | null;
  drive: string | null;
};

export type FilterOptions = {
  makes: string[];
  models: string[];
  classes: string[];
  years: number[];
  fuels: string[];
  drives: string[];
};

export type VehiclesResponse = {
  total: number;
  rows: Vehicle[];
};

export type LoadStatus = "loading" | "ready" | "error";
