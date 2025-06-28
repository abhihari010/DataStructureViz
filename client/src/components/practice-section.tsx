import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTopicConfig, TopicConcept } from "@/config/topic-config";

interface PracticeProblem {
  id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  topicId: string;
}

interface PracticeSectionProps {
  topicId: string;
}

export default function PracticeSection({ topicId }: PracticeSectionProps) {
  const { data: problems, isLoading } = useQuery<PracticeProblem[]>({
    queryKey: ["/api/problems", topicId],
    queryFn: () => problemsApi.getProblems(topicId),
  });

  // Get topic-specific configuration
  const { keyConcepts, nextSteps } = getTopicConfig(topicId);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div>Loading practice problems...</div>;
  }

  if (!problems || problems.length === 0) {
    return <div>No practice problems available for this topic.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Key Concepts */}
      <Card>
        <CardHeader>
          <CardTitle>Key Concepts</CardTitle>
          <CardDescription>Master these fundamental concepts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {keyConcepts.map((concept, index) => (
              <div key={index} className="flex items-start space-x-3">
                <concept.icon className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">{concept.title}</h4>
                  <p className="text-sm text-gray-600">{concept.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice Problems */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Problems</CardTitle>
          <CardDescription>
            Apply your knowledge with these problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {problems.map((problem: PracticeProblem) => (
              <div
                key={problem.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{problem.title}</h4>
                  <p className="text-sm text-gray-600">{problem.description}</p>
                  <Badge
                    className={`mt-2 ${getDifficultyColor(problem.difficulty)}`}
                  >
                    {problem.difficulty}
                  </Badge>
                </div>
                <Link href={`/problems/${problem.id}`}>
                  <Button asChild>
                    <span>Solve</span>
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>Continue your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {nextSteps.map((step) => (
              <Card key={step.id} className="transition-shadow">
                <CardContent className="p-0">
                  <Link
                    href={`/${step.id}`}
                    className="flex items-center space-x-4 py-4 px-4 hover:bg-gray-50 rounded-lg transition group"
                  >
                    <step.icon className="h-6 w-6 text-primary" />
                    <div>
                      <h4 className="font-medium group-hover:underline">
                        {step.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Learn about {step.name.toLowerCase()}
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
