import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isPasswordRecoveryUrl } from "@/lib/passwordRecoveryRedirect";
import {
  getAppBootstrap,
  invalidateAppBootstrap,
  type BootstrapProfile,
  type BootstrapSubscription,
} from "@/lib/appBootstrap";

type Profile = BootstrapProfile;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: "user" | "admin" | "lider" | null;
  adminArea: string | null;
  isSuper: boolean;
  subscription: BootstrapSubscription | null;
  requiresPasswordSetup: boolean;
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
  subscription: null,
  requiresPasswordSetup: false,
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
  const [subscription, setSubscription] = useState<BootstrapSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const loadedUserIdRef = useRef<string | null>(null);
  const profileRequestRef = useRef<Promise<void> | null>(null);
  const profileRequestUserIdRef = useRef<string | null>(null);

  async function fetchProfileAndRole(userId: string, force = false) {
    if (!force && loadedUserIdRef.current === userId) return;
    if (!force && profileRequestRef.current && profileRequestUserIdRef.current === userId) {
      return profileRequestRef.current;
    }

    const loadBootstrapWithProfileRetry = async () => {
      let bootstrap = await getAppBootstrap(userId, force);
      const retryDelays = [150, 400, 900];

      for (const delay of retryDelays) {
        if (bootstrap.profile) break;
        await new Promise((resolve) => window.setTimeout(resolve, delay));
        invalidateAppBootstrap(userId);
        bootstrap = await getAppBootstrap(userId, true);
      }

      return bootstrap;
    };

    const request = loadBootstrapWithProfileRetry()
      .then((bootstrap) => {
        if (profileRequestUserIdRef.current !== userId) return;
        setProfile(bootstrap.profile);
        setSubscription(bootstrap.subscription);
        setIsSuper(bootstrap.is_super);
        const selectedRole = bootstrap.roles.find((row) => row.role === "admin")
          ?? bootstrap.roles[0]
          ?? null;
        setAdminArea(selectedRole?.admin_area ?? null);
        setRole(
          bootstrap.roles.some((row) => row.role === "admin")
            ? "admin"
            : bootstrap.roles.some((row) => row.role === "lider")
              ? "lider"
              : "user",
        );
        loadedUserIdRef.current = userId;
      })
      .catch((error) => {
        if (profileRequestUserIdRef.current !== userId) return;
        console.error("Error fetching app bootstrap:", error);
        setRole("user");
      })
      .finally(() => {
        if (profileRequestUserIdRef.current === userId) {
          profileRequestRef.current = null;
          profileRequestUserIdRef.current = null;
        }
      });

    profileRequestRef.current = request;
    profileRequestUserIdRef.current = userId;
    return request;
  }

  useEffect(() => {
    // Tracks the user whose bootstrap is being loaded. Unlike a boolean,
    // this also handles logout followed by login with a different account.
    let activeFetchUserId: string | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // Recovery sessions must NOT log the user in — ResetPassword page handles them.
        // Both PASSWORD_RECOVERY and INITIAL_SESSION can carry the recovery token
        // (implicit flow fires INITIAL_SESSION with the session before PASSWORD_RECOVERY).
        const isRecoveryUrl = isPasswordRecoveryUrl(
          window.location.pathname,
          window.location.search,
          window.location.hash
        );


        if (event === "PASSWORD_RECOVERY" || (isRecoveryUrl && (event === "INITIAL_SESSION" || event === "SIGNED_IN"))) {
          setLoading(false);
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!currentSession?.user) {
          setProfile(null);
          setRole(null);
          setAdminArea(null);
          setSubscription(null);
          setIsSuper(false);
          loadedUserIdRef.current = null;
          activeFetchUserId = null;
          setLoading(false);
          return;
        }

        // Handle MFA or session invalidation logic for root admin
        if (currentSession.user.email?.toLowerCase() === 'laurindosilveira@gmail.com') {
          if (typeof supabase.auth.getAuthenticatorAssuranceLevel === 'function') {
            const { data: authData } = await supabase.auth.getAuthenticatorAssuranceLevel();
            if (authData?.currentLevel !== 'aal2' && window.location.pathname.startsWith('/admin-sistema')) {
               console.warn("MFA missing for root admin on system route. Redirecting.");
               window.location.href = "/";
               return;
            }
          }
        }

        if (event === "TOKEN_REFRESHED" && loadedUserIdRef.current === currentSession.user.id) {
          return;
        }

        const shouldFetchBootstrap = event === "MFA_CHALLENGE_VERIFIED"
          || loadedUserIdRef.current !== currentSession.user.id
          || activeFetchUserId !== currentSession.user.id;

        if (shouldFetchBootstrap) {
          activeFetchUserId = currentSession.user.id;
          setLoading(true);
          setTimeout(() => {
            fetchProfileAndRole(currentSession.user.id).finally(() => setLoading(false));
          }, 0);
        }
      }
    );

    // Safety net: if auth never resolves (Supabase unreachable), stop loading after 6s
    const safetyTimeout = setTimeout(() => setLoading(false), 6000);

    // getSession covers the case where INITIAL_SESSION never fires (some browsers).
    // activeFetchUserId prevents a double fetch when both paths run.
    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        // Don't treat a session as normal login if we're in the recovery flow
        const isRecoveryUrl = isPasswordRecoveryUrl(
          window.location.pathname,
          window.location.search,
          window.location.hash
        );


        if (
          currentSession?.user
          && loadedUserIdRef.current !== currentSession.user.id
          && activeFetchUserId !== currentSession.user.id
          && !isRecoveryUrl
        ) {
          activeFetchUserId = currentSession.user.id;
          setSession(currentSession);
          setUser(currentSession.user);
          setLoading(true);
          fetchProfileAndRole(currentSession.user.id).finally(() => setLoading(false));
        } else if (!currentSession?.user || isRecoveryUrl) {
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
    setSubscription(null);
    loadedUserIdRef.current = null;
    invalidateAppBootstrap(user?.id);
  }

  async function refreshProfile() {
    const currentUser = user;
    if (currentUser?.id) {
      invalidateAppBootstrap(currentUser.id);
      loadedUserIdRef.current = null;
      await fetchProfileAndRole(currentUser.id, true);
    }
  }

  const requiresPasswordSetup = user?.app_metadata?.requires_password_setup === true
    || profile?.requires_password_setup === true;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      role,
      adminArea,
      isSuper,
      subscription,
      requiresPasswordSetup,
      loading,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
