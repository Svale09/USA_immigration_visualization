import sys
sys.path.append('/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/.venv/lib/python3.12/site-packages')

import pandas as pd
import numpy as np

airports_data = pd.read_csv(
    'data/airports_data/airports_dataset.csv',
    delimiter=';')

airports_data.info()

airports_data = airports_data.drop(airports_data.columns[[3,4,5,6,7,8,9]], axis = 1)

airports_data[['Latitude', 'Longitude']] = airports_data['coordinates'].str.split(',', expand=True)

# Remove whitespace and convert to float
airports_data['Latitude'] = airports_data['Latitude'].str.strip().astype(float)
airports_data['Longitude'] = airports_data['Longitude'].str.strip().astype(float)

airports_data.drop(columns=['coordinates'], inplace=True)

airports_data.dropna(inplace=True)


flights_data = pd.read_json('web/FINAL_flightsJSON.json')
unique_airports = flights_data['usg_apt'].unique()

filtered_airports_data = airports_data[airports_data['Airport Code'].isin(unique_airports)]

filtered_airports_data = filtered_airports_data[
    (filtered_airports_data['Latitude'] >= 24) & 
    (filtered_airports_data['Latitude'] <= 49) & 
    (filtered_airports_data['Longitude'] >= -125) & 
    (filtered_airports_data['Longitude'] <= -66)
]

filtered_airports_data.to_json('web/uniqe_airports.json', orient='records')

filtered_airports_data.info()
print(filtered_airports_data.tail(10))


