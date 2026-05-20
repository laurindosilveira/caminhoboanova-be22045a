import subprocess
import csv
import io

def get_data():
    cmd = ["psql", "-c", "COPY (SELECT * FROM public.devotional_progress) TO STDOUT WITH CSV HEADER"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return None
    return result.stdout

def format_value(val, data_type):
    if val == "" or val is None or val == "NULL":
        return "NULL"
    if data_type == "boolean":
        return "true" if val.lower() in ["t", "true", "1", "y"] else "false"
    if data_type in ["uuid", "timestamp with time zone", "text"]:
        # Escape single quotes
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    return val

def main():
    csv_data = get_data()
    if not csv_data:
        return

    reader = csv.DictReader(io.StringIO(csv_data))
    records = list(reader)
    
    types = {
        "id": "uuid",
        "user_id": "uuid",
        "devotional_id": "uuid",
        "completed_at": "timestamp with time zone",
        "is_recovery": "boolean",
        "awarded_points": "integer",
        "override_release_id": "uuid",
        "church_id": "uuid"
    }

    output_file = "public_data_part_04A_devotional_progress.sql"
    
    with open(output_file, "w") as f:
        f.write("-- Data for public.devotional_progress\n")
        
        for i in range(0, len(records), 200):
            chunk = records[i:i+200]
            f.write("\nINSERT INTO public.devotional_progress (id, user_id, devotional_id, completed_at, is_recovery, awarded_points, override_release_id, church_id)\nVALUES\n")
            
            values_list = []
            for row in chunk:
                vals = [format_value(row[col], types[col]) for col in ["id", "user_id", "devotional_id", "completed_at", "is_recovery", "awarded_points", "override_release_id", "church_id"]]
                values_list.append(f"({', '.join(vals)})")
            
            f.write(",\n".join(values_list))
            f.write("\nON CONFLICT DO NOTHING;\n")

    print(f"Generated {output_file} with {len(records)} records.")

if __name__ == "__main__":
    main()
