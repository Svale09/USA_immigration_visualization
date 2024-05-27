import sys
import pandas as pd
import numpy as np
import calendar
from sklearn.preprocessing import MinMaxScaler

sys.path.append('/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/.venv/lib/python3.12/site-packages')

df = pd.read_csv('data/border_crossing_data/land-border-data.csv')

df.drop_duplicates(inplace=True)

df = df.drop(columns=[df.columns[7], df.columns[8]])

df['Point'] = df['Point'].str.split()
# Add a comma between each value
df['Point'] = df['Point'].apply(lambda x: ','.join(x))

passengersDF = df[df['Measure'].str.contains('passengers|pedestrians', case=False, na=False)].copy()

passengersDF[['Month', 'Year']] = passengersDF['Date'].str.split(expand=True)
passengersDF['Month'] = passengersDF['Month'].apply(lambda x: list(calendar.month_abbr).index(x))

aggregated_data = passengersDF.groupby(['Port Name', 'Year', 'Month']).agg(
    total_crossings=('Value', 'sum'),
    State=('State', 'first'),
    Point=('Point', 'first'),
    PortCode=('Port Code', 'first'),
).reset_index()

aggregated_data['Month'] = aggregated_data['Month'].apply(lambda x: calendar.month_name[x])

aggregated_data['Point'] = aggregated_data['Point'].str.extract(r'\((.*?)\)')

scaler = MinMaxScaler()
aggregated_data['total_crossings_normalized'] = scaler.fit_transform(aggregated_data[['total_crossings']])

aggregated_data.to_csv('web/FINAL_border_crossing_JSON.json', index=False)
#aggregated_data.to_json('data/border_crossing_data/FINAL_border_crossing_JSON.json', orient='records')

print(aggregated_data.info())
print(aggregated_data.head(30))





