import json

def format_value(val):
    if val is None:
        return "NULL"
    if isinstance(val, (bool)):
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
        return ""
    
    # Sort keys to ensure consistent column order
    columns = sorted(data[0].keys())
    
    sql = f"-- Table: {table}\n"
    for row in data:
        values = [format_value(row.get(col)) for col in columns]
        sql += f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({', '.join(values)}) ON CONFLICT (id) DO NOTHING;\n"
    return sql + "\n"

# Load the data from files (I will pass them via stdin or write them to files first)
# For now, I'll just write a placeholder and update it in the next step.
