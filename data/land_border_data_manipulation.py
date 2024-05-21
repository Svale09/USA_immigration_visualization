import sys
sys.path.append('/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/.venv/lib/python3.12/site-packages')

import pandas as pd
import numpy as np
import calendar

df = pd.read_csv('data/land-border-data.csv')

df = df.drop(df.columns[[2,7,8]], axis=1)

passengersDF = df[df['Measure'].str.contains('passengers|pedestrians', case=False, na=False)]

passengersDF['Year'] = passengersDF['Date'].apply(lambda x: x.split()[1])
passengersDF['Month'] = passengersDF['Date'].apply(lambda x: x.split()[0])

passengersDF['Month'] = passengersDF['Month'].apply(lambda x: list(calendar.month_abbr).index(x))

aggregated_data = passengersDF.groupby(['Port Name', 'Year', 'Month']).agg(
    total_crossings = ('Value', 'sum'),
    State = ('State', 'first'),
    Point = ('Point', 'first'),
).reset_index()

aggregated_data['Month'] = aggregated_data['Month'].apply(lambda x: calendar.month_name[x])

aggregated_data.info()
print(aggregated_data.head(30))
