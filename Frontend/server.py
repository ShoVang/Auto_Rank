"""API and static host for the AutoRank React app."""

import json
import mimetypes
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import duckdb

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "Data" / "vehicles.duckdb"
DIST = Path(__file__).resolve().parent / "dist"
PAGE_SIZE = 25

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

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
        stats["by_fuel"] = [
            {"label": label, "vehicles": int(count)}
            for label, count in con.execute(
                """
                SELECT "fuelType1", COUNT(*)
                FROM vehicles
                WHERE "fuelType1" IS NOT NULL
                GROUP BY 1
                ORDER BY 2 DESC
                """
            ).fetchall()
        ]
        stats["comb_box"] = _box(con, "comb08")
        return stats
    finally:
        con.close()


def _box(con, column):
    row = con.execute(
        f"""
        WITH bounds AS (
            SELECT
                quantile_cont({column}, 0.25) AS q1,
                median({column}) AS med,
                quantile_cont({column}, 0.75) AS q3,
                avg({column}) AS avg_v,
                min({column}) AS min_v,
                max({column}) AS max_v
            FROM vehicles
        )
        SELECT
            min_v,
            (
                SELECT min({column})
                FROM vehicles, bounds
                WHERE {column} >= bounds.q1 - 1.5 * (bounds.q3 - bounds.q1)
            ),
            q1,
            med,
            q3,
            (
                SELECT max({column})
                FROM vehicles, bounds
                WHERE {column} <= bounds.q3 + 1.5 * (bounds.q3 - bounds.q1)
            ),
            max_v,
            avg_v
        FROM bounds
        """
    ).fetchone()
    keys = ["min", "whisker_low", "q1", "median", "q3", "whisker_high", "max", "avg"]
    return {key: float(value) for key, value in zip(keys, row)}


def query_peers(vehicle_id, comb, vehicle_class, fuel, drive, year):
    specs = [
        ("class", "Class", '"VClass"', vehicle_class),
        ("fuel", "Fuel", '"fuelType1"', fuel),
        ("drive", "Drive", "drive", drive),
        ("year", "Model year", "year", int(year) if str(year).strip() else ""),
    ]
    con = duckdb.connect(str(DB_PATH), read_only=True)
    try:
        groups = []
        for key, label, column, value in specs:
            if value == "":
                continue
            others, ahead = con.execute(
                f"""
                SELECT
                    COUNT(*)::INTEGER,
                    COUNT(*) FILTER (WHERE comb08 < ?)::INTEGER
                FROM vehicles
                WHERE {column} = ? AND id <> ?
                """,
                [float(comb), value, int(vehicle_id)],
            ).fetchone()
            groups.append(
                {
                    "key": key,
                    "label": label,
                    "name": str(value),
                    "vehicles": int(others),
                    "more_efficient_than": int(ahead),
                }
            )
        return {"groups": groups}
    finally:
        con.close()


def _where(search, fuels, drives, make, model, vehicle_class, year, min_mpg):
    needle = search.strip()
    where = f"({FILTER})"
    params = [needle, needle, needle, needle]
    if make:
        where += " AND make = ?"
        params.append(make)
    if model:
        where += " AND model = ?"
        params.append(model)
    if vehicle_class:
        where += ' AND "VClass" = ?'
        params.append(vehicle_class)
    if year:
        where += " AND year = ?"
        params.append(int(year))
    if min_mpg:
        where += " AND comb08 >= ?"
        params.append(float(min_mpg))
    if fuels:
        marks = ", ".join("?" for _ in fuels)
        where += f' AND "fuelType1" IN ({marks})'
        params.extend(fuels)
    if drives:
        marks = ", ".join("?" for _ in drives)
        where += f" AND drive IN ({marks})"
        params.extend(drives)
    return where, params


def _column(con, sql, params=()):
    return [row[0] for row in con.execute(sql, params).fetchall()]


