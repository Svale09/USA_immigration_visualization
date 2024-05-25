import sys
sys.path.append('/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/.venv/lib/python3.12/site-packages')

import pandas as pd
import calendar

# Read the datasets
airports_data = pd.read_csv('data/airports_data/airports_final.csv')
flights_data = pd.read_csv('data/flights_data/incoming_flights_final.csv')

# Merge the datasets on the 'Airport Code' and 'usg_apt' columns
merged_data = pd.merge(flights_data, airports_data, left_on='usg_apt', right_on='Airport Code', how='left')

# Optionally, you can drop the redundant 'Airport Code' column
merged_data.drop('Airport Code', axis=1, inplace=True)

month_mapping = {month: index for index, month in enumerate(calendar.month_name) if month}

merged_data['Month_num'] = merged_data['Month'].map(month_mapping)

sorted_md = merged_data.sort_values(by=['usg_apt', 'Year', 'Month_num'])

sorted_md = sorted_md.drop(columns=['Month_num'])

new_order = ['usg_apt', 'Year', 'Month', 'total_passengers', 'flights_count', 'Airport Name', 'City Name', 'coordinates']

sorted_md = sorted_md[new_order]

sorted_md_cleaned = sorted_md.dropna(how='any')

sorted_md_cleaned[['Latitude', 'Longitude']] = sorted_md_cleaned['coordinates'].str.split(',', expand=True)

sorted_md_cleaned['Latitude'] = pd.to_numeric(sorted_md_cleaned['Latitude'])
sorted_md_cleaned['Longitude'] = pd.to_numeric(sorted_md_cleaned['Longitude'])

print(sorted_md_cleaned.head(20))
print(sorted_md_cleaned[(sorted_md['usg_apt']=='ABE') & (sorted_md['Year']<2000)])
sorted_md.info()

# Save the merged dataset to a new CSV file
#sorted_md_cleaned.to_csv('data/flights_data/FINAL_flights.csv', index=False)

sorted_md_cleaned.loc[:, 'Longitude'] = sorted_md_cleaned['Longitude'].astype(str)
sorted_md_cleaned.loc[:, 'Latitude'] = sorted_md_cleaned['Latitude'].astype(str)

sorted_md_cleaned.loc[:, 'Longitude'] = sorted_md_cleaned['Longitude'].str.rstrip('.')
sorted_md_cleaned.loc[:, 'Latitude'] = sorted_md_cleaned['Latitude'].str.rstrip('.')


sorted_md_cleaned.to_json('web/FINAL_flightsJSON.json', orient='records')