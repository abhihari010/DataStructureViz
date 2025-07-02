import { useQuery } from '@tanstack/react-query';
import { getAllProblems, PracticeProblem } from '@/services/problemService';
import Navigation from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { getTopicConfig } from '@/config/topic-config';
import React from 'react';

// Map topicId to display name and icon (extend as needed)
const TOPIC_META: Record<string, { name: string; icon?: React.ReactNode }> = {
  'stack': { name: 'Stack' },
  'queue': { name: 'Queue' },
  'linked-list': { name: 'Linked List' },
  'binary-tree': { name: 'Binary Tree' },
  'graph': { name: 'Graph' },
  'array': { name: 'Array/HashMap' },
  // Add more as needed
};

function groupBy<T, K extends keyof any>(arr: T[], getKey: (item: T) => K): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const key = getKey(item);
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return <Badge className="bg-green-100 text-green-800">Easy</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    case 'hard':
      return <Badge className="bg-red-100 text-red-800">Hard</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};

export default function PracticePage() {
  const { data: problems = [], isLoading } = useQuery<PracticeProblem[]>({
    queryKey: ['allProblems'],
    queryFn: getAllProblems,
  });

  // Group problems by topicId
  const grouped = groupBy(problems, (p) => p.topicId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Practice Problems</h1>
        <p className="text-muted-foreground mb-8">Browse and solve problems grouped by data structure.</p>
        {isLoading ? (
          <div>Loading problems...</div>
        ) : (
          Object.entries(grouped).map(([topicId, problems]) => {
            const meta = TOPIC_META[topicId] || { name: topicId };
            const topicConfig = getTopicConfig(topicId);
            return (
              <div key={topicId} className="mb-10">
                <div className="flex items-center mb-4">
                  {meta.icon && <span className="mr-2">{meta.icon}</span>}
                  <h2 className="text-2xl font-semibold">{meta.name}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {problems.map((problem) => (
                    <Card key={problem.id} className="flex flex-col h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{problem.title}</CardTitle>
                        <CardDescription>{problem.description?.slice(0, 80)}{problem.description && problem.description.length > 80 ? '...' : ''}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="mb-4">{getDifficultyBadge(problem.difficulty)}</div>
                        <Button asChild className="w-full mt-auto">
                          <Link href={`/problems/${problem.id}`}>Solve</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 