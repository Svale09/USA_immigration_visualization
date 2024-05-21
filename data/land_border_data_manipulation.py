import sys
import pandas as pd
import numpy as np
import calendar

sys.path.append('/Users/ivansvalina/Documents/Faks/Vizualizacija podataka/KV projekt/project/.venv/lib/python3.12/site-packages')

df = pd.read_csv('data/land-border-data.csv')

df = df.drop(columns=[df.columns[2], df.columns[7], df.columns[8]])

passengersDF = df[df['Measure'].str.contains('passengers|pedestrians', case=False, na=False)].copy()

passengersDF[['Month', 'Year']] = passengersDF['Date'].str.split(expand=True)
passengersDF['Month'] = passengersDF['Month'].apply(lambda x: list(calendar.month_abbr).index(x))

aggregated_data = passengersDF.groupby(['Port Name', 'Year', 'Month']).agg(
    total_crossings=('Value', 'sum'),
    State=('State', 'first'),
    Point=('Point', 'first'),
).reset_index()

aggregated_data['Month'] = aggregated_data['Month'].apply(lambda x: calendar.month_name[x])

aggregated_data['Point'] = aggregated_data['Point'].str.extract(r'\((.*?)\)')

aggregated_data.to_csv('border_crossing_final.csv', index=False)
aggregated_data.to_json('border_crossing_finalJSON.json', orient='records')

print(aggregated_data.info())
print(aggregated_data.head(30))



