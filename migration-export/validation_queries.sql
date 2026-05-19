# Validation Queries for the new Supabase

-- 1. Total de usuários
SELECT count(*) as total_auth_users FROM auth.users;

-- 2. Total de profiles
SELECT count(*) as total_profiles FROM public.profiles;

-- 3. Usuários sem profile
SELECT au.id, au.email 
FROM auth.users au 
LEFT JOIN public.profiles p ON au.id = p.id 
WHERE p.id IS NULL;

-- 4. Profiles sem usuário auth
SELECT p.id, p.full_name 
FROM public.profiles p 
LEFT JOIN auth.users au ON p.id = au.id 
WHERE au.id IS NULL;

-- 5. Roles duplicadas (se aplicável)
SELECT user_id, role, count(*) 
FROM public.user_roles 
GROUP BY user_id, role 
HAVING count(*) > 1;

-- 6. Arquivos por bucket
SELECT bucket_id, count(*) as file_count 
FROM storage.objects 
GROUP BY bucket_id;

-- 7. Integridade dos church_id
-- Verifica se existem registros órfãos que apontam para igrejas inexistentes
SELECT 'profiles' as table, count(*) FROM public.profiles p WHERE NOT EXISTS (SELECT 1 FROM public.churches c WHERE c.id = p.church_id)
UNION ALL
SELECT 'turmas', count(*) FROM public.turmas t WHERE NOT EXISTS (SELECT 1 FROM public.churches c WHERE c.id = t.church_id);

-- 8. Cron jobs ativos
SELECT jobid, jobname, schedule, active FROM cron.job;

-- 9. URLs antigas do Lovable ainda presentes
-- Procura por referências ao projeto antigo em colunas de texto ou comandos de cron
SELECT jobname, command FROM cron.job WHERE command ILIKE '%hmmbspebnqkueqwcqinr%';
