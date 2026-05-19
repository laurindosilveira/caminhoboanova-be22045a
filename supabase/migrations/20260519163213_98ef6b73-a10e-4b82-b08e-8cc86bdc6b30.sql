-- Fix search_path for is_authorized_system_admin
ALTER FUNCTION public.is_authorized_system_admin() SET search_path = public;

-- Fix search_path for is_authorized_system_admin_v2
ALTER FUNCTION public.is_authorized_system_admin_v2() SET search_path = public;
