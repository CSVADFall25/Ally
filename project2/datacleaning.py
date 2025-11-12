import os
import pandas as pd
import re
from io import StringIO

"""
Disclaimer:
This script originally contained a line that explicitly removed my personal Venmo username
from the raw data before cleaning. That line still exists in this code. It is line 68 but 
my username has been removed here for privacy reasons before publishing to GitHub. There
is now just a placeholder for my username.
"""

RAW_DIR = "/Users/allychu/mat236/Ally/project2/RawData"
PROCESSED_DIR = "/Users/allychu/mat236/Ally/project2/ProcessedData"

os.makedirs(PROCESSED_DIR, exist_ok=True)


def clean_person_name(value):
    if pd.isna(value):
        return value

    value = re.sub(r"@\S+", "", str(value)).strip()

    if not value:
        return value

    first = value.split()[0]
    return first.capitalize()


def clean_bank_field(value):
    if pd.isna(value):
        return value

    s = str(value)
    lower = s.lower()

    if "bank" in lower or "wells fargo" in lower:
        return "Bank"

    return s


def clean_venmo_file(filepath, output_path):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if "In case of errors or questions about your" in line:
            lines = lines[:i]
            break

    header_idx = None
    for i, line in enumerate(lines):
        if ",ID,Datetime,Type,Status" in line:
            header_idx = i
            break

    if header_idx is None:
        print(f"Could not find header in {filepath}")
        return

    data_lines = lines[header_idx:]

    # Remove your username mention
    # text = "".join(data_lines).replace("@placer for my username", "")

    try:
        df = pd.read_csv(StringIO(text))
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        return

    if "From" in df.columns:
        df["From"] = df["From"].apply(clean_person_name)
    if "To" in df.columns:
        df["To"] = df["To"].apply(clean_person_name)

    for col in df.columns:
        col_lower = col.lower()
        if col_lower.startswith("funding") or col_lower.startswith("destination"):
            df[col] = df[col].apply(clean_bank_field)

    if "Note" in df.columns:
        df = df.drop(columns=["Note"])

    df = df.dropna(how="all")

    df.to_csv(output_path, index=False)
    print(f"Cleaned: {os.path.basename(filepath)} -> {output_path}")


for filename in os.listdir(RAW_DIR):
    if filename.endswith(".csv"):
        raw_path = os.path.join(RAW_DIR, filename)
        cleaned_path = os.path.join(
            PROCESSED_DIR, filename.replace(".csv", "_cleaned.csv")
        )
        clean_venmo_file(raw_path, cleaned_path)
