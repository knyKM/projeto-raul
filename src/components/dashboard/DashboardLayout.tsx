import { ReactNode } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardList, MapPin, LogOut, Megaphone, FileText, Settings, Lock } from "lucide-react";
import defaultLogo from "@/assets/logo-mogibens.png";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import { getConfig } from "@/lib/configStore";
import { hasFeature, type Feature } from "@/lib/featureAccess";

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; feature?: Feature }[] = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard, feature: "dashboard_basic" },
  { href: "/dashboard/leads", label: "Fila de Leads", icon: ClipboardList, feature: "leads_basic" },
  { href: "/dashboard/ads", label: "Central de Ads", icon: Megaphone, feature: "ads_central" },
  { href: "/dashboard/landing-pages", label: "Landing Pages", icon: FileText, feature: "landing_pages_single" },
  { href: "/dashboard/geo", label: "Geolocalização", icon: MapPin, feature: "geo" },
  { href: "/dashboard/atendentes", label: "Atendentes", icon: Users, feature: "atendentes" },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings, feature: "settings" },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const config = getConfig();

  // Redirect to setup if not completed
  if (!config.setupCompleted) {
    return <Navigate to="/setup" replace />;
  }

  const logoSrc = config.companyLogoUrl || defaultLogo;
  const companyName = config.companyName || "sistemaLeads";

  return (
    <div className="min-h-screen flex bg-muted/40 max-w-[100vw] overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
              <img src={logoSrc} alt={companyName} className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-foreground truncate max-w-[160px]">{companyName}</p>
              <p className="text-xs text-muted-foreground font-body">Painel Administrativo</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const isLocked = item.feature ? !hasFeature(item.feature) : false;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : isLocked
                      ? "text-muted-foreground/50 hover:bg-muted/50"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
                {isLocked && <Lock className="w-3 h-3 text-muted-foreground/40" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <div className="flex items-center justify-between px-3 py-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Voltar ao Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar mobile */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-card border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
              <img src={logoSrc} alt={companyName} className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground truncate max-w-[120px]">{companyName}</span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 px-4 py-2 bg-card border-b border-border overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const isLocked = item.feature ? !hasFeature(item.feature) : false;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-body whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : isLocked
                      ? "text-muted-foreground/50"
                      : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
                {isLocked && <Lock className="w-2.5 h-2.5" />}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
