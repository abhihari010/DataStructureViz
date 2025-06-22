import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Clock, ArrowRight, CheckCircle, PlayCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuthJWT } from '@/hooks/useAuthJWT';
import { progressApi } from '@/lib/api';

interface UserProgress {
  id: number;
  userId: string;
  topicId: string;
  completed: boolean;
  score: number | null;
  timeSpent: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  completedAt: string | null;
}

// Define topic metadata with difficulty levels and estimated times
const TOPICS = [
  { id: "linked-list", name: "Linked List", difficulty: "Beginner", time: 30, icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V5a2 2 0 0 1 2-2h13.9a.1.1 0 0 1 .1.1v13.8a.1.1 0 0 1-.1.1H6a2 2 0 0 1-2-2zM8 9h8m-8 4h8m-8 4h5" /></svg> },
  { id: "stack", name: "Stack", difficulty: "Beginner", time: 20, icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 8H8v10h8V8z" /></svg> },
  { id: "queue", name: "Queue", difficulty: "Beginner", time: 20, icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 8H8v10h8V8z" /><path d="M8 10h8" /><path d="M8 14h8" /></svg> },
  { id: "binary-tree", name: "Binary Tree", difficulty: "Intermediate", time: 45, icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12h8m-4-4v8m-6 4h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg> },
  { id: "graph", name: "Graph", difficulty: "Advanced", time: 60, icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M6.34 17.66l-1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" /></svg> },
  { id: "hash-table", name: "Hash Table", difficulty: "Intermediate", time: 25, icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M8 12h8m-8-4h8m-8 8h8" /></svg> },
  { id: "heap", name: "Heap", difficulty: "Intermediate", time: 30, icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M10 11v6" /><path d="M14 11v6" /></svg> },
];

export default function TopicsPage() {
  const { user } = useAuthJWT();
  
  // Fetch user progress data
  const { data: progress = [], isLoading } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      try {
        const response = await progressApi.getUserProgress();
        return response.data;
      } catch (error) {
        console.error('Error fetching progress:', error);
        return [];
      }
    },
    enabled: !!user,
    retry: 1
  });

  // Calculate completion status for each topic
  const topicsWithProgress = TOPICS.map(topic => {
    const topicProgress = Array.isArray(progress) 
      ? progress.find((p: UserProgress) => p.topicId === topic.id) || {}
      : {};
    const isCompleted = topicProgress?.completed || false;
    const timeSpent = topicProgress?.timeSpent || 0;
    const score = topicProgress?.score || 0;
    
    // Calculate progress percentage based on time spent vs estimated time
    const progressPercent = Math.min(Math.round((timeSpent / (topic.time * 60)) * 100), 100);
    
    return {
      ...topic,
      isCompleted,
      timeSpent,
      score,
      progressPercent
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Structures</h1>
        <p className="text-muted-foreground">
          Explore and learn about different data structures. Start with the basics and work your way up!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, i) => (
            <Card key={`skeleton-${i}`} className="h-48">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Topic cards
          topicsWithProgress.map((topic) => (
            <Card key={topic.id} className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {topic.icon}
                    </div>
                    <CardTitle className="text-lg">{topic.name}</CardTitle>
                  </div>
                  <Badge 
                    variant={topic.difficulty === 'Beginner' ? 'default' : 
                            topic.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                  >
                    {topic.difficulty}
                  </Badge>
                </div>
                <CardDescription className="flex items-center mt-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{topic.time} min</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{topic.progressPercent}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className={`h-full ${topic.progressPercent > 0 ? 'bg-primary' : 'bg-gray-300'}`}
                      style={{ width: `${topic.progressPercent}%` }}
                    />
                  </div>
                </div>
                
                <div className="mt-auto">
                  <Button asChild className="w-full">
                    <Link to={`/topics/${topic.id}`}>
                      {topic.isCompleted ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          View Again
                        </>
                      ) : topic.progressPercent > 0 ? (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue Learning
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Start Learning
                        </>
                      )}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
