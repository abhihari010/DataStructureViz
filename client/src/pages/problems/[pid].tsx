import React, { useEffect, useState } from "react";
import { useParams } from "wouter";
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
    return <div className="flex items-center justify-center h-screen">Loading problem...</div>;
  }

  if (error || !problem) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error || "Problem not found"}</div>;
  }

  return <Workspace problem={problem} />;
};

export default ProblemPage;
