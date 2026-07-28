import React, { useEffect, useState } from "react";
import { useParams } from "wouter";
import AppShell from "@/components/app-shell";
import Workspace from "@/components/Workspace/workspace";
import { getProblemById, PracticeProblem } from "@/services/problemService";

const ProblemPage: React.FC = () => {
  const params = useParams();
  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProblemData = async () => {
      if (!params.pid) {
        setError("No problem ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const id = parseInt(params.pid, 10);
        if (isNaN(id)) {
          throw new Error("Invalid problem ID");
        }
        
        const problemData = await getProblemById(id);
        setProblem(problemData);
      } catch (err) {
        console.error("Error loading problem:", err);
        setError("Failed to load problem. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblemData();
  }, [params.pid]);

  if (isLoading) {
    return (
      <AppShell immersive>
        <div className="app-route-state">Loading problem...</div>
      </AppShell>
    );
  }

  if (error || !problem) {
    return (
      <AppShell immersive>
        <div className="app-route-state app-route-state-error">{error || "Problem not found"}</div>
      </AppShell>
    );
  }

  return (
    <AppShell immersive>
      <div className="app-problem-workspace">
        <Workspace problem={problem} />
      </div>
    </AppShell>
  );
};

export default ProblemPage;
