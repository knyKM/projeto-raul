import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardList, MapPin, LogOut } from "lucide-react";
import logo from "@/assets/logo-mogibens.png";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Fila de Leads", icon: ClipboardList },
  { href: "/dashboard/geo", label: "Geolocalização", icon: MapPin },
  { href: "/dashboard/atendentes", label: "Atendentes", icon: Users },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Mogibens" className="h-9 w-auto rounded-md" />
            <div>
              <p className="font-display text-sm font-semibold text-foreground">Mogibens</p>
              <p className="text-xs text-muted-foreground font-body">Painel Administrativo</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-card border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Mogibens" className="h-8 w-auto rounded-md" />
            <span className="font-display text-sm font-semibold text-foreground">Painel</span>
          </Link>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 px-4 py-2 bg-card border-b border-border overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-body whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
