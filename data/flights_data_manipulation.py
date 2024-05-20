import sys
sys.path.append('/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/.venv/lib/python3.12/site-packages')

import pandas as pd
import numpy as np

df = pd.read_csv(
    '/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/data/inbound-flight.csv'
)

df = df.drop(df.columns[[3,5,6,7,8,9,10,11,12,13,14]], axis = 1)

sorted_df = df.sort_values(by='usg_apt')

print(sorted_df.head())