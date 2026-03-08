import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SetupWizard from "./pages/SetupWizard";
import DashboardSettings from "./pages/DashboardSettings";
import LandingPageView from "./pages/LandingPageView";

// Production pages (clean, no mock data)
import DashboardOverview from "./pages/production/DashboardOverview";
import DashboardLeads from "./pages/production/DashboardLeads";
import DashboardGeo from "./pages/production/DashboardGeo";
import DashboardAtendentes from "./pages/production/DashboardAtendentes";
import DashboardAds from "./pages/production/DashboardAds";
import DashboardLandingPages from "./pages/DashboardLandingPages";

// Test pages (with mock data for demo/testing)
import TestOverview from "./pages/DashboardOverview";
import TestLeads from "./pages/DashboardLeads";
import TestGeo from "./pages/DashboardGeo";
import TestAtendentes from "./pages/DashboardAtendentes";
import TestAds from "./pages/DashboardAds";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/setup" element={<SetupWizard />} />

          {/* Production routes (clean) */}
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/leads" element={<DashboardLeads />} />
          <Route path="/dashboard/geo" element={<DashboardGeo />} />
          <Route path="/dashboard/atendentes" element={<DashboardAtendentes />} />
          <Route path="/dashboard/ads" element={<DashboardAds />} />
          <Route path="/dashboard/landing-pages" element={<DashboardLandingPages />} />
          <Route path="/dashboard/settings" element={<DashboardSettings />} />

          {/* Test routes (mock data for demo) */}
          <Route path="/test/dashboard" element={<TestOverview />} />
          <Route path="/test/dashboard/leads" element={<TestLeads />} />
          <Route path="/test/dashboard/geo" element={<TestGeo />} />
          <Route path="/test/dashboard/atendentes" element={<TestAtendentes />} />
          <Route path="/test/dashboard/ads" element={<TestAds />} />

          <Route path="/lp/:slug" element={<LandingPageView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
