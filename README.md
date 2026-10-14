# AutoGrade

# Data from

curl -O https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip

**Grading cars on safety, reliability, speed, luxury, and cost, so you can see which gives the most for the money.**

AutoGrade is a data pipeline and scoring engine that pulls free public vehicle data, turns it into a 0-100 grade in five categories, and ranks cars by **value**: quality per dollar. Weights are adjustable, so a family buyer and a performance enthusiast can get different rankings from the same data.

> **Status:** In development. See the [Roadmap](#roadmap) for what is built and what is planned.

---

## The question

> Which vehicles give you the most car for your money?

"Best" depends on what you care about, so AutoGrade does not return a single answer. It returns a ranked list based on the priorities you set.

---

## How it works

### 1. Five category scores (0-100)

Each metric is converted to a percentile rank **within its vehicle class** (compact, midsize, SUV, truck, and so on), so a pickup is not compared to a sports car on speed.

| Category        | Metrics                                                                                      | Data source                                          |
| --------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Safety**      | NHTSA star ratings, crash test results, recall rate, complaint rate                          | NHTSA API                                            |
| **Reliability** | Complaints and recalls per model year, failure categories (engine, transmission, electrical) | NHTSA complaints bulk files                          |
| **Speed**       | Horsepower, torque, power-to-weight ratio, 0-60 where available                              | EPA data, Kaggle spec datasets                       |
| **Luxury**      | Price tier, brand tier, feature count (leather, sunroof, driver assist)                      | Kaggle spec datasets, NHTSA vPIC VIN decoder         |
| **Cost**        | Purchase price, depreciation, annual fuel cost, estimated insurance                          | Craigslist used-car dataset, EPA MPG, gas price data |

### 2. Weighted quality score

```
quality = w_safety * safety
        + w_reliability * reliability
        + w_speed * speed
        + w_luxury * luxury
        + w_cost * cost
```

Default weights:

| Safety | Reliability | Speed | Luxury | Cost |
| ------ | ----------- | ----- | ------ | ---- |
| 0.30   | 0.30        | 0.15  | 0.15   | 0.10 |

### 3. Value score

```
value = quality / price
```

Cars that score well above the quality-vs-price trend line are flagged as **best value** picks.

---

## Architecture

```
  Public sources            Ingest            Storage           Transform         Serve
 ┌──────────────┐      ┌───────────┐      ┌───────────┐     ┌────────────┐   ┌────────────┐
 │ NHTSA API    │      │ Scheduled │      │ Parquet   │     │ dbt / SQL  │   │ Dashboard  │
 │ EPA CSV      │ ───▶ │ jobs      │ ───▶ │ in object │ ──▶ │ scoring    │──▶│ weight     │
 │ Kaggle sets  │      │ (Airflow  │      │ storage   │     │ models     │   │ sliders +  │
 │ vPIC decoder │      │ /Dagster) │      │ (MinIO/S3)│     │            │   │ rankings   │
 └──────────────┘      └───────────┘      └───────────┘     └─────┬──────┘   └────────────┘
                                                                   │
                                                             ┌─────▼──────┐
                                                             │ Warehouse  │
                                                             │ (DuckDB /  │
                                                             │ Postgres)  │
                                                             └────────────┘
```

**Planned stack:** Python, Parquet, MinIO or S3, Airflow or Dagster, dbt, DuckDB or Postgres, Streamlit or Grafana, Docker Compose. The stack will be defined as infrastructure-as-code so the whole project can be brought up with one command.

---

## Data sources

All sources are free and public.

- **NHTSA** (recalls, complaints, safety ratings): https://api.nhtsa.gov
- **NHTSA vPIC** (VIN decoder): https://vpic.nhtsa.dot.gov/api
- **EPA fueleconomy.gov** (specs, MPG): https://www.fueleconomy.gov/feg/ws/
- **Kaggle** (used-car listings, vehicle specs): requires a free account
- **State registration data** (used as a denominator for per-vehicle rates)

Endpoints and file URLs change over time. If a link breaks, check the provider's data page for the current path.

---

## Design decisions and limitations

- **Per-vehicle rates need a denominator.** Raw complaint counts favor rare cars and punish popular ones. AutoGrade normalizes by estimated vehicles on the road using registration or sales data.
- **Scores are per model year.** Reliability can change a lot between generations of the same model.
- **Missing data is not zero.** Missing metrics are flagged and excluded or imputed, and the method is recorded.
- **Luxury is subjective.** It is defined here as a price tier plus a feature count so results are reproducible, but it is an approximation.
- **Complaints are not a perfect reliability measure.** They reflect owner reports, which can skew toward vocal owners or well-publicized issues.
- **Insurance cost is estimated**, not quoted.

---

## Getting started

> Setup instructions will be filled in as the pipeline is built.

```bash
git clone https://github.com/<your-username>/autograde.git
cd autograde

# Bring up storage, orchestration, and the dashboard
docker compose up -d

# Run the first ingestion (NHTSA safety and reliability data)
python -m autograde.ingest.nhtsa --years 2015-2025
```

---

## Roadmap

- [ ] **Milestone 1:** Safety and reliability scores for one vehicle class (midsize sedans), end to end
- [ ] **Milestone 2:** Add speed scoring from EPA and spec data
- [ ] **Milestone 3:** Add cost scoring (price, fuel cost, depreciation)
- [ ] **Milestone 4:** Add luxury scoring
- [ ] **Milestone 5:** Value score and best-value flagging
- [ ] **Milestone 6:** Dashboard with adjustable weights
- [ ] **Milestone 7:** CI/CD, data quality tests, and monitoring
- [ ] **Stretch:** Live telemetry or real-world MPG comparison against EPA ratings

---

## Project structure

```
autograde/
├── ingest/          # Source-specific data pulls
├── transform/       # Scoring models (SQL / dbt)
├── orchestration/   # DAGs and schedules
├── dashboard/       # Weight sliders and rankings
├── infra/           # Docker Compose, IaC
├── tests/           # Data quality and unit tests
└── docs/            # Methodology notes
```

---

## License

MIT, or your preferred license.

## Acknowledgments

Data provided by NHTSA, the U.S. EPA, and the open datasets community.
