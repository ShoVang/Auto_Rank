import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "Get_Data"))

from Vechicles import get_vehicles


def main():
    vehicles = get_vehicles()
    print(len(vehicles))
    for car in vehicles[:3]:
        print(car)
    print("...")
    print(vehicles[-1])


if __name__ == "__main__":
    main()
