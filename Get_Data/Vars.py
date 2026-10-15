from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]

cols = ["id", "year", "make", "model", "baseModel", "VClass",
        "comb08", "city08", "highway08", "fuelCost08", "youSaveSpend",
        "fuelType1", "cylinders", "displ", "tCharger", "sCharger",
        "drive", "trany", "atvType"]

df = pd.read_csv(ROOT / "vehicles.csv", usecols=cols)
df = df.replace({"": pd.NA})
df["make_key"] = df["make"].str.upper().str.strip()
df["model_key"] = df["baseModel"].str.upper().str.strip()