import sys
sys.path.append('/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/.venv/lib/python3.12/site-packages')

import pandas as pd
import numpy as np

df = pd.read_csv(
    '/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/data/airports_',
    delimiter=';')

df.info()

df = df.drop(df.columns[[3,4,5,6,7,8,9]], axis = 1)

df.drop_duplicates(inplace=True)

df.info()

print(df.head(5))


