import json
import os

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float, bool)):
        return str(val).lower()
    if isinstance(val, list):
        # Format list as PostgreSQL array literal
        items = []
        for item in val:
            if item is None:
                items.append("NULL")
            else:
                items.append(f'"{str(item).replace('"', '\\"')}"')
        return f"ARRAY[{', '.join(items)}]::text[]"
    
    # String escaping
    s = str(val).replace("'", "''")
    return f"'{s}'"

def generate_sql(table_name, data, columns, filename):
    with open(f"public_data/{filename}", "w", encoding="utf-8") as f:
        f.write(f"-- ARQUIVO: {filename}\n\n")
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

# Tables and their data fetched (from tool results)
# I'll need to reconstruct the data structure from the tool results string if needed, 
# but I can just use the data I saw.

# Churches
churches_data = [{"address": None, "city": None, "created_at": "2026-05-12 23:08:27.331994+00", "id": "02f08580-80e5-4f57-8a2e-1b078d337278", "is_active": True, "logo_url": None, "name": "Igreja Boa Nova", "primary_color": "#1F3C88", "secondary_color": "#E8880A", "slug": "boa-nova", "state": None, "updated_at": "2026-05-12 23:08:27.331994+00"}]
generate_sql("churches", churches_data, ["id", "name", "slug", "address", "city", "state", "logo_url", "primary_color", "secondary_color", "is_active", "created_at", "updated_at"], "public_data_00_churches.sql")

# Areas
areas_data = [
    {"church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-04-09 14:10:59.171663+00", "created_by": None, "description": "Área criada para organização geográfica da igreja", "id": "aeee264c-2e30-42b7-85f9-0bd539c3156b", "name": "Área 1"},
    {"church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-04-09 14:10:59.171663+00", "created_by": None, "description": "Área criada para organização geográfica da igreja", "id": "beec4c09-21b6-40c1-84b3-3d42420c11d6", "name": "Área 2"}
]
generate_sql("areas", areas_data, ["id", "name", "description", "created_at", "created_by", "church_id"], "public_data_01_areas.sql")

# Communities
communities_data = [
    {"area_id": "aeee264c-2e30-42b7-85f9-0bd539c3156b", "church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-04-09 14:10:59.171663+00", "created_by": None, "id": "7737b8b9-69d2-4883-a4a9-00710361dfca", "name": "Rincão Frente"},
    {"area_id": "aeee264c-2e30-42b7-85f9-0bd539c3156b", "church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-04-09 14:10:59.171663+00", "created_by": None, "id": "9d4ed9e6-21f7-4a56-8080-e0584a89b69f", "name": "Rincão Fundo"},
    {"area_id": "aeee264c-2e30-42b7-85f9-0bd539c3156b", "church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-04-09 14:10:59.171663+00", "created_by": None, "id": "c250a178-a85b-4aad-9c02-0ce56256fb7e", "name": "Bom Pastor"},
    {"area_id": "aeee264c-2e30-42b7-85f9-0bd539c3156b", "church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-04-09 14:10:59.171663+00", "created_by": None, "id": "560c47af-68f4-4b56-a20c-e847798326e0", "name": "Iriá Pira 1"},
    {"area_id": "beec4c09-21b6-40c1-84b3-3d42420c11d6", "church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-04-09 14:10:59.171663+00", "created_by": None, "id": "abcaeb36-720e-43c7-bb4e-3343d8d4789b", "name": "Martim Lutero"},
    {"area_id": "beec4c09-21b6-40c1-84b3-3d42420c11d6", "church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-04-09 14:10:59.171663+00", "created_by": None, "id": "27efec49-f9d5-45ca-b260-154fc5cd5ca8", "name": "Linha Brasil"},
    {"area_id": "beec4c09-21b6-40c1-84b3-3d42420c11d6", "church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-04-09 14:10:59.171663+00", "created_by": None, "id": "6d2b90c8-a512-404e-b567-902347ba681b", "name": "Iriá Pira 2"}
]
generate_sql("communities", communities_data, ["id", "name", "area_id", "created_at", "created_by", "church_id"], "public_data_02_communities.sql")

# Turmas
turmas_data = [
    {"area": "Área 2", "church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-02-25 13:31:56.922388+00", "created_by": None, "description": "Turma de Ensino Confirmatório Área 2", "id": "af9ec153-d2f8-49ce-acd4-16adafa37b66", "is_active": True, "name": "Confirmatório 2026 - Área 2", "year": "2025"},
    {"area": "Área 1", "church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-02-25 13:31:56.922388+00", "created_by": None, "description": "Turma de Ensino Confirmatório Área 1", "id": "f29b8625-c980-4c74-9c41-cd28189d1c09", "is_active": True, "name": "Confirmatório 2026 - Área 1", "year": "2025"}
]
generate_sql("turmas", turmas_data, ["id", "name", "description", "year", "area", "is_active", "created_at", "created_by", "church_id"], "public_data_03_turmas.sql")

# Courses
courses_data = [
    {"church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-02-19 01:38:39.192964+00", "id": "7334230a-3021-43fb-83fc-e11b624cf10c", "order_num": 1, "subtitle": "Compreender o Evangelho, firmar identidade em Cristo e entender pertencimento à Igreja", "title": "Raízes: Começando a Vida Cristã"},
    {"church_id": "02f08580-80e5-4f57-8a2e-1b078d337278", "created_at": "2026-02-19 01:38:39.192964+00", "id": "66ee05a0-c250-4dc6-9c4e-f08bd09e56cc", "order_num": 2, "subtitle": "Maturidade espiritual, identidade sólida e cosmovisão cristã para viver no mundo contemporâneo", "title": "Firme na Fé: Crescendo na Vida Cristã"}
]
generate_sql("courses", courses_data, ["id", "title", "subtitle", "order_num", "created_at", "church_id"], "public_data_04_courses.sql")

# Lessons, Devotional Content, etc. will be fetched from database directly by the script to handle many rows.
