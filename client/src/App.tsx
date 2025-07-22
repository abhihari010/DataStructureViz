import { Switch, Route, Redirect } from "wouter";
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
import Graph from "@/pages/graph";
import Practice from "@/pages/practice";
import BubbleSort from "@/pages/bubble-sort";
import QuickSort from "@/pages/quick-sort";
import DFS from "@/pages/dfs";
import BFS from "@/pages/bfs";
import Dijkstra from "@/pages/dijkstra";

function Router() {
  const { isAuthenticated, isLoading, isAuthTransitioning } = useAuthJWT();

  if (isLoading || isAuthTransitioning) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
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
          <Route path="/bubble-sort" component={BubbleSort} />
          <Route path="/quick-sort" component={QuickSort} />
          <Route path="/dfs" component={DFS} />
          <Route path="/bfs" component={BFS} />
          <Route path="/dijkstra" component={Dijkstra} />
          {/* Redirect authenticated users trying to access public routes */}
          <Route path="/login" component={() => <Redirect to="/" />} />
          <Route path="/register" component={() => <Redirect to="/" />} />
          <Route path="/verify-email" component={() => <Redirect to="/" />} />
          <Route
            path="/forgot-password"
            component={() => <Redirect to="/" />}
          />
          <Route path="/reset-password" component={() => <Redirect to="/" />} />
          <Route path="/verify-otp" component={() => <Redirect to="/" />} />
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
