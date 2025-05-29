import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PracticeProblem } from "@shared/schema";
import { BookOpen, Code2, ArrowRight, CheckCircle, List, Link as LinkIcon } from "lucide-react";

interface PracticeSectionProps {
  topicId: string;
}

export default function PracticeSection({ topicId }: PracticeSectionProps) {
  const { data: problems } = useQuery<PracticeProblem[]>({
    queryKey: ["/api/problems", topicId],
    queryFn: async () => {
      const response = await fetch(`/api/problems?topicId=${topicId}`);
      return response.json();
    },
  });

  // Fallback mock data for development
  const mockProblems = [
    {
      id: 1,
      title: "Valid Parentheses",
      description: "Check if brackets are balanced",
      difficulty: "easy" as const,
      topicId: "stack",
    },
    {
      id: 2,
      title: "Min Stack",
      description: "Stack with O(1) min operation",
      difficulty: "medium" as const,
      topicId: "stack",
    },
  ];

  const keyConcepts = [
    {
      icon: CheckCircle,
      title: "LIFO Principle",
      description: "Last element added is first to be removed",
    },
    {
      icon: CheckCircle,
      title: "Push & Pop",
      description: "Primary operations for adding and removing",
    },
    {
      icon: CheckCircle,
      title: "Peek Operation",
      description: "View top element without removing",
    },
  ];

  const nextSteps = [
    { id: "queue", name: "Queue", icon: List, path: "/queue" },
    { id: "linked-list", name: "Linked List", icon: LinkIcon, path: "/linked-list" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const displayProblems = problems && problems.length > 0 ? problems : mockProblems;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practice Problems */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Practice Problems</span>
            </CardTitle>
            <CardDescription>
              Apply what you've learned with these challenges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayProblems.slice(0, 2).map((problem) => (
              <div key={problem.id} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/20 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-900">{problem.title}</h4>
                  <p className="text-sm text-gray-600">{problem.description}</p>
                </div>
                <Badge className={getDifficultyColor(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
              </div>
            ))}
            <Button className="w-full mt-4">
              View All Problems
            </Button>
          </CardContent>
        </Card>

        {/* Key Concepts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code2 className="h-5 w-5" />
              <span>Key Concepts</span>
            </CardTitle>
            <CardDescription>
              Important principles to remember
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {keyConcepts.map((concept, index) => (
              <div key={index} className="flex items-start space-x-3">
                <concept.icon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">{concept.title}</h4>
                  <p className="text-sm text-gray-600">{concept.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5" />
              <span>Next Steps</span>
            </CardTitle>
            <CardDescription>
              Continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextSteps.map((item) => (
              <a
                key={item.id}
                href={item.path}
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </a>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View Learning Path
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
