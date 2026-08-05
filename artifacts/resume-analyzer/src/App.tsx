import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useAuth } from "@workspace/replit-auth-web";

import Layout from '@/components/layout';
import Home from '@/pages/Home';
import Analyze from '@/pages/Analyze';
import Results from '@/pages/Results';
import History from '@/pages/History';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, ...rest }: { component: any, path: string }) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!isAuthenticated) {
    // If not authenticated, trigger login which redirects to /api/login
    login();
    return <div className="flex-1 flex items-center justify-center bg-background"><p className="text-muted-foreground">Redirecting to login...</p></div>;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/analyze">
          {() => <ProtectedRoute component={Analyze} path="/analyze" />}
        </Route>
        <Route path="/results/:id">
          {() => <ProtectedRoute component={Results} path="/results/:id" />}
        </Route>
        <Route path="/history">
          {() => <ProtectedRoute component={History} path="/history" />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
