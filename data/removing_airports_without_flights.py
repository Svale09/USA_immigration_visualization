import pandas as pd

df = pd.read_json('web/FINAL_flightsJSON.json')

uniqueBefore = df['usg_apt'].unique()
print("Before cleaning:", len(uniqueBefore))

years = df['Year'].unique()
total_years = len(years)

# Identify airports that have data for at least 80% of the years
def airport_has_sufficient_years(airport_df):
    unique_years_count = airport_df['Year'].nunique()
    return unique_years_count >= 0.8 * total_years

# Group by airport code and filter
filtered_airports = df.groupby('usg_apt').filter(airport_has_sufficient_years)

uniqueAirports = filtered_airports['usg_apt'].unique()
print("Number of unique airports after filtering:", len(uniqueAirports))
#print(filtered_airports.head(20))
#filtered_airports.info()

#filtered_airports.to_json("web/filtered_fligths.json", orient="records")

airports = pd.read_json('web/uniqe_airports.json')
airports.info()

# Filter the airports dataset based on the airport codes present in the filtered dataset
cleaned_airports_df = airports[airports['Airport Code'].isin(uniqueAirports)]

cleaned_airports_df.info()
print(cleaned_airports_df.tail(10))

# Save or use the cleaned airports dataset as needed
cleaned_airports_df.to_json('cleaned_airports.json', orient='records')
