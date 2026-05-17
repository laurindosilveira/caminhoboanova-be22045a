CREATE POLICY "System admins can view all audit logs"
ON public.church_audit_logs
FOR SELECT
USING (
    public.is_authorized_system_admin_v2()
);
