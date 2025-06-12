import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { queryClient } from "@/lib/queryClient";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Stack from "@/pages/stack";
import Queue from "@/pages/queue";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VerifyEmail from "@/pages/verify-email";

function Router() {
  const { isAuthenticated, isLoading, isAuthTransitioning } = useAuthJWT();

  if (isLoading || isAuthTransitioning) {
    return <div>Loading...</div>;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/verify-email" component={VerifyEmail} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/stack" component={Stack} />
          <Route path="/queue" component={Queue} />
          {/*
          <Route path="/linked-list" component={LinkedList} />
          <Route path="/binary-tree" component={BinaryTree} />
          <Route path="/graph" component={Graph} />
          <Route path="/bubble-sort" component={BubbleSort} />
          <Route path="/quick-sort" component={QuickSort} />
          <Route path="/dfs-bfs" component={DFSBFS} />
          <Route path="/dijkstra" component={Dijkstra} />
          */}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
