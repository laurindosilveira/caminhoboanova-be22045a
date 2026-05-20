import csv
import os
import subprocess
import io

def escape_sql(val):
    if val == "" or val is None or val == 'NULL_VAL':
        return "NULL"
    
    # Simple type heuristics
    if val.lower() == 'true': return 'true'
    if val.lower() == 'false': return 'false'
    
    # Check if it looks like a number (but exclude things like '2026-05-12')
    if '-' not in val and ':' not in val:
        try:
            float(val)
            return val
        except ValueError:
            pass

    # Handle arrays (Postgres format in CSV is often {val1,val2})
    if val.startswith('{') and val.endswith('}'):
        items = val[1:-1].split(',')
        escaped_items = []
        for item in items:
            item = item.strip().strip('"')
            escaped_item = item.replace("'", "''")
            escaped_items.append(f"'{escaped_item}'")
        return f"ARRAY[{', '.join(escaped_items)}]::text[]"

    # String escaping
    s = val.replace("'", "''")
    return f"'{s}'"

def generate_sql(table_name, filename_prefix, order_index):
    cmd = f"psql -c \"COPY (SELECT * FROM public.{table_name}) TO STDOUT WITH (FORMAT CSV, HEADER, NULL 'NULL_VAL')\""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error fetching {table_name}: {result.stderr}")
        return
    
    csv_data = result.stdout
    f_in = io.StringIO(csv_data)
    reader = csv.DictReader(f_in)
    columns = reader.fieldnames
    
    data = list(reader)
    if not data:
        print(f"No data for {table_name}")
        return

    filename = f"public_data/public_data_{filename_prefix}.sql"
    # Overriding filename to match user's requested format "public_data_profiles.sql"
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"-- ARQUIVO: {os.path.basename(filename)}\n\n")
        f.write("BEGIN;\n\n")
        
        block_size = 100
        for i in range(0, len(data), block_size):
            block = data[i:i + block_size]
            col_list = ", ".join(columns)
            f.write(f"INSERT INTO public.{table_name} (\n  {col_list}\n)\nVALUES\n")
            
            values_list = []
            for row in block:
                vals = []
                for col in columns:
                    val = row[col]
                    vals.append(escape_sql(val))
                values_list.append(f"(\n  {', '.join(vals)}\n)")
            
            f.write(",\n".join(values_list))
            f.write("\nON CONFLICT DO NOTHING;\n\n")
            
        f.write("COMMIT;\n")
    print(f"Generated {filename}")

os.makedirs("public_data", exist_ok=True)

tables_to_generate = [
    ("churches", "churches"),
    ("areas", "areas"),
    ("communities", "communities"),
    ("turmas", "turmas"),
    ("profiles", "profiles"),
    ("courses", "courses"),
    ("lessons", "lessons"),
    ("devotional_content", "devotional_content"),
    ("devotional_progress", "devotional_progress"),
    ("user_progress", "lesson_progress"),
    ("attendance", "attendance"),
    ("lesson_responses", "lesson_responses"),
    ("devotional_responses", "devotional_responses")
]


for idx, (table, prefix) in enumerate(tables_to_generate):
    generate_sql(table, prefix, idx)
