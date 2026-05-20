import json

def format_value(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return str(val).lower()
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, list):
        # Format as PG array
        return "'" + str(val).replace("[", "{").replace("]", "}").replace("'", "\"") + "'"
    if isinstance(val, dict):
        return "'" + json.dumps(val).replace("'", "''") + "'"
    
    # Escape single quotes in strings
    return "'" + str(val).replace("'", "''") + "'"

def generate_insert(table, data):
    if not data:
        return f"-- No data for {table}\n\n"
    
    # Sort keys to ensure consistent column order
    columns = sorted(data[0].keys())
    
    sql = f"-- Table: {table}\n"
    for row in data:
        values = [format_value(row.get(col)) for col in columns]
        # Check if table has 'id' column for ON CONFLICT
        if 'id' in columns:
            sql += f"INSERT INTO public.{table} ({', '.join(columns)}) VALUES ({', '.join(values)}) ON CONFLICT (id) DO NOTHING;\n"
        elif 'key' in columns:
            sql += f"INSERT INTO public.{table} ({', '.join(columns)}) VALUES ({', '.join(values)}) ON CONFLICT (key) DO NOTHING;\n"
        else:
            sql += f"INSERT INTO public.{table} ({', '.join(columns)}) VALUES ({', '.join(values)});\n"
    return sql + "\n"

# Helper to load and generate
def process_table(table, filename):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
            return generate_insert(table, data)
    except FileNotFoundError:
        return f"-- File for {table} not found\n\n"

tables_base = ["churches", "areas", "communities", "turmas", "profiles", "user_roles"]
tables_dependent = ["courses", "lessons", "attendance", "events", "achievement_definitions", "achievement_unlocks", "system_settings", "game_config"]

output = "-- Public Data Migration SQL\n"
output += "-- Generated: 2026-05-20\n\n"

for t in tables_base + tables_dependent:
    output += process_table(t, f"data_{t}.json")

with open("public_data_only.sql", "w") as f:
    f.write(output)

print("public_data_only.sql generated successfully")
