import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/authContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SetupWizard from "./pages/SetupWizard";
import DashboardSettings from "./pages/DashboardSettings";
import LandingPageView from "./pages/LandingPageView";
import Login from "./pages/Login";

// Production pages (clean, no mock data)
import DashboardOverview from "./pages/production/DashboardOverview";
import DashboardLeads from "./pages/production/DashboardLeads";
import DashboardGeo from "./pages/production/DashboardGeo";
import DashboardAtendentes from "./pages/production/DashboardAtendentes";
import DashboardAds from "./pages/production/DashboardAds";
import DashboardLandingPages from "./pages/DashboardLandingPages";
import DashboardUsers from "./pages/production/DashboardUsers";
import DashboardReports from "./pages/production/DashboardReports";
import DashboardWhatsApp from "./pages/production/DashboardWhatsApp";

// Test pages (with mock data for demo/testing)
import TestOverview from "./pages/DashboardOverview";
import TestLeads from "./pages/DashboardLeads";
import TestGeo from "./pages/DashboardGeo";
import TestAtendentes from "./pages/DashboardAtendentes";
import TestAds from "./pages/DashboardAds";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/setup" element={<SetupWizard />} />

    {/* Production routes (protected) */}
    <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
    <Route path="/dashboard/leads" element={<ProtectedRoute><DashboardLeads /></ProtectedRoute>} />
    <Route path="/dashboard/geo" element={<ProtectedRoute><DashboardGeo /></ProtectedRoute>} />
    <Route path="/dashboard/atendentes" element={<ProtectedRoute><DashboardAtendentes /></ProtectedRoute>} />
    <Route path="/dashboard/ads" element={<ProtectedRoute><DashboardAds /></ProtectedRoute>} />
    <Route path="/dashboard/landing-pages" element={<ProtectedRoute roles={["supervisor", "administrador"]}><DashboardLandingPages /></ProtectedRoute>} />
    <Route path="/dashboard/users" element={<ProtectedRoute roles={["administrador", "supervisor"]}><DashboardUsers /></ProtectedRoute>} />
    <Route path="/dashboard/reports" element={<ProtectedRoute><DashboardReports /></ProtectedRoute>} />
    <Route path="/dashboard/whatsapp" element={<ProtectedRoute><DashboardWhatsApp /></ProtectedRoute>} />
    <Route path="/dashboard/settings" element={<ProtectedRoute roles={["administrador"]}><DashboardSettings /></ProtectedRoute>} />

    {/* Test routes (mock data for demo) */}
    <Route path="/test/dashboard" element={<TestOverview />} />
    <Route path="/test/dashboard/leads" element={<TestLeads />} />
    <Route path="/test/dashboard/geo" element={<TestGeo />} />
    <Route path="/test/dashboard/atendentes" element={<TestAtendentes />} />
    <Route path="/test/dashboard/ads" element={<TestAds />} />

    <Route path="/lp/:slug" element={<LandingPageView />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
