import json
import subprocess

def fetch_table(table):
    cmd = ["psql", "-t", "-c", f"SELECT json_agg(t) FROM (SELECT * FROM auth.{table}) t;"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error fetching {table}: {result.stderr}")
        return []
    try:
        return json.loads(result.stdout.strip())
    except:
        return []

def generate_inserts(table, data):
    if not data: return ""
    columns = data[0].keys()
    sql = f"-- Data for auth.{table}\n"
    for row in data:
        vals = []
        for col in columns:
            val = row[col]
            if val is None:
                vals.append("NULL")
            elif isinstance(val, (dict, list)):
                vals.append(f"'{json.dumps(val).replace(\"'\", \"''\")}'")
            else:
                vals.append(f"'{str(val).replace(\"'\", \"''\")}'")
        sql += f"INSERT INTO auth.{table} ({', '.join(columns)}) VALUES ({', '.join(vals)});\n"
    return sql

with open("/mnt/documents/auth_data.sql", "w") as f:
    f.write("BEGIN;\n")
    f.write("SET session_replication_role = 'replica';\n") # Disable triggers
    users = fetch_table("users")
    f.write(generate_inserts("users", users))
    identities = fetch_table("identities")
    f.write(generate_inserts("identities", identities))
    f.write("SET session_replication_role = 'origin';\n")
    f.write("COMMIT;\n")

