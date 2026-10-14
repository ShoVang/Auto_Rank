"""Each vehicles.csv row, limited to the columns listed in Vars.py."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from Vars import cols, df


def get_rows():
    return df.loc[:, cols].to_dict(orient="records")


rows = get_rows()

if __name__ == "__main__":
    #print(len(rows))
    print(rows[0])
