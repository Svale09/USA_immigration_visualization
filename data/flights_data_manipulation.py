import sys
sys.path.append('/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/.venv/lib/python3.12/site-packages')

import pandas as pd
import numpy as np
import calendar

df = pd.read_csv(
    'data/flights_data/inbound-flight.csv'
)

df.info()

df = df.drop(df.columns[[3,5,6,7,8,9,10,11,12,13,14]], axis = 1)

num_unique_values = df['usg_apt'].nunique()
print("Number of unique values in the 'usg_apt' column:", num_unique_values)

aggregated_data = df.groupby(['Year', 'Month', 'usg_apt']).agg(
    flights_count = ('data_dte', 'size'),
    total_passengers = ('Total', 'sum')
).reset_index()

aggregated_data['Month'] = aggregated_data['Month'].apply(lambda x: calendar.month_name[x])

#aggregated_data.to_csv('incoming_flights_final.csv', index=False)
#aggregated_data.to_json('incoming_flights_finalJSON.json', orient='records')



print(aggregated_data.head(20))
print(aggregated_data.sort_values(by='usg_apt').head(20))
aggregated_data.info()
