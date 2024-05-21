import sys
sys.path.append('/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/.venv/lib/python3.12/site-packages')

import pandas as pd

# Read the datasets
airports_data = pd.read_csv('data/airports_final.csv')
flights_data = pd.read_csv('data/incoming_flights_final.csv')

# Merge the datasets on the 'Airport Code' and 'usg_apt' columns
merged_data = pd.merge(flights_data, airports_data, left_on='usg_apt', right_on='Airport Code', how='left')

# Optionally, you can drop the redundant 'Airport Code' column
merged_data.drop('Airport Code', axis=1, inplace=True)

# Save the merged dataset to a new CSV file
merged_data.to_csv('FINAL_flights.csv', index=False)
merged_data.to_json('FINAL_flightsJSON.json', orient='records')

# Display the first few rows of the merged dataset
print(merged_data.head())
merged_data.info()
