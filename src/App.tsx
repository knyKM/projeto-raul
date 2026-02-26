import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardLeads from "./pages/DashboardLeads";
import DashboardGeo from "./pages/DashboardGeo";
import DashboardAtendentes from "./pages/DashboardAtendentes";
import DashboardAds from "./pages/DashboardAds";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/leads" element={<DashboardLeads />} />
          <Route path="/dashboard/geo" element={<DashboardGeo />} />
          <Route path="/dashboard/atendentes" element={<DashboardAtendentes />} />
          <Route path="/dashboard/ads" element={<DashboardAds />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
