import pandas as pd

df = pd.read_json('web/FINAL_border_crossing_JSON.json')
print(len(df))

filtered_df = df[df['total_crossings'] != 0]
print(len(filtered_df))

filtered_df.to_json('web/FINAL_border_crossing_JSON.json', orient='records')