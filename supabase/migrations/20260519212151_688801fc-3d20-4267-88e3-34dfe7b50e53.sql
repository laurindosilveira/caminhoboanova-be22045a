CREATE TABLE IF NOT EXISTS public.auth_users_export AS SELECT * FROM auth.users;
CREATE TABLE IF NOT EXISTS public.auth_identities_export AS SELECT * FROM auth.identities;