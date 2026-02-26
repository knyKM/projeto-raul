import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardLeads from "./pages/DashboardLeads";
import DashboardGeo from "./pages/DashboardGeo";
import DashboardAtendentes from "./pages/DashboardAtendentes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/leads" element={<DashboardLeads />} />
          <Route path="/dashboard/geo" element={<DashboardGeo />} />
          <Route path="/dashboard/atendentes" element={<DashboardAtendentes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
