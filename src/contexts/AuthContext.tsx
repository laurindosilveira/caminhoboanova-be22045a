import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  birth_date: string;
  phone: string;
  community: string;
  area: string;
  church_id?: string | null;
  churches?: { name: string | null } | null;
  turma_id?: string | null;
  father_name?: string;
  mother_name?: string;
  father_phone?: string;
  mother_phone?: string;
  address?: string;
  avatar_url?: string;
  confirmation_year?: number | null;
  enrollment_status?: "pending" | "approved" | "rejected";
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: "user" | "admin" | "lider" | null;
  adminArea: string | null;
  isSuper: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: null,
  adminArea: null,
  isSuper: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<"user" | "admin" | "lider" | null>(null);
  const [adminArea, setAdminArea] = useState<string | null>(null);
  const [isSuper, setIsSuper] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchProfileAndRole(userId: string) {
    const results = await Promise.allSettled([
      supabase.from("profiles").select("*, churches(name)").eq("user_id", userId).maybeSingle(),
      supabase.rpc("is_super_admin", { _user_id: userId }),
      supabase.from("user_roles").select("role, admin_area").eq("user_id", userId).in("role", ["admin", "lider"]),
    ]);

    const profileRes = results[0].status === 'fulfilled' ? results[0].value : { data: null, error: (results[0] as any).reason };
    const isSuperRes = results[1].status === 'fulfilled' ? results[1].value : { data: false, error: (results[1] as any).reason };
    const roleRowsRes = results[2].status === 'fulfilled' ? results[2].value : { data: [], error: (results[2] as any).reason };

    if (profileRes.error) console.error("Error fetching profile:", profileRes.error);
    if (isSuperRes.error) console.error("Error checking super admin:", isSuperRes.error);
    if (roleRowsRes.error) console.error("Error fetching user roles:", roleRowsRes.error);
    setProfile((profileRes.data as any) ?? null);
    setIsSuper(isSuperRes.data === true);
    const roleRows = roleRowsRes.data ?? [];
    const selectedRoleRow = roleRows.find((row) => row.role === "admin") ?? roleRows[0] ?? null;
    setAdminArea(selectedRoleRow?.admin_area ?? null);
    const isAdmin = roleRows.some((row) => row.role === "admin");
    const isLider = roleRows.some((row) => row.role === "lider");
    if (isAdmin) setRole("admin");
    else if (isLider) setRole("lider");
    else setRole("user");
  }

  useEffect(() => {
    // Track whether the initial profile fetch has been started to avoid
    // running it twice (once from INITIAL_SESSION, once from getSession).
    let initialFetchDone = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // DEBUG TEMPORÁRIO — remover após resolver o problema
        console.log("[AUTH DEBUG] event:", event, "| url:", window.location.href, "| user:", currentSession?.user?.email ?? null);

        // Recovery sessions must NOT log the user in — ResetPassword page handles them.
        // Both PASSWORD_RECOVERY and INITIAL_SESSION can carry the recovery token
        // (implicit flow fires INITIAL_SESSION with the session before PASSWORD_RECOVERY).
        const isRecoveryUrl =
          window.location.pathname === "/redefinir-senha" ||
          window.location.hash.includes("type=recovery") ||
          new URLSearchParams(window.location.search).has("code");

        console.log("[AUTH DEBUG] isRecoveryUrl:", isRecoveryUrl);

        if (event === "PASSWORD_RECOVERY" || (isRecoveryUrl && event === "INITIAL_SESSION")) {
          setLoading(false);
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!currentSession?.user) {
          setProfile(null);
          setRole(null);
          setAdminArea(null);
          setLoading(false);
          return;
        }

        // Handle MFA or session invalidation logic for root admin
        if (currentSession.user.email?.toLowerCase() === 'laurindosilveira@gmail.com') {
          if (typeof (supabase.auth as any).getAuthenticatorAssuranceLevel === 'function') {
            const { data: authData } = await (supabase.auth as any).getAuthenticatorAssuranceLevel();
            if (authData?.currentLevel !== 'aal2' && window.location.pathname.startsWith('/admin-sistema')) {
               console.warn("MFA missing for root admin on system route. Redirecting.");
               window.location.href = "/";
               return;
            }
          }
        }

        if (event === "TOKEN_REFRESHED") {
          return;
        }

        if (!initialFetchDone || event === "SIGNED_IN" || event === "MFA_CHALLENGE_VERIFIED") {
          initialFetchDone = true;
          setTimeout(() => {
            fetchProfileAndRole(currentSession.user.id).finally(() => setLoading(false));
          }, 0);
        }
      }
    );

    // Safety net: if auth never resolves (Supabase unreachable), stop loading after 6s
    const safetyTimeout = setTimeout(() => setLoading(false), 6000);

    // getSession covers the case where INITIAL_SESSION never fires (some browsers).
    // The initialFetchDone flag prevents a double fetch when both paths run.
    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        // Don't treat a session as normal login if we're in the recovery flow
        const isRecoveryUrl =
          window.location.pathname === "/redefinir-senha" ||
          window.location.hash.includes('type=recovery') ||
          new URLSearchParams(window.location.search).has('code');

        console.log("[AUTH DEBUG] getSession | user:", currentSession?.user?.email ?? null, "| isRecoveryUrl:", isRecoveryUrl, "| url:", window.location.href);

        if (currentSession?.user && !initialFetchDone && !isRecoveryUrl) {
          initialFetchDone = true;
          setSession(currentSession);
          setUser(currentSession.user);
          fetchProfileAndRole(currentSession.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
    setAdminArea(null);
    setIsSuper(false);
  }

  async function refreshProfile() {
    const currentUser = user;
    if (currentUser?.id) {
      await fetchProfileAndRole(currentUser.id);
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, role, adminArea, isSuper, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
