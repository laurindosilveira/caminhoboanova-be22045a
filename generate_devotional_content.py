import subprocess
import csv
import io
import json

def get_data():
    # Using psql to get CSV data
    cmd = ["psql", "-c", "COPY (SELECT * FROM public.devotional_content) TO STDOUT WITH CSV HEADER"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return None
    return result.stdout

def format_value(val, data_type):
    if val == "" or val is None or val == "NULL":
        return "NULL"
    
    if data_type == "ARRAY":
        # Handle PostgreSQL array format from CSV (usually {val1,val2} or {} or NULL)
        if val.startswith('{') and val.endswith('}'):
            # Basic conversion of {} array to array literal for SQL
            # CSV output for arrays can be tricky if they contain commas/quotes
            # For simplicity, we wrap it in single quotes as a literal
            # Example: '{item1,item2}'
            escaped = val.replace("'", "''")
            return f"'{escaped}'"
        return "NULL"
        
    if data_type in ["uuid", "timestamp with time zone", "text"]:
        # Escape single quotes
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    
    if data_type == "integer":
        return val
        
    return val

def main():
    csv_data = get_data()
    if not csv_data:
        return

    reader = csv.DictReader(io.StringIO(csv_data))
    records = list(reader)
    
    # Columns: id, activity_id, bible_text, bible_reference, reflection, prayer, practice, questions, created_at, updated_at, lesson_id, day_number, title, worship_song_id, church_id
    columns = ["id", "activity_id", "bible_text", "bible_reference", "reflection", "prayer", "practice", "questions", "created_at", "updated_at", "lesson_id", "day_number", "title", "worship_song_id", "church_id"]
    
    types = {
        "id": "uuid",
        "activity_id": "uuid",
        "bible_text": "text",
        "bible_reference": "text",
        "reflection": "text",
        "prayer": "text",
        "practice": "text",
        "questions": "ARRAY",
        "created_at": "timestamp with time zone",
        "updated_at": "timestamp with time zone",
        "lesson_id": "uuid",
        "day_number": "integer",
        "title": "text",
        "worship_song_id": "uuid",
        "church_id": "uuid"
    }

    output_file = "public_data_devotional_content.sql"
    
    with open(output_file, "w") as f:
        f.write("-- Data for public.devotional_content\n")
        
        for i in range(0, len(records), 200):
            chunk = records[i:i+200]
            f.write(f"\nINSERT INTO public.devotional_content ({', '.join(columns)})\nVALUES\n")
            
            values_list = []
            for row in chunk:
                vals = [format_value(row[col], types[col]) for col in columns]
                values_list.append(f"({', '.join(vals)})")
            
            f.write(",\n".join(values_list))
            f.write("\nON CONFLICT DO NOTHING;\n")

    print(f"Generated {output_file} with {len(records)} records.")

if __name__ == "__main__":
    main()
