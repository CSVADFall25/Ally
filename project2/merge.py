import os
import pandas as pd

PROCESSED_DIR = "/Users/allychu/mat236/Ally/project2/ProcessedData"
OUTPUT_FILE = "/Users/allychu/mat236/Ally/project2/ProcessedData/AllVenmo2025_cleaned.csv"

files = sorted([
    f for f in os.listdir(PROCESSED_DIR)
    if f.startswith("VenmoStatement_") and f.endswith("_cleaned.csv")
])

dfs = []
for f in files:
    path = os.path.join(PROCESSED_DIR, f)
    try:
        df = pd.read_csv(path)
        dfs.append(df)
        print(f"Loaded {f} ({len(df)} rows)")
    except Exception as e:
        print(f"Error reading {f}: {e}")

merged = pd.concat(dfs, ignore_index=True)

if "Datetime" in merged.columns:
    merged = merged.sort_values(by="Datetime")

merged.to_csv(OUTPUT_FILE, index=False)
print(f"Merged {len(files)} files into {OUTPUT_FILE} ({len(merged)} total rows)")
