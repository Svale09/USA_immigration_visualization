import pandas as pd

df = pd.read_json('data/border_crossing_data/FINAL_border_crossing.json')

coordinates_df = df.groupby('PortCode').agg({'Point': 'first', 'State':'first'}).reset_index()

#coordinates_df[['Longitude', 'Latitude']] = coordinates_df['Point'].str.split(',', expand=True)

coordinates_df['Longitude'] = coordinates_df['Longitude'].astype(float)
coordinates_df['Latitude'] = coordinates_df['Latitude'].astype(float)

#coordinates_df.drop(columns=['Point'], inplace=True)

coordinates_df = coordinates_df[['PortCode', 'Latitude', 'Longitude',]]

coordinates_df.info()
print(coordinates_df.head(20))

#df = df.drop(columns=['Point'])

df.info()
print(df.head(20))


df.to_json("data/border_crossing_data/FINAL_border_crossing.json", orient='records')
coordinates_df.to_json("web/coordinates_dataset.json", orient='records')
