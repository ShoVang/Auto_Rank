import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "Get_Data"))

from Vechicles import get_vehicles


def main():
    vehicles_List = get_vehicles()
    print(len(vehicles))
    for car in vehicles_List[:3]:
        print(car)
    print("...")
    print(vehicles_List[-1])


if __name__ == "__main__":
    main()
