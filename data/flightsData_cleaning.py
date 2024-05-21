import pandas as pd
from sklearn.preprocessing import MinMaxScaler

df = pd.read_csv('data/flights_data/FINAL_flights.csv')

df.dropna(inplace=True)

df.drop_duplicates(inplace=True)

scaler = MinMaxScaler()
df['total_passengers_normalized'] = scaler.fit_transform(df[['total_passengers']])

df.to_csv('data/flights_data/FINAL_flights.csv', index=False)
df.to_json('data/flights_data/FINAL_flightsJSON.json', orient='records')


print(df.head(10))
df.info()
