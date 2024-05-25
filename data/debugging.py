import pandas as pd

df = pd.read_json("web/FINAL_flightsJSON.json")

df.info()

df['Longitude'] = df['Longitude'].astype(str)
df['Latitude'] = df['Latitude'].astype(str)

df['Longitude'] = df['Longitude'].str.rstrip('.')
df['Latitude'] = df['Latitude'].str.rstrip('.')

# Assuming df is your DataFrame and you want to swap the order of Latitude and Longitude columns
df['Latitude'], df['Longitude'] = df['Longitude'], df['Latitude']

df.to_json('web/FINAL_flightsJSON.json', orient='records')

# Print the filtered rows
print(df['Latitude'].unique())