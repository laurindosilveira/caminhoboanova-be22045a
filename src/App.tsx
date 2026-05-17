import { Suspense, lazy, useEffect, useState } from "react";
// Build V10: SALA DO DISCIPULADOR - 2024-05-13

import { Toaster } from "@/components/ui/toaster";
import OfflineBanner from "@/components/home/OfflineBanner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AreaSwitchProvider } from "@/contexts/AreaSwitchContext";
import { isAppInstalled } from "@/lib/utils";

// Lazy load pages for better initial performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Install = lazy(() => import("./pages/Install"));
const ExportData = lazy(() => import("./pages/ExportData"));
const Apresentacao = lazy(() => import("./pages/Apresentacao"));
const MinhaIgreja = lazy(() => import("./pages/MinhaIgreja"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AdminSistema = lazy(() => import("./pages/AdminSistema"));
const AreaMembros = lazy(() => import("./pages/AreaMembros"));
const NotFound = lazy(() => import("./pages/NotFound"));
import AdminSistemaPasswordGate from "./components/auth/AdminSistemaPasswordGate";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur border-2 border-white/30 flex items-center justify-center mx-auto mb-4 animate-float">
            <span className="text-3xl">✝️</span>
          </div>
          <p className="text-primary-foreground font-inter text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (profile?.enrollment_status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
            <span className="text-destructive text-xl font-black">!</span>
          </div>
          <h1 className="font-montserrat text-xl font-black text-foreground">Cadastro nao autorizado</h1>
          <p className="mt-2 font-inter text-sm text-muted-foreground">
            Seu cadastro foi rejeitado pela lideranca da sua area. Fale com a equipe da igreja se achar que isso foi um engano.
          </p>
          <button
            onClick={() => void signOut()}
            className="mt-5 w-full rounded-xl bg-destructive px-4 py-3 font-montserrat text-sm font-bold text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={(role === "admin" || role === "lider") ? "/admin" : "/"} replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin" && role !== "lider") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingFallback />;

  const installed = isAppInstalled();

  if (user) {
    // Set persistence flag when user is logged in
    localStorage.setItem('caminho_app_active', 'true');
    return <Navigate to="/home" replace />;
  }

  if (installed) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/apresentacao" replace />;
}

function NotFoundRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to="/apresentacao" replace />;
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
    <div className="text-center">
      <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur border-2 border-white/30 flex items-center justify-center mx-auto mb-4 animate-float">
        <span className="text-3xl">✝️</span>
      </div>
      <p className="text-primary-foreground font-inter text-sm">Carregando...</p>
    </div>
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      {/* Root handling logic */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Protected routes */}
      <Route path="/home" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Public auth routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/recuperar-senha" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/verificar-email" element={<VerifyEmail />} />
      <Route path="/redefinir-senha" element={<ResetPassword />} />
      <Route path="/instalar" element={<Install />} />
      <Route path="/apresentacao" element={<Apresentacao />} />
      <Route path="/area-membros" element={<PublicRoute><AreaMembros /></PublicRoute>} />
      <Route path="/exportar-dados" element={<ProtectedRoute><ExportData /></ProtectedRoute>} />
      <Route path="/minha-igreja" element={<ProtectedRoute><MinhaIgreja /></ProtectedRoute>} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/admin-sistema"
        element={
          <AdminSistemaPasswordGate>
            <AdminSistema />
          </AdminSistemaPasswordGate>
        }
      />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  </Suspense>
);

const App = () => {
  useEffect(() => {
    console.log("App Version: SALA DO DISCIPULADOR V10 - Multi-Church Sync");
  }, []);



  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100000] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Pular para o conteúdo principal
        </a>
        

        <OfflineBanner />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AreaSwitchProvider>
              <AppRoutes />
            </AreaSwitchProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
