import type { LoadStatus } from "../types/vehicle";

type VehicleFiltersProps = {
  search: string;
  total: number;
  status: LoadStatus;
  onSearch: (value: string) => void;
  makes: string[];
  models: string[];
  classes: string[];
  fuels: string[];
  drives: string[];
  years: number[];
  make: string;
  model: string;
  vClass: string;
  year: string;
  minMpg: string;
  selectedFuels: string[];
  selectedDrives: string[];
  onMake: (value: string) => void;
  onModel: (value: string) => void;
  onClass: (value: string) => void;
  onYear: (value: string) => void;
  onMinMpg: (value: string) => void;
  onFuel: (value: string) => void;
  onDrive: (value: string) => void;
  onReset: () => void;
};

function SelectFilter({
  label,
  value,
  options,
  disabled,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  disabled?: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checks({
  name,
  options,
  selected,
  onToggle,
}: {
  name: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="filter-group">
      <legend>{name}</legend>
      <div className="checks">
        {options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function VehicleFilters({
  search,
  total,
  status,
  onSearch,
  makes,
  models,
  classes,
  fuels,
  drives,
  years,
  make,
  model,
  vClass,
  year,
  minMpg,
  selectedFuels,
  selectedDrives,
  onMake,
  onModel,
  onClass,
  onYear,
  onMinMpg,
  onFuel,
  onDrive,
  onReset,
}: VehicleFiltersProps) {
  return (
    <section className="filters">
      <div className="filter-row">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Make, model, or year"
          />
        </label>
        <SelectFilter label="Make" value={make} options={makes} placeholder="All makes" onChange={onMake} />
        <SelectFilter
          label="Model"
          value={model}
          options={models}
          disabled={!make}
          placeholder={make ? "All models" : "Choose a make"}
          onChange={onModel}
        />
        <SelectFilter label="Class" value={vClass} options={classes} placeholder="All classes" onChange={onClass} />
        <SelectFilter
          label="Year"
          value={year}
          options={years.map(String)}
          placeholder="All years"
          onChange={onYear}
        />
        <label>
          Min combined MPG
          <input
            type="number"
            min="0"
            value={minMpg}
            onChange={(event) => onMinMpg(event.target.value)}
            placeholder="Any"
          />
        </label>
        <button type="button" onClick={onReset}>
          Reset
        </button>
        <p className="count">
          {status === "loading" ? "Loading…" : `${total.toLocaleString()} cars`}
        </p>
      </div>
      <div className="filter-checks">
        <Checks name="Fuel type" options={fuels} selected={selectedFuels} onToggle={onFuel} />
        <Checks name="Drive" options={drives} selected={selectedDrives} onToggle={onDrive} />
      </div>
    </section>
  );
}
