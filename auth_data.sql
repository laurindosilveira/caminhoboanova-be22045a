-- Backup COMPLETO de usuários (Total: 41)
SET session_replication_role = 'replica';

INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at, 
  role, aud, instance_id, is_anonymous, raw_app_meta_data, raw_user_meta_data, 
  is_super_admin, phone, phone_confirmed_at, confirmation_token, recovery_token, 
  email_change_token_new, email_change, last_sign_in_at, phone_change, 
  phone_change_token, email_change_token_current, email_change_confirm_status, 
  banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at
) VALUES
ON CONFLICT (id) DO NOTHING;

SET session_replication_role = 'origin';

SELECT count(*) as total_users FROM auth.users;
SELECT count(*) as total_identities FROM auth.identities;