def query_filters(make):
    con = duckdb.connect(str(DB_PATH), read_only=True)
    try:
        models = (
            _column(
                con,
                "SELECT model FROM vehicles WHERE make = ? GROUP BY 1 ORDER BY 1",
                [make],
            )
            if make
            else []
        )
        return {
            "makes": _column(con, "SELECT make FROM vehicles GROUP BY 1 ORDER BY 1"),
            "models": models,
            "classes": _column(con, 'SELECT "VClass" FROM vehicles GROUP BY 1 ORDER BY 1'),
            "years": [int(year) for year in _column(con, "SELECT year FROM vehicles GROUP BY 1 ORDER BY 1 DESC")],
            "fuels": _column(
                con,
                """
                SELECT "fuelType1"
                FROM vehicles
                WHERE "fuelType1" IS NOT NULL
                GROUP BY 1
                ORDER BY COUNT(*) DESC
                """,
            ),
            "drives": _column(
                con,
                """
                SELECT drive
                FROM vehicles
                WHERE drive IS NOT NULL
                GROUP BY 1
                ORDER BY COUNT(*) DESC
                """,
            ),
        }
    finally:
        con.close()


def query_vehicles(search, limit, offset, fuels, drives, make, model, vehicle_class, year, min_mpg):
    con = duckdb.connect(str(DB_PATH), read_only=True)
    try:
        where, params = _where(search, fuels, drives, make, model, vehicle_class, year, min_mpg)
        total = con.execute(
            f"SELECT COUNT(*) FROM vehicles WHERE {where}",
            params,
        ).fetchone()[0]
        cursor = con.execute(
            f"""
            SELECT {COLUMNS}
            FROM vehicles
            WHERE {where}
            ORDER BY year DESC, make, model
            LIMIT ? OFFSET ?
            """,
            [*params, limit, offset],
        )
        names = [col[0] for col in cursor.description]
        rows = [dict(zip(names, row)) for row in cursor.fetchall()]
        return {"total": total, "rows": rows}
    finally:
        con.close()


class Handler(BaseHTTPRequestHandler):
    def serve_static(self, url_path):
        dist = DIST.resolve()
        relative = url_path.lstrip("/") or "index.html"
        candidate = (dist / relative).resolve()
        try:
            candidate.relative_to(dist)
        except ValueError:
            self.send_error(404)
            return
        if not candidate.is_file():
            if Path(relative).suffix:
                self.send_error(404)
                return
            candidate = dist / "index.html"
            if not candidate.is_file():
                self.send_error(404, "Frontend build not found")
                return
        body = candidate.read_bytes()
        mime = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

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
        if not parsed.path.startswith("/api"):
            self.serve_static(parsed.path)
            return
        try:
            if parsed.path == "/api/stats":
                self.send_json(query_stats())
                return
            params = parse_qs(parsed.query)

            def field(name):
                values = params.get(name, [])
                return values[0].strip() if values else ""

            if parsed.path == "/api/filters":
                self.send_json(query_filters(field("make")))
                return
            if parsed.path == "/api/peers":
                self.send_json(
                    query_peers(
                        field("id"),
                        field("comb"),
                        field("class"),
                        field("fuel"),
                        field("drive"),
                        field("year"),
                    )
                )
                return
            if parsed.path != "/api/vehicles":
                self.send_error(404)
                return

            search = params.get("q", [""])[0]
            try:
                offset = max(int(params.get("offset", ["0"])[0]), 0)
            except ValueError:
                offset = 0
            self.send_json(
                query_vehicles(
                    search,
                    PAGE_SIZE,
                    offset,
                    params.get("fuel", []),
                    params.get("drive", []),
                    field("make"),
                    field("model"),
                    field("class"),
                    field("year"),
                    field("min_mpg"),
                )
            )
        except Exception as exc:
            self.send_json({"error": str(exc)}, 500)

    def log_message(self, fmt, *args):
        print(f"[api] {self.address_string()} {fmt % args}")


if __name__ == "__main__":
    host = "0.0.0.0"
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"AutoRank ready at http://{host}:{port}")
    server.serve_forever()
