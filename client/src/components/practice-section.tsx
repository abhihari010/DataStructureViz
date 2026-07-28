import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { problemsApi } from "@/lib/api";
import { getTopicConfig } from "@/config/topic-config";

type PracticeProblem = {
  id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  topicId: string;
};

type PracticeSectionProps = {
  topicId: string;
};

export default function PracticeSection({ topicId }: PracticeSectionProps) {
  const { data: problems, isLoading } = useQuery<PracticeProblem[]>({
    queryKey: ["/api/problems", topicId],
    queryFn: () => problemsApi.getProblems(topicId),
  });
  const { keyConcepts, nextSteps } = getTopicConfig(topicId);

  if (isLoading) {
    return <div className="app-inline-state">Loading practice material...</div>;
  }

  return (
    <div className="app-practice-section">
      {keyConcepts.length > 0 && (
        <div className="app-practice-concepts">
          {keyConcepts.slice(0, 3).map((concept) => (
            <article className="app-practice-concept" key={concept.title}>
              <concept.icon aria-hidden="true" />
              <div>
                <h3>{concept.title}</h3>
                <p>{concept.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {problems && problems.length > 0 ? (
        <div className="app-problem-list">
          {problems.map((problem, index) => (
            <article className="app-problem-row" key={problem.id}>
              <span className="app-problem-row-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{problem.title}</h3>
                <p>{problem.description}</p>
              </div>
              <span className="app-difficulty">{problem.difficulty}</span>
              <Link className="app-problem-action" href={`/problems/${problem.id}`}>
                Solve
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="app-inline-state">
          No practice problems are available for this topic yet.
        </div>
      )}

      {nextSteps.length > 0 && (
        <nav className="app-next-path" aria-label="Continue learning">
          {nextSteps.map((step) => (
            <Link href={`/${step.id}`} key={step.id}>
              <step.icon aria-hidden="true" />
              {step.name}
              <ArrowRight aria-hidden="true" />
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
