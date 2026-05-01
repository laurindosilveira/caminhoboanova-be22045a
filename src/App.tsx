import { Toaster } from "@/components/ui/toaster";
import OfflineBanner from "@/components/home/OfflineBanner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AreaSwitchProvider } from "@/contexts/AreaSwitchContext";
import { lazy, Suspense } from "react";

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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();
const ADMIN_PANEL_ROLES = ["admin", "lider"] as const;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

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
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={ADMIN_PANEL_ROLES.includes(role as (typeof ADMIN_PANEL_ROLES)[number]) ? "/admin" : "/"} replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!ADMIN_PANEL_ROLES.includes(role as (typeof ADMIN_PANEL_ROLES)[number])) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 mb-4 flex items-center justify-center">
            <span className="text-2xl">✝️</span>
          </div>
          <p className="text-muted-foreground font-inter text-sm">Carregando aplicativo...</p>
        </div>
      </div>
    }
  >
    <Routes>
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Public auth routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/recuperar-senha" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/verificar-email" element={<VerifyEmail />} />
      <Route path="/redefinir-senha" element={<ResetPassword />} />
      <Route path="/instalar" element={<Install />} />
      <Route path="/apresentacao" element={<Apresentacao />} />
      <Route path="/exportar-dados" element={<ProtectedRoute><ExportData /></ProtectedRoute>} />
      <Route path="/minha-igreja" element={<ProtectedRoute><MinhaIgreja /></ProtectedRoute>} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/admin-sistema" element={<ProtectedRoute><AdminSistema /></ProtectedRoute>} />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => (
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

export default App;
