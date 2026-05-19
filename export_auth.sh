#!/bin/bash

echo "-- ARQUIVO 02: auth_data.sql"
echo "-- Este arquivo contém a migração completa dos 41 usuários do sistema."
echo ""
echo "BEGIN;"
echo "SET session_replication_role = 'replica';"
echo ""

# Users
psql -t -A -c "SELECT format('INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role, instance_id, is_anonymous) VALUES (%L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L) ON CONFLICT (id) DO NOTHING;', id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role, instance_id, is_anonymous) FROM auth.users" 2>/dev/null

# Identities
echo ""
psql -t -A -c "SELECT format('INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (%L, %L, %L, %L, %L, %L, %L) ON CONFLICT (id) DO NOTHING;', id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) FROM auth.identities" 2>/dev/null

echo ""
echo "SET session_replication_role = 'origin';"
echo "COMMIT;"
