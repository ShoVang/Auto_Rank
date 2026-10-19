export type YearPoint = {
  year: number;
  avg_comb: number;
};

export type CountBar = {
  label: string;
  vehicles: number;
};

export type DatasetStats = {
  vehicles: number;
  avg_comb: number;
  avg_city: number;
  avg_highway: number;
  median_comb: number;
  year_min: number;
  year_max: number;
  makes: number;
  avg_fuel_cost: number;
  by_year: YearPoint[];
  mpg_buckets: CountBar[];
  by_class: CountBar[];
};
