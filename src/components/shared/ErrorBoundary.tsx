import React, { Component, ErrorInfo, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureAppError } from "@/lib/monitoring";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) console.error("Uncaught error:", error, errorInfo);
    captureAppError(error, { componentStack: errorInfo.componentStack ?? "" });
    void this.logErrorToSupabase(error, errorInfo);
  }

  private async logErrorToSupabase(error: Error, errorInfo: ErrorInfo) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await supabase
        .from("profiles")
        .select("church_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile.data?.church_id) return;

      await supabase.from("frontend_error_logs").insert({
        church_id: profile.data.church_id,
        user_id: user.id,
        error_message: error.message,
        stack_trace: error.stack,
        component_stack: errorInfo.componentStack,
        url: `${window.location.origin}${window.location.pathname}`,
        user_agent: navigator.userAgent,
        severity: 'error'
      });
    } catch (logError) {
      if (import.meta.env.DEV) console.error("Failed to log error to Supabase:", logError);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-montserrat font-black text-foreground">Algo deu errado</h1>
              <p className="text-muted-foreground font-inter">
                Ocorreu um erro inesperado. Já notificamos nossa equipe técnica para resolver o problema.
              </p>
            </div>
            {import.meta.env.DEV && (
              <pre className="text-xs text-left p-4 bg-muted rounded-md overflow-auto max-h-40 border border-border">
                {this.state.error?.toString()}
              </pre>
            )}
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full h-12 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Aplicativo
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
