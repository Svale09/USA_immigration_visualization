import pandas as pd

# Load the datasets
border_crossing_df = pd.read_json("web/FINAL_border_crossing_JSON.json")
coordinates_df = pd.read_json("web/coordinates_dataset.json")

# Create dictionaries to map PortCode to PortName and State from the border_crossing_df
portname_map = border_crossing_df.groupby('PortCode')['Port Name'].first().to_dict()
state_map = border_crossing_df.groupby('PortCode')['State'].first().to_dict()

# Add PortName and State columns to coordinates_df based on PortCode
coordinates_df['PortName'] = coordinates_df['PortCode'].map(portname_map)
coordinates_df['State'] = coordinates_df['PortCode'].map(state_map)

# Fill NaN values in case there are PortCodes in coordinates_df not present in border_crossing_df
coordinates_df['PortName'].fillna('', inplace=True)
coordinates_df['State'].fillna('', inplace=True)

# Print the updated coordinates_df
print(coordinates_df)

# Save the updated coordinates_df to a JSON file
coordinates_df.to_json("web/coordinates_dataset.json", orient="records")

print(coordinates_df)
coordinates_df.info()
