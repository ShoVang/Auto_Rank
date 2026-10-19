import numbers
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "Get_Data"))

from helpers import cols, df


def column_values(name):
    if name not in df.columns:
        raise KeyError(f"Unknown column: {name}")
    values = []
    for value in df[name].tolist():
        if value is None or pd.isna(value):
            continue
        values.append(value)
    return values


def _numbers(values):
    return [
        value
        for value in values
        if isinstance(value, numbers.Number) and not isinstance(value, bool)
    ]


def mean(values):
    numbers_only = _numbers(values)
    if not numbers_only:
        return None
    return sum(numbers_only) / len(numbers_only)


def median(sorted_values):
    count = len(sorted_values)
    middle = count // 2
    if count % 2 == 1:
        return sorted_values[middle]
    return (sorted_values[middle - 1] + sorted_values[middle]) / 2


def five_number_summary(values):
    numbers_only = sorted(_numbers(values))
    count = len(numbers_only)
    if count == 0:
        return None
    middle = count // 2
    if count % 2 == 1:
        lower = numbers_only[:middle]
        upper = numbers_only[middle + 1:]
    else:
        lower = numbers_only[:middle]
        upper = numbers_only[middle:]
    return {
        "min": numbers_only[0],
        "q1": median(lower),
        "median": median(numbers_only),
        "q3": median(upper),
        "max": numbers_only[-1],
    }


def sort_column(name, descending=False):
    return sorted(column_values(name), reverse=descending)


def describe(name):
    values = column_values(name)
    return {
        "column": name,
        "count": len(values),
        "mean": mean(values),
        "summary": five_number_summary(values),
        "sorted": sort_column(name),
    }


def show(name):
    result = describe(name)
    print(name)
    print("count", result["count"])
    print("mean", result["mean"])
    summary = result["summary"]
    if summary is None:
        print("five-number summary is only for number columns")
    else:
        print("min", summary["min"])
        print("q1", summary["q1"])
        print("median", summary["median"])
        print("q3", summary["q3"])
        print("max", summary["max"])
    ordered = result["sorted"]
    print("lowest", ordered[:5])
    print("highest", ordered[-5:])


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: .venv/bin/python Math/Formulas.py <column>")
        print("Columns:", ", ".join(cols))
    else:
        show(sys.argv[1])
