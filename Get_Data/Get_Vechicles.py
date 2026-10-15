"""Turn each vehicle row into an object with its column values stored."""

from Get_Row import get_rows


class Vehicle:
    def __init__(self, row):
        for key, value in row.items():
            setattr(self, key, value)

    def __repr__(self):
        return f"Vehicle({self.year} {self.make} {self.model})"


def get_vehicles():
    return [Vehicle(row) for row in get_rows()]


if __name__ == "__main__":
    vehicles = get_vehicles()
    car = vehicles[0]
    print(len(vehicles))
    print(car)
    print(car.__dict__)
