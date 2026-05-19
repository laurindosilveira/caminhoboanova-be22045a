CREATE TABLE IF NOT EXISTS public.temp_auth_export (
  id serial PRIMARY KEY,
  line text
);

TRUNCATE public.temp_auth_export;

INSERT INTO public.temp_auth_export (line)
SELECT 'INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, confirmed_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES (' 
  || quote_nullable(id) || ', ' 
  || quote_nullable(instance_id) || ', ' 
  || quote_nullable(aud) || ', ' 
  || quote_nullable(role) || ', ' 
  || quote_nullable(email) || ', ' 
  || quote_nullable(encrypted_password) || ', ' 
  || quote_nullable(email_confirmed_at) || ', ' 
  || quote_nullable(invited_at) || ', ' 
  || quote_nullable(confirmation_token) || ', ' 
  || quote_nullable(confirmation_sent_at) || ', ' 
  || quote_nullable(recovery_token) || ', ' 
  || quote_nullable(recovery_sent_at) || ', ' 
  || quote_nullable(email_change_token_new) || ', ' 
  || quote_nullable(email_change) || ', ' 
  || quote_nullable(email_change_sent_at) || ', ' 
  || quote_nullable(last_sign_in_at) || ', ' 
  || quote_nullable(raw_app_meta_data::text) || '::jsonb, ' 
  || quote_nullable(raw_user_meta_data::text) || '::jsonb, ' 
  || quote_nullable(is_super_admin) || ', ' 
  || quote_nullable(created_at) || ', ' 
  || quote_nullable(updated_at) || ', ' 
  || quote_nullable(phone) || ', ' 
  || quote_nullable(phone_confirmed_at) || ', ' 
  || quote_nullable(phone_change) || ', ' 
  || quote_nullable(phone_change_token) || ', ' 
  || quote_nullable(phone_change_sent_at) || ', ' 
  || quote_nullable(confirmed_at) || ', ' 
  || quote_nullable(email_change_token_current) || ', ' 
  || quote_nullable(email_change_confirm_status) || ', ' 
  || quote_nullable(banned_until) || ', ' 
  || quote_nullable(reauthentication_token) || ', ' 
  || quote_nullable(reauthentication_sent_at) || ', ' 
  || quote_nullable(is_sso_user) || ', ' 
  || quote_nullable(deleted_at) || ', ' 
  || quote_nullable(is_anonymous) 
  || ') ON CONFLICT (id) DO NOTHING;'
FROM auth.users ORDER BY created_at;

INSERT INTO public.temp_auth_export (line)
SELECT 'INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, email, provider_id) VALUES (' 
  || quote_nullable(id) || ', ' 
  || quote_nullable(user_id) || ', ' 
  || quote_nullable(identity_data::text) || '::jsonb, ' 
  || quote_nullable(provider) || ', ' 
  || quote_nullable(last_sign_in_at) || ', ' 
  || quote_nullable(created_at) || ', ' 
  || quote_nullable(updated_at) || ', ' 
  || quote_nullable(email) || ', ' 
  || quote_nullable(provider_id) 
  || ') ON CONFLICT (id) DO NOTHING;'
FROM auth.identities;