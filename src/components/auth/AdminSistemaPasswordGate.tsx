import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, ShieldAlert, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

// Hash simple pour la démo, idéalement on utiliserait une fonction plus robuste 
// mais pour ce cas spécifique d'accès admin panneau système, on vérifie l'admin list d'abord.
const ADMIN_PASSWORD_HASH = "20212014"; 

type AccessState = "checking" | "authorized_admin" | "denied" | "password_required";

export default function AdminSistemaPasswordGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionAuthorized, setSessionAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      if (loading) return;
      if (!user?.email) {
        setAccessState("denied");
        return;
      }

      setAccessState("checking");
      
      // On vérifie d'abord si l'utilisateur est dans la liste des admins autorisés
      const { data: isAuthorized } = await supabase.rpc("is_authorized_system_admin_v2");
      
      if (isMounted) {
        if (isAuthorized === true) {
          // Si l'utilisateur est un admin autorisé, on demande le mot de passe spécial
          setAccessState("password_required");
          
          // Vérifier si déjà autorisé dans cette session
          const isSessionValid = sessionStorage.getItem(`admin_auth_${user.id}`) === "true";
          if (isSessionValid) {
            setSessionAuthorized(true);
            setAccessState("authorized_admin");
          }
        } else {
          await supabase.rpc('log_system_access_attempt', { p_status: 'denied' });
          setAccessState("denied");
        }
      }
    }

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [loading, user?.id, user?.email]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Vérification du mot de passe (comparaison directe pour ce cas spécifique demandé)
    if (password === ADMIN_PASSWORD_HASH) {
      sessionStorage.setItem(`admin_auth_${user?.id}`, "true");
      await supabase.rpc('log_system_access_attempt', { p_status: 'success' });
      setSessionAuthorized(true);
      setAccessState("authorized_admin");
      toast({
        title: "Acesso liberado",
        description: "Bem-vindo ao painel do sistema.",
      });
    } else {
      await supabase.rpc('log_system_access_attempt', { p_status: 'password_fail' });
      toast({
        title: "Senha incorreta",
        description: "Verifique a senha e tente novamente.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (accessState === "authorized_admin" || sessionAuthorized) return <>{children}</>;

  if (accessState === "password_required") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border shadow-xl">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="font-montserrat text-2xl font-black text-foreground">
                Senha do Sistema
              </CardTitle>
              <CardDescription className="font-inter text-sm text-muted-foreground">
                Digite a senha mestra para acessar o Painel do Sistema.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Digite a senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
                autoFocus
              />
              <div className="flex flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full rounded-xl font-bold" 
                  disabled={isSubmitting || !password}
                >
                  {isSubmitting ? "Verificando..." : "Entrar no Painel"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full rounded-xl text-xs" 
                  onClick={() => navigate("/")}
                >
                  Voltar para o app
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accessState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <p className="font-inter text-sm text-muted-foreground">Verificando permissao segura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "var(--gradient-hero)" }}
          >
            <ShieldAlert className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="font-montserrat text-2xl font-black text-foreground">
              Acesso restrito
            </CardTitle>
            <CardDescription className="font-inter text-sm text-muted-foreground">
              Seu usuario nao esta autorizado a acessar a administracao do sistema.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
            <p className="font-inter text-muted-foreground">
              A liberacao agora e feita pela lista segura de administradores autorizados no Supabase.
            </p>
          </div>
          <Button type="button" className="w-full rounded-xl" onClick={() => navigate("/")}>
            Voltar para o app
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
