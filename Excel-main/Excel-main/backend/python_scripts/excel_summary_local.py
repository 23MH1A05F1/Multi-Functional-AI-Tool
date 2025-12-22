import sys
import json
import pandas as pd
import traceback
import os

def generate_basic_summary(dataframe):
    try:
        # Generate a detailed summary with separate lines for rows and columns
        summary_lines = []
        summary_lines.append(f"Number of rows: {len(dataframe)}")
        
        # Add the first line (header row with indexes and column names)
        if len(dataframe.columns) > 0:
            header_line = " ".join([str(i) for i in range(len(dataframe.columns))]) + " " + " ".join(dataframe.columns)
            summary_lines.append(header_line.strip())
        
        summary_lines.append(f"Number of columns: {len(dataframe.columns)}")
        summary_lines.append("Columns:")
        summary_lines.append(", ".join(dataframe.columns))
        summary_lines.append("First 5 rows:")
        
        # Handle empty dataframe
        if len(dataframe) > 0:
            summary_lines.append(dataframe.head(5).to_string(index=False).strip())
        else:
            summary_lines.append("No data rows available")
            
        return "\n".join(summary_lines)
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def main():
    try:
        if len(sys.argv) < 2:
            print("Usage: python excel_summary_local.py <json_data_file>")
            sys.exit(1)

        json_file = sys.argv[1]
        
        # Check if file exists
        if not os.path.exists(json_file):
            print(f"Error: File {json_file} does not exist")
            sys.exit(1)
            
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Handle empty data
        if not data:
            print("No data available")
            sys.exit(0)

        df = pd.DataFrame(data)
        summary = generate_basic_summary(df)
        print(summary)
        
    except FileNotFoundError as e:
        print(f"File not found: {e}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
