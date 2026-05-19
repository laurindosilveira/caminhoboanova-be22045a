import json
import os

# This script would normally fetch from DB, but I'll use the data I just got if I can
# Since I need to be sure I have all 41, I'll fetch them via psql directly in this script
# and output the table and the SQL file.

def get_data(query):
    import subprocess
    result = subprocess.run(['psql', '-Atc', query], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return []
    return result.stdout.strip().split('\n')

# Fetch users
users_query = """
SELECT json_build_object(
    'id', id, 
    'email', email, 
    'created_at', created_at, 
    'email_confirmed_at', email_confirmed_at,
    'encrypted_password', encrypted_password,
    'role', role,
    'aud', aud,
    'instance_id', instance_id,
    'is_anonymous', is_anonymous,
    'raw_app_meta_data', raw_app_meta_data,
    'raw_user_meta_data', raw_user_meta_data,
    'is_super_admin', is_super_admin,
    'updated_at', updated_at,
    'phone', phone,
    'phone_confirmed_at', phone_confirmed_at,
    'confirmation_token', confirmation_token,
    'recovery_token', recovery_token,
    'email_change_token_new', email_change_token_new,
    'email_change', email_change,
    'last_sign_in_at', last_sign_in_at,
    'phone_change', phone_change,
    'phone_change_token', phone_change_token,
    'email_change_token_current', email_change_token_current,
    'email_change_confirm_status', email_change_confirm_status,
    'banned_until', banned_until,
    'reauthentication_token', reauthentication_token,
    'reauthentication_sent_at', reauthentication_sent_at,
    'is_sso_user', is_sso_user,
    'deleted_at', deleted_at
) FROM auth.users ORDER BY created_at ASC;
"""
users_json = get_data(users_query)
users = [json.loads(u) for u in users_json if u]

# Fetch identities
identities_query = """
SELECT json_build_object(
    'id', id,
    'user_id', user_id,
    'identity_data', identity_data,
    'provider', provider,
    'last_sign_in_at', last_sign_in_at,
    'created_at', created_at,
    'updated_at', updated_at,
    'email', email
) FROM auth.identities;
"""
identities_json = get_data(identities_query)
identities = [json.loads(i) for i in identities_json if i]

# Print Table
print("| # | ID | Email | Created At | Email Confirmed At | Password? | Identity? |")
print("|---|---|---|---|---|---|---|")
for i, u in enumerate(users, 1):
    has_password = "sim" if u.get('encrypted_password') else "não"
    has_identity = "sim" if any(idnt['user_id'] == u['id'] for idnt in identities) else "não"
    print(f"| {i} | {u['id']} | {u['email']} | {u['created_at']} | {u['email_confirmed_at']} | {has_password} | {has_identity} |")

# Generate SQL
with open('auth_data.sql', 'w') as f:
    f.write("-- Backup COMPLETO de usuários (Total: 41)\n")
    f.write("SET session_replication_role = 'replica';\n\n")
    
    # Users
    f.write("INSERT INTO auth.users (\n")
    f.write("  id, email, encrypted_password, email_confirmed_at, created_at, updated_at, \n")
    f.write("  role, aud, instance_id, is_anonymous, raw_app_meta_data, raw_user_meta_data, \n")
    f.write("  is_super_admin, phone, phone_confirmed_at, confirmation_token, recovery_token, \n")
    f.write("  email_change_token_new, email_change, last_sign_in_at, phone_change, \n")
    f.write("  phone_change_token, email_change_token_current, email_change_confirm_status, \n")
    f.write("  banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at\n")
    f.write(") VALUES\n")
    
    for i, u in enumerate(users):
        def sql_val(val):
            if val is None: return "NULL"
            if isinstance(val, bool): return str(val).upper()
            if isinstance(val, (dict, list)): return f"'{json.dumps(val)}'"
            return f"'{str(val).replace(\"'\", \"''\")}'"

        f.write(f"  ({sql_val(u['id'])}, {sql_val(u['email'])}, {sql_val(u['encrypted_password'])}, {sql_val(u['email_confirmed_at'])}, {sql_val(u['created_at'])}, {sql_val(u['updated_at'])}, ")
        f.write(f"{sql_val(u['role'])}, {sql_val(u['aud'])}, {sql_val(u['instance_id'])}, {sql_val(u['is_anonymous'])}, {sql_val(u['raw_app_meta_data'])}, {sql_val(u['raw_user_meta_data'])}, ")
        f.write(f"{sql_val(u['is_super_admin'])}, {sql_val(u['phone'])}, {sql_val(u['phone_confirmed_at'])}, {sql_val(u['confirmation_token'])}, {sql_val(u['recovery_token'])}, ")
        f.write(f"{sql_val(u['email_change_token_new'])}, {sql_val(u['email_change'])}, {sql_val(u['last_sign_in_at'])}, {sql_val(u['phone_change'])}, ")
        f.write(f"{sql_val(u['phone_change_token'])}, {sql_val(u['email_change_token_current'])}, {sql_val(u['email_change_confirm_status'])}, ")
        f.write(f"{sql_val(u['banned_until'])}, {sql_val(u['reauthentication_token'])}, {sql_val(u['reauthentication_sent_at'])}, {sql_val(u['is_sso_user'])}, {sql_val(u['deleted_at'])})")
        
        if i < len(users) - 1:
            f.write(",\n")
        else:
            f.write("\n")
    f.write("ON CONFLICT (id) DO NOTHING;\n\n")
    
    # Identities
    if identities:
        f.write("INSERT INTO auth.identities (\n")
        f.write("  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, email\n")
        f.write(") VALUES\n")
        for i, idnt in enumerate(identities):
            def sql_val(val):
                if val is None: return "NULL"
                if isinstance(val, bool): return str(val).upper()
                if isinstance(val, (dict, list)): return f"'{json.dumps(val)}'"
                return f"'{str(val).replace(\"'\", \"''\")}'"
            
            f.write(f"  ({sql_val(idnt['id'])}, {sql_val(idnt['user_id'])}, {sql_val(idnt['identity_data'])}, {sql_val(idnt['provider'])}, {sql_val(idnt['last_sign_in_at'])}, {sql_val(idnt['created_at'])}, {sql_val(idnt['updated_at'])}, {sql_val(idnt['email'])})")
            
            if i < len(identities) - 1:
                f.write(",\n")
            else:
                f.write("\n")
        f.write("ON CONFLICT (id) DO NOTHING;\n\n")

    f.write("SET session_replication_role = 'origin';\n\n")
    f.write("SELECT count(*) as total_users FROM auth.users;\n")
    f.write("SELECT count(*) as total_identities FROM auth.identities;\n")

