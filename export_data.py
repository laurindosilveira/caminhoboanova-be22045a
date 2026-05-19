import json
import subprocess
import sys

def fetch_table(schema, table):
    # Fetching row by row to avoid memory issues and handle JSON correctly
    cmd = ["psql", "-t", "-c", f"SELECT row_to_json(t) FROM (SELECT * FROM {schema}.{table}) t;"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error fetching {schema}.{table}: {result.stderr}", file=sys.stderr)
        return []
    lines = result.stdout.strip().split('\n')
    data = []
    for line in lines:
        if line.strip():
            data.append(json.loads(line))
    return data

def generate_inserts(schema, table, data):
    if not data: return f"-- No data for {schema}.{table}\n"
    columns = list(data[0].keys())
    sql = f"-- Data for {schema}.{table}\n"
    for row in data:
        vals = []
        for col in columns:
            val = row[col]
            if val is None:
                vals.append("NULL")
            elif isinstance(val, (dict, list)):
                json_str = json.dumps(val).replace("'", "''")
                vals.append(f"'{json_str}'")
            else:
                str_val = str(val).replace("'", "''")
                vals.append(f"'{str_val}'")
        sql += f"INSERT INTO {schema}.{table} ({', '.join(columns)}) VALUES ({', '.join(vals)});\n"
    return sql

def export_schema_data(schema, tables, filename):
    with open(f"/mnt/documents/{filename}", "w") as f:
        f.write("BEGIN;\n")
        f.write("SET session_replication_role = 'replica';\n")
        for table in tables:
            data = fetch_table(schema, table)
            f.write(generate_inserts(schema, table, data))
        f.write("SET session_replication_role = 'origin';\n")
        f.write("COMMIT;\n")

# Export Auth
export_schema_data("auth", ["users", "identities"], "auth_data.sql")
# Export Storage Metadata
export_schema_data("storage", ["buckets", "objects"], "storage_metadata.sql")

