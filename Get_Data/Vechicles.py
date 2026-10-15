import duckdb
import pandas as pd

from helpers import ROOT, cols, get_rows

DB_PATH = ROOT / "Data" / "vehicles.duckdb"
SCHEMA_PATH = ROOT / "Data" / "Vehicle_Table.sql"


class Vehicle:
    def __init__(self, row):
        for key, value in row.items():
            setattr(self, key, value)

    def __repr__(self):
        return f"Vehicle({self.year} {self.make} {self.model})"


def get_vehicles():
    return [Vehicle(row) for row in get_rows()]


def _value(value):
    if pd.isna(value):
        return None
    return value


def get_vechiles_to_table():
    vehicles = [Vehicle(row) for row in get_rows()]
    columns = ", ".join(f'"{col}"' for col in cols)
    placeholders = ", ".join("?" for _ in cols)
    rows = [[_value(getattr(car, col)) for col in cols] for car in vehicles]

    con = duckdb.connect(DB_PATH)
    con.execute("DROP TABLE IF EXISTS vehicles")
    con.execute(SCHEMA_PATH.read_text())
    con.executemany(
        f"INSERT INTO vehicles ({columns}) VALUES ({placeholders})",
        rows,
    )
    con.close()
    return vehicles
