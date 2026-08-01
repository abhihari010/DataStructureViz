import { useMemo } from "react";
import { Redirect, useLocation } from "wouter";
import AppShell from "@/components/app-shell";
import GuidedTracePlayer from "@/features/guided-mode/guided-trace-player";
import { createGuidedTrace } from "@/features/guided-mode/guided-traces";

export default function GuidedModePage() {
  const [location] = useLocation();
  const algorithm = location.includes("bubble-sort") ? "bubble-sort" : "linked-list-search";
  const trace = useMemo(
    () => createGuidedTrace({
      algorithmId: algorithm,
      problemId: algorithm === "bubble-sort" ? "guided-bubble-sort" : "guided-linked-list-search",
      input: algorithm === "bubble-sort" ? { values: [5, 1, 4, 2] } : { values: [3, 8, 5, 9], target: 5 },
    }),
    [algorithm],
  );

  if (!location.startsWith("/guided/")) return <Redirect to="/guided/linked-list-search" />;
  return <AppShell><GuidedTracePlayer trace={trace} /></AppShell>;
}
