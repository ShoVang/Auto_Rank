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
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/vehicles":
            self.send_error(404)
            return

        params = parse_qs(parsed.query)
        search = params.get("q", [""])[0]
        try:
            offset = max(int(params.get("offset", ["0"])[0]), 0)
        except ValueError:
            offset = 0

        try:
            payload = query_vehicles(search, PAGE_SIZE, offset)
        except Exception as exc:
            body = json.dumps({"error": str(exc)}).encode()
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        body = json.dumps(payload).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print(f"[api] {self.address_string()} {fmt % args}")


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)
    print("DuckDB API ready at http://127.0.0.1:8000/api/vehicles")
    server.serve_forever()
