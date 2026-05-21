import json

def format_value(val):
    if val is None:
        return 'NULL'
    if isinstance(val, bool):
        return 'true' if val else 'false'
    if isinstance(val, (int, float)):
        return str(val)
    # Escape single quotes for SQL
    escaped_val = str(val).replace("'", "''")
    return f"'{escaped_val}'"

with open('missing_events.json', 'r') as f:
    events = json.load(f)

# Filter out events that are already in the existing public_data_events.sql
# From previous view, these were:
existing_ids = {
    'fce1f65d-945f-4fdd-a228-ddb99df3401d', '4ed7e20d-9009-458e-9c88-b1ebc6822c8b',
    'e68ee036-28dc-4cae-a1d3-6450877e6b8e', 'f25617a2-07e1-4a05-ac09-c475f10ee6bb',
    '399f22a1-2da4-47cd-bbef-1073404f75b6', '5b93ba53-1e8b-4b36-9213-c06f67826dd1',
    '3188c95d-490c-499d-a5ed-68d3db7c35c3', 'f7ac9ff5-c57b-4cbf-8290-410d6edda46c',
    '3264e720-fc64-41b0-b982-00d8827b8ad0', '8d052a90-4563-45dd-be94-ccce202141d1',
    '8c2fb46e-cb17-4d97-9f53-a9edcdab3a01', '4873fb77-4df2-436a-8c4b-7210f5348a9d'
}

missing_events = [e for e in events if e['id'] not in existing_ids]

if not missing_events:
    print("No missing events found.")
    exit(0)

columns = list(missing_events[0].keys())
col_names = ", ".join(columns)

output = ["BEGIN;\n"]
output.append("-- Eventos faltantes referenciados em attendance\n")
output.append(f"INSERT INTO public.events (\n  {col_names}\n)\nVALUES")

values_list = []
for event in missing_events:
    vals = [format_value(event[col]) for col in columns]
    values_list.append(f"({', '.join(vals)})")

output.append(",\n".join(values_list))
output.append("ON CONFLICT (id) DO NOTHING;\n")
output.append("COMMIT;")

with open('public_data/public_data_missing_events_for_attendance.sql', 'w') as f:
    f.write("\n".join(output))

print(f"Generated public_data/public_data_missing_events_for_attendance.sql with {len(missing_events)} records.")
