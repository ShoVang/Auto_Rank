"""Each vehicles.csv row, limited to the columns listed in Vars.py."""

from Vars import cols, df


def get_rows():
    return df.loc[:, cols].to_dict(orient="records")


rows = get_rows()

if __name__ == "__main__":
    #print(len(rows))
    print(rows[0])
