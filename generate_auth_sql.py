import json
import re

def escape_val(val):
    if val is None or val == '<nil>':
        return 'NULL'
    if isinstance(val, bool):
        return 'TRUE' if val else 'FALSE'
    if isinstance(val, (int, float)):
        return str(val)
    # Check if it looks like a JSON map from the tool output
    if isinstance(val, str) and (val.startswith('map[') or val.startswith('[')):
        # Very rough conversion of Go-like map string to JSON
        # Example: map[provider:email providers:[email]]
        # For our purposes, since it's already a dict in Python if we parse it right, but here it might be a string.
        # However, the tool returns Python objects if they were JSON.
        pass
    
    # Escape single quotes
    return "'" + str(val).replace("'", "''") + "'"

def json_dump_sql(val):
    if val is None or val == '<nil>':
        return 'NULL'
    return "'" + json.dumps(val).replace("'", "''") + "'"

def process_data(users_data, identities_data):
    sql = ["-- Migration script for auth.users and auth.identities\n"]
    
    # Users
    sql.append("-- INSERTING USERS")
    for u in users_data:
        # Handling the map/nil values from tool output
        app_meta = json_dump_sql(u.get('raw_app_meta_data'))
        user_meta = json_dump_sql(u.get('raw_user_meta_data'))
        
        sql.append(f"INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role, instance_id, is_anonymous) VALUES ({escape_val(u.get('id'))}, {escape_val(u.get('email'))}, {escape_val(u.get('encrypted_password'))}, {escape_val(u.get('email_confirmed_at'))}, {escape_val(u.get('created_at'))}, {escape_val(u.get('updated_at'))}, {app_meta}, {user_meta}, {escape_val(u.get('aud'))}, {escape_val(u.get('role'))}, {escape_val(u.get('instance_id'))}, {escape_val(u.get('is_anonymous'))}) ON CONFLICT (id) DO NOTHING;")

    # Identities
    sql.append("\n-- INSERTING IDENTITIES")
    for i in identities_data:
        id_data = json_dump_sql(i.get('identity_data'))
        sql.append(f"INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES ({escape_val(i.get('id'))}, {escape_val(i.get('user_id'))}, {id_data}, {escape_val(i.get('provider'))}, {escape_val(i.get('last_sign_in_at'))}, {escape_val(i.get('created_at'))}, {escape_val(i.get('updated_at'))}) ON CONFLICT (id) DO NOTHING;")
        
    return "\n".join(sql)

# Note: The actual data injection will happen in a different step since I can't pipe large data easily.
# I will use a different approach: generate the SQL line by line using a bash script that handles the psql output.
