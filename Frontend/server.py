"""Local API that reads the AutoRank DuckDB file for the React app."""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import duckdb

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "Data" / "vehicles.duckdb"
PAGE_SIZE = 25

COLUMNS = """
    id, year, make, model,
    "baseModel" AS base_model,
    "VClass" AS vehicle_class,
    comb08, city08, highway08,
    "fuelCost08" AS fuel_cost,
    "youSaveSpend" AS you_save_spend,
    "fuelType1" AS fuel_type,
    cylinders, displ, drive, trany
"""

FILTER = """
    ? = ''
    OR make ILIKE '%' || ? || '%'
    OR model ILIKE '%' || ? || '%'
    OR CAST(year AS VARCHAR) LIKE '%' || ? || '%'
"""


def query_stats():
    con = duckdb.connect(str(DB_PATH), read_only=True)
    try:
        row = con.execute(
            """
            SELECT
                COUNT(*)::INTEGER,
                ROUND(AVG(comb08), 1),
                ROUND(AVG(city08), 1),
                ROUND(AVG(highway08), 1),
                MEDIAN(comb08),
                MIN(year)::INTEGER,
                MAX(year)::INTEGER,
                COUNT(DISTINCT make)::INTEGER,
                ROUND(AVG("fuelCost08"), 0)::INTEGER
            FROM vehicles
            """
        ).fetchone()
        keys = [
            "vehicles",
            "avg_comb",
            "avg_city",
            "avg_highway",
            "median_comb",
            "year_min",
            "year_max",
            "makes",
            "avg_fuel_cost",
        ]
        stats = {key: float(value) for key, value in zip(keys, row)}
        stats["by_year"] = [
            {"year": int(year), "avg_comb": float(avg_comb)}
            for year, avg_comb in con.execute(
                """
                SELECT year, ROUND(AVG(comb08), 1)
                FROM vehicles
                GROUP BY year
                ORDER BY year
                """
            ).fetchall()
        ]
        stats["mpg_buckets"] = [
            {"label": label, "vehicles": int(count)}
            for label, count in con.execute(
                """
                SELECT label, vehicles FROM (
                    SELECT
                        CASE
                            WHEN comb08 < 15 THEN 'Under 15'
                            WHEN comb08 < 20 THEN '15–19'
                            WHEN comb08 < 25 THEN '20–24'
                            WHEN comb08 < 30 THEN '25–29'
                            WHEN comb08 < 40 THEN '30–39'
                            WHEN comb08 < 50 THEN '40–49'
                            ELSE '50+'
                        END AS label,
                        CASE
                            WHEN comb08 < 15 THEN 1
                            WHEN comb08 < 20 THEN 2
                            WHEN comb08 < 25 THEN 3
                            WHEN comb08 < 30 THEN 4
                            WHEN comb08 < 40 THEN 5
                            WHEN comb08 < 50 THEN 6
                            ELSE 7
                        END AS sort_order,
                        COUNT(*) AS vehicles
                    FROM vehicles
                    GROUP BY 1, 2
                )
                ORDER BY sort_order
                """
            ).fetchall()
        ]
        stats["by_class"] = [
            {"label": label, "vehicles": int(count)}
            for label, count in con.execute(
                """
                SELECT "VClass", COUNT(*)
                FROM vehicles
                GROUP BY 1
                ORDER BY 2 DESC
                LIMIT 8
                """
            ).fetchall()
        ]
        return stats
    finally:
        con.close()


def query_vehicles(search, limit, offset):
    con = duckdb.connect(str(DB_PATH), read_only=True)
    try:
        needle = search.strip()
        total = con.execute(
            f"SELECT COUNT(*) FROM vehicles WHERE {FILTER}",
            [needle, needle, needle, needle],
        ).fetchone()[0]
        cursor = con.execute(
            f"""
            SELECT {COLUMNS}
            FROM vehicles
            WHERE {FILTER}
            ORDER BY year DESC, make, model
            LIMIT ? OFFSET ?
            """,
            [needle, needle, needle, needle, limit, offset],
        )
        names = [col[0] for col in cursor.description]
        rows = [dict(zip(names, row)) for row in cursor.fetchall()]
        return {"total": total, "rows": rows}
    finally:
        con.close()


class Handler(BaseHTTPRequestHandler):
    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        try:
            if parsed.path == "/api/stats":
                self.send_json(query_stats())
                return
            if parsed.path != "/api/vehicles":
                self.send_error(404)
                return

            params = parse_qs(parsed.query)
            search = params.get("q", [""])[0]
            try:
                offset = max(int(params.get("offset", ["0"])[0]), 0)
            except ValueError:
                offset = 0
            self.send_json(query_vehicles(search, PAGE_SIZE, offset))
        except Exception as exc:
            self.send_json({"error": str(exc)}, 500)

    def log_message(self, fmt, *args):
        print(f"[api] {self.address_string()} {fmt % args}")


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)
    print("DuckDB API ready at http://127.0.0.1:8000/api/vehicles")
    server.serve_forever()
