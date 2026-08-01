import { Switch, Route, Redirect } from "wouter";
import { lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { queryClient } from "@/lib/queryClient";
const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/landing"));
const Home = lazy(() => import("@/pages/home"));
const Stack = lazy(() => import("@/pages/stack"));
const Queue = lazy(() => import("@/pages/queue"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const LinkedList = lazy(() => import("@/pages/linked-list"));
const BinaryTree = lazy(() => import("@/pages/binary-tree"));
const Settings = lazy(() => import("@/pages/settings"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const VerifyOtp = lazy(() => import("@/pages/verify-otp"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const Topics = lazy(() => import("@/pages/topics"));
const ProblemPage = lazy(() => import("@/pages/problems/[pid]"));
const Graph = lazy(() => import("@/pages/graph"));
const Practice = lazy(() => import("@/pages/practice"));
const BubbleSort = lazy(() => import("@/pages/bubble-sort"));
const QuickSort = lazy(() => import("@/pages/quick-sort"));
const DFS = lazy(() => import("@/pages/dfs"));
const BFS = lazy(() => import("@/pages/bfs"));
const Dijkstra = lazy(() => import("@/pages/dijkstra"));
const GuidedMode = lazy(() => import("@/pages/guided-mode"));

function Router() {
  const { isAuthenticated, isLoading, isAuthTransitioning } = useAuthJWT();

  if (isLoading || isAuthTransitioning) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#151816] text-[#f2f0e9]">
        <div className="flex items-center gap-3 text-sm" role="status" aria-live="polite">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#e15a3f]" aria-hidden="true" />
          Loading workspace…
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#151816] text-[#f2f0e9]" role="status">Loading page…</div>}>
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
          <Route path="/guided/:algorithm" component={GuidedMode} />
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
    </Suspense>
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
