import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { FileText, History, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();

  const isCurrent = (path: string) => location === path;

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar for authenticated users, otherwise top nav or minimal nav */}
      {isAuthenticated ? (
        <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col shrink-0 sticky top-0 md:h-[100dvh]">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground" data-testid="link-home">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                <FileText size={18} />
              </div>
              ResumeIQ
            </Link>
          </div>
          
          <nav className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
            <Link 
              href="/" 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isCurrent("/") 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground hover-elevate"
              )}
              data-testid="link-nav-dashboard"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            
            <Link 
              href="/analyze" 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isCurrent("/analyze") 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground hover-elevate"
              )}
              data-testid="link-nav-analyze"
            >
              <FileText size={18} />
              New Analysis
            </Link>
            
            <Link 
              href="/history" 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isCurrent("/history") 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground hover-elevate"
              )}
              data-testid="link-nav-history"
            >
              <History size={18} />
              History
            </Link>
          </nav>
          
          <div className="p-4 border-t border-border mt-auto">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-medium border border-border">
                {user?.firstName?.[0] || user?.email?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.firstName || user?.email?.split('@')[0]}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors hover-elevate"
              data-testid="button-logout"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>
      ) : (
        <header className="w-full border-b border-border bg-card flex items-center justify-between px-6 py-4 shrink-0 fixed top-0 z-50">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground" data-testid="link-home-public">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <FileText size={18} />
            </div>
            ResumeIQ
          </Link>
          <button 
            onClick={login}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-md text-sm hover:opacity-90 transition-opacity shadow-sm hover-elevate"
            data-testid="button-login-header"
          >
            Sign In
          </button>
        </header>
      )}

      <main className={cn(
        "flex-1 flex flex-col min-w-0",
        !isAuthenticated && "pt-16" // Account for fixed header when unauthenticated
      )}>
        {children}
      </main>
    </div>
  );
}
