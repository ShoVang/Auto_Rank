"""Create Data/vehicles.duckdb from vehicles.csv."""

import duckdb
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "Data" / "vehicles.duckdb"
SCHEMA_PATH = ROOT / "Data" / "Vehicle_Table.sql"
CSV_PATH = ROOT / "vehicles.csv"


def main():
    DB_PATH.parent.mkdir(exist_ok=True)
    con = duckdb.connect(str(DB_PATH))
    try:
        con.execute("DROP TABLE IF EXISTS vehicles")
        con.execute(SCHEMA_PATH.read_text())
        con.execute(
            """
            INSERT INTO vehicles
            SELECT
                CAST(id AS INTEGER),
                CAST(year AS INTEGER),
                make,
                model,
                baseModel,
                VClass,
                CAST(comb08 AS INTEGER),
                CAST(city08 AS INTEGER),
                CAST(highway08 AS INTEGER),
                CAST(fuelCost08 AS INTEGER),
                CAST(youSaveSpend AS INTEGER),
                NULLIF(fuelType1, ''),
                CAST(TRY_CAST(cylinders AS DOUBLE) AS INTEGER),
                TRY_CAST(displ AS DOUBLE),
                NULLIF(tCharger, ''),
                NULLIF(sCharger, ''),
                NULLIF(drive, ''),
                NULLIF(trany, ''),
                NULLIF(atvType, '')
            FROM read_csv(?, header = true, all_varchar = true)
            """,
            [str(CSV_PATH)],
        )
        count = con.execute("SELECT COUNT(*) FROM vehicles").fetchone()[0]
    finally:
        con.close()
    print(f"Built {DB_PATH} with {count} vehicles")


if __name__ == "__main__":
    main()
