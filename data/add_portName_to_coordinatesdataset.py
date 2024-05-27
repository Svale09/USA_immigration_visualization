import pandas as pd

# Load the datasets
border_crossing_df = pd.read_json("web/FINAL_border_crossing_JSON.json")
coordinates_df = pd.read_json("web/coordinates_dataset.json")

# Create a dictionary to map PortCode to PortName from the border_crossing_df
portname_map = border_crossing_df.groupby('PortCode')['Port Name'].first().to_dict()

# Add PortName column to coordinates_df based on PortCode
coordinates_df['PortName'] = coordinates_df['PortCode'].map(portname_map)

# Fill NaN values in case there are PortCodes in coordinates_df not present in border_crossing_df
coordinates_df['PortName'].fillna('', inplace=True)

# Print the updated coordinates_df
print(coordinates_df)


# Print the updated coordinates_df

coordinates_df.to_json("web/coordinates_dataset.json", orient="records")

print(coordinates_df.head(10))
coordinates_df.info()