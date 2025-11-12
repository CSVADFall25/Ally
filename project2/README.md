# Venmo Network: A Data Portrait

### Overview

This project visualizes my personal Venmo transaction data as an interactive network. Each node represents a person I’ve exchanged money with, and the center node represents me.

Using p5.js, I built a moving network graph where users can filter the data by month and transaction source (my bank vs My venmo balance). The project is based on cleaned CSV files exported from my Venmo account, processed through Python scripts that parse, anonymize, and merge my transaction history.

### Data Acquisition & Cleaning Process

Venmo provides monthly CSV statements that contain detailed transaction logs, including names, timestamps, payment sources, and notes. I downloaded my 2025 statements and stored them in a private /RawData directory which is .gitignored for privacy reasons. The processed data is made public though.

I wrote a Python cleaning script (clean_venmo_data.py) to standardize and anonymize the data. The script:
- Removes mentions of my Venmo handle ( @username).
- Removed last names so you are only left with first names
- Converts funding sources like “Chase Checking” with the last four digits of your bank into a general label of just "Bank"
- Drops the note/memo column for every transcation
- Ensures consistent headers and formatting for easy parsing in p5.js

After cleaning, another script (merge_cleaned_files.py) merges all monthly cleaned files into a single dataset that lives at ProcessedData/AllVenmo2025_cleaned.csv.

This cleaned dataset is the one read by the p5.js sketch.

### Visualization Functionality

The visualization runs entirely in the browser using p5.js. It loads the cleaned CSV, processes each transaction, and builds a dynamic network graph.

- **Nodes**: represent people I’ve transacted with.  
- **Edges**: connect me (the central node) to each person.  
- **Color**: green edges represent people who sent me more than I sent them; red edges mean the opposite.  
- **Movement**: each node floats around randomly; its speed is tied to net balance (how much money flows between us). The slower nodes means I have sent them more money and the faster nodes represent the other user sending me more money.
- **Interaction**: hovering on a node shows the exact incoming and outgoing totals. 
- **Filters**:
  - **Month range**: You can focus on specific time periods (ex January–March).  
  - **Source**: filters transactions based on whether money came from the Bank, Venmo Balance, or both.  
  - **Pause / Resume**: lets users stop the motion to explore labels. Hovering over one node will also stop it from moving but it does not stop all nodes. To stop all nodes, you must click the pause button.

These filters allow users (and me) to interpret spending and receiving patterns across different months or funding sources.

### Approach

My approach to this project started with wanting to take something such as Venmo transactions and turn it into something visually engaging. I didn’t want to make a static bar chart or timeline which is why each person is a floating node with speed. In an earlier assignment (specifically Mini Assignment 5), I experimented with pause and resume buttons to control motion. I used same interaction idea here because it fit with the theme of activity from the data. The pause button lets the viewer freeze the network and focus on specific people or amounts, while the resume button brings the movement back. It somewhat symbolizes the flow of money.

A big part of my process was also deciding what kind of interaction would make the data meaningful without cluttering the screen. Filtering by month range and by transaction source (Bank vs. Venmo Balance) made it easier to reveal small stories inside the larger network. From a visual design standpoint, I kept the color palette minimal. This choice made the visualization more readable and consistent even as the data points moved around.

