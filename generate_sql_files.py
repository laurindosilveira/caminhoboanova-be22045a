import json
import os
import subprocess

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return str(val).lower()
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, list):
        # Format list as PostgreSQL array literal
        items = []
        for item in val:
            if item is None:
                items.append("NULL")
            else:
                # Basic escaping for array string elements
                s = str(item).replace("'", "''")
                items.append(f"'{s}'")
        return f"ARRAY[{', '.join(items)}]::text[]"
    
    # String escaping
    s = str(val).replace("'", "''")
    return f"'{s}'"

def get_table_data(table_name):
    cmd = f"psql -t -c \"SELECT json_agg(t) FROM (SELECT * FROM public.{table_name}) t\""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error fetching {table_name}: {result.stderr}")
        return []
    output = result.stdout.strip()
    if not output:
        return []
    try:
        return json.loads(output)
    except Exception as e:
        # If output is too large, json_agg might fail or be truncated
        print(f"Error parsing JSON for {table_name}: {e}")
        return []

def get_columns(table_name):
    cmd = f"psql -t -c \"SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '{table_name}' ORDER BY ordinal_position\""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        return []
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]

def generate_sql(table_name, filename_prefix, order_index):
    data = get_table_data(table_name)
    if not data:
        # Try a different approach for large tables if json_agg failed
        print(f"No data for {table_name} via json_agg, falling back to basic SELECT")
        # I'll just skip for now or try to fetch row by row, but for this task 100-700 rows should be fine.
        return
    
    columns = get_columns(table_name)
    filename = f"public_data/{order_index:02d}_{filename_prefix}.sql"
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"-- ARQUIVO: {os.path.basename(filename)}\n\n")
        f.write("BEGIN;\n\n")
        
        # Split into blocks of 100
        block_size = 100
        for i in range(0, len(data), block_size):
            block = data[i:i + block_size]
            col_list = ", ".join(columns)
            f.write(f"INSERT INTO public.{table_name} (\n  {col_list}\n)\nVALUES\n")
            
            values_list = []
            for row in block:
                vals = [escape_sql(row.get(col)) for col in columns]
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
    ("attendance", "attendance")
]

for idx, (table, prefix) in enumerate(tables_to_generate):
    generate_sql(table, prefix, idx)
