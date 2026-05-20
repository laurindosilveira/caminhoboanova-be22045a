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
        # Correctly handle list items
        formatted_items = []
        for item in val:
            if isinstance(item, str):
                formatted_items.append(f'"{item}"')
            else:
                formatted_items.append(str(item))
        return "'{" + ",".join(formatted_items) + "}'"
    if isinstance(val, dict):
        return "'" + json.dumps(val).replace("'", "''") + "'"
    
    # Escape single quotes in strings
    return "'" + str(val).replace("'", "''") + "'"

def generate_insert(table, data):
    if not data:
        return f"-- No data for {table}\n\n"
    
    # Sort keys to ensure consistent column order
    columns = sorted(data[0].keys())
    
    sql = f"-- Table: public.{table}\n"
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

# Table data provided in the script instead of separate files for reliability
data_churches = [
    {"id":"02f08580-80e5-4f57-8a2e-1b078d337278","name":"Igreja Boa Nova","slug":"boa-nova","primary_color":"#1F3C88","secondary_color":"#E8880A","is_active":True,"created_at":"2026-05-12 23:08:27.331994+00","updated_at":"2026-05-12 23:08:27.331994+00","logo_url":None,"address":None,"city":None,"state":None}
]

data_areas = [
    {"id":"aeee264c-2e30-42b7-85f9-0bd539c3156b","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","name":"Área 1","description":"Área criada para organização geográfica da igreja","created_at":"2026-04-09 14:10:59.171663+00","created_by":None},
    {"id":"beec4c09-21b6-40c1-84b3-3d42420c11d6","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","name":"Área 2","description":"Área criada para organização geográfica da igreja","created_at":"2026-04-09 14:10:59.171663+00","created_by":None}
]

data_communities = [
    {"id":"7737b8b9-69d2-4883-a4a9-00710361dfca","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","area_id":"aeee264c-2e30-42b7-85f9-0bd539c3156b","name":"Rincão Frente","created_at":"2026-04-09 14:10:59.171663+00","created_by":None},
    {"id":"9d4ed9e6-21f7-4a56-8080-e0584a89b69f","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","area_id":"aeee264c-2e30-42b7-85f9-0bd539c3156b","name":"Rincão Fundo","created_at":"2026-04-09 14:10:59.171663+00","created_by":None},
    {"id":"c250a178-a85b-4aad-9c02-0ce56256fb7e","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","area_id":"aeee264c-2e30-42b7-85f9-0bd539c3156b","name":"Bom Pastor","created_at":"2026-04-09 14:10:59.171663+00","created_by":None},
    {"id":"560c47af-68f4-4b56-a20c-e847798326e0","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","area_id":"aeee264c-2e30-42b7-85f9-0bd539c3156b","name":"Iriá Pira 1","created_at":"2026-04-09 14:10:59.171663+00","created_by":None},
    {"id":"abcaeb36-720e-43c7-bb4e-3343d8d4789b","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","area_id":"beec4c09-21b6-40c1-84b3-3d42420c11d6","name":"Martim Lutero","created_at":"2026-04-09 14:10:59.171663+00","created_by":None},
    {"id":"27efec49-f9d5-45ca-b260-154fc5cd5ca8","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","area_id":"beec4c09-21b6-40c1-84b3-3d42420c11d6","name":"Linha Brasil","created_at":"2026-04-09 14:10:59.171663+00","created_by":None},
    {"id":"6d2b90c8-a512-404e-b567-902347ba681b","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","area_id":"beec4c09-21b6-40c1-84b3-3d42420c11d6","name":"Iriá Pira 2","created_at":"2026-04-09 14:10:59.171663+00","created_by":None}
]

data_turmas = [
    {"id":"af9ec153-d2f8-49ce-acd4-16adafa37b66","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","area":"Área 2","name":"Confirmatório 2026 - Área 2","year":2025,"description":"Turma de Ensino Confirmatório Área 2","is_active":True,"created_at":"2026-02-25 13:31:56.922388+00","created_by":None},
    {"id":"f29b8625-c980-4c74-9c41-cd28189d1c09","church_id":"02f08580-80e5-4f57-8a2e-1b078d337278","area":"Área 1","name":"Confirmatório 2026 - Área 1","year":2025,"description":"Turma de Ensino Confirmatório Área 1","is_active":True,"created_at":"2026-02-25 13:31:56.922388+00","created_by":None}
]

# I'll stop here and use standard tool calls to write the rest of the file 
# because it's too much data to handle in a single script.
# Actually, I can just write the file directly with the tool since the user wants a COMPLETED file.
# But I need the data first. 
