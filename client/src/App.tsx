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
import LinkedList from "@/pages/linked-list";
import BinaryTree from "@/pages/binary-tree";
import Settings from "@/pages/settings";
import ResetPassword from "@/pages/reset-password";
import VerifyOtp from "@/pages/verify-otp";
import ForgotPassword from "@/pages/forgot-password";
import Topics from "@/pages/topics";
import ProblemPage from "@/pages/problems/[pid]";
import Workspace from "@/components/Workspace/workspace";
import Graph from "@/pages/graph";
import Practice from "@/pages/practice";

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
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/verify-otp" component={VerifyOtp} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/topics" component={Topics} />
          <Route path="/topics/stack" component={Stack} />
          <Route path="/topics/queue" component={Queue} />
          <Route path="/topics/linked-list" component={LinkedList} />
          <Route path="/topics/binary-tree" component={BinaryTree} />
          <Route path="/settings" component={Settings} />
          <Route path="/problems/:pid" component={ProblemPage} />
          <Route path="/topics/graph" component={Graph} />
          <Route path="/practice" component={Practice} />
          {/*
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
