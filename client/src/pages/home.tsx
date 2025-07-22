import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { UserProgress } from "@shared/schema";
import {
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Code2,
  Trophy,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  Clock as ClockIcon,
  Circle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Define topic metadata with difficulty levels and estimated times
const TOPICS = [
  { id: "linked-list", name: "Linked List", difficulty: "Beginner", time: 30 },
  { id: "stack", name: "Stack", difficulty: "Beginner", time: 20 },
  { id: "queue", name: "Queue", difficulty: "Beginner", time: 20 },
  { id: "binary-tree", name: "Binary Tree", difficulty: "Intermediate", time: 45 },
  { id: "graph", name: "Graph", difficulty: "Advanced", time: 60 },
  { id: "hash-table", name: "Hash Table", difficulty: "Intermediate", time: 25 },
  { id: "heap", name: "Heap", difficulty: "Intermediate", time: 30 }
];

// Calculate total estimated time for all topics
const TOTAL_ESTIMATED_TIME = TOPICS.reduce((sum, topic) => sum + topic.time, 0);

export default function Home() {
  type User = { firstName?: string } | null;
  const { user } = useAuth() as { user: User };

  const { data: progress = [], isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  // Calculate progress metrics
  const completedTopics = progress.filter(p => p.completed).length;
  const inProgressTopics = progress.filter(p => !p.completed && (p.timeSpent || 0) > 0).length;
  const notStartedTopics = TOPICS.length - completedTopics - inProgressTopics;
  
  const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  const totalScore = progress.reduce((sum, p) => sum + (p.score || 0), 0);
  
  const completionPercentage = Math.round((completedTopics / TOPICS.length) * 100);
  const timeSpentHours = Math.floor(totalTimeSpent / 3600);
  const timeSpentMinutes = Math.floor((totalTimeSpent % 3600) / 60);
  
  // Get recent topics (completed or in progress), sorted by most recent activity
  const recentTopics = [...progress]
    .sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 4) // Show 4 most recent
    .map(p => {
      const topic = TOPICS.find(t => t.id === p.topicId) || { 
        name: p.topicId, 
        difficulty: "Unknown",
        time: 0
      };
      const updatedAt = p.updatedAt ? (typeof p.updatedAt === 'string' ? p.updatedAt : p.updatedAt.toISOString()) : new Date().toISOString();
      
      return {
        id: p.id,
        name: topic.name,
        difficulty: topic.difficulty,
        status: p.completed ? "completed" as const : ((p.timeSpent || 0) > 0 ? "in-progress" as const : "not-started" as const),
        updatedAt,
        topicId: p.topicId,
        completed: !!p.completed,
        score: p.score || 0,
        timeSpent: p.timeSpent || 0
      };
    }) as Array<{
      id: number;
      name: string;
      difficulty: string;
      status: 'completed' | 'in-progress' | 'not-started';
      updatedAt: string;
      topicId: string;
      completed: boolean;
      score: number;
      timeSpent: number;
    }>;

  // Get recommendations (not started topics or topics with lowest scores)
  const recommendations = TOPICS
    .filter(topic => !progress.some(p => p.topicId === topic.id && p.completed))
    .sort((a, b) => {
      const progressA = progress.find(p => p.topicId === a.id);
      const progressB = progress.find(p => p.topicId === b.id);
      const scoreA = progressA?.score || 0;
      const scoreB = progressB?.score || 0;
      return scoreA - scoreB; // Sort by lowest score first
    })
    .slice(0, 3) // Show top 3 recommendations
    .map(topic => ({
      id: topic.id,
      name: topic.name,
      type: topic.difficulty,
      time: `${topic.time} min`,
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName || "Learner"}!
              </h1>
              <p className="text-gray-600">
                Continue your DSA journey and track your progress toward
                mastery.
              </p>
              <div className="mt-4">
                <Button asChild size="lg" className="text-lg">
                  <Link href="/practice">Go to Practice Page</Link>
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {progressLoading ? (
                // Loading state for stats
                Array(4).fill(0).map((_, i) => (
                  <Card key={`stat-loading-${i}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-6 w-16 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        Completion
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {completedTopics}/{TOPICS.length}
                        <span className="text-sm text-gray-500 ml-2">
                          ({completionPercentage}%)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {inProgressTopics > 0 && `${inProgressTopics} in progress • `}
                        {notStartedTopics} not started
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        Time Spent
                      </CardTitle>
                      <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {timeSpentHours > 0 ? `${timeSpentHours}h ` : ''}
                        {timeSpentMinutes}m
                      </div>
                      <p className="text-xs text-gray-500">
                        {Math.round((totalTimeSpent / 3600 / TOTAL_ESTIMATED_TIME) * 100)}% of estimated {Math.ceil(TOTAL_ESTIMATED_TIME / 60)}h
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        Mastery Score
                      </CardTitle>
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalScore} pts</div>
                      <p className="text-xs text-gray-500">
                        {completedTopics > 0 
                          ? `Avg ${Math.round(totalScore / completedTopics)}/100 per topic` 
                          : 'Complete a topic to earn points'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        Next Milestone
                      </CardTitle>
                      <Target className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {completedTopics + 1 <= TOPICS.length 
                          ? TOPICS[completedTopics]?.name || 'All done!'
                          : 'All topics completed!'}
                      </div>
                      <p className="text-xs text-gray-500">
                        {completedTopics < TOPICS.length 
                          ? `Complete ${TOPICS[completedTopics]?.name} to continue`
                          : 'Congratulations!'}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Progress Overview */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Learning Progress</span>
                    </CardTitle>
                    <CardDescription>
                      Your journey through data structures and algorithms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {progressLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          {[1, 2, 3].map((i) => (
                            <div key={`progress-stat-${i}`} className="text-center">
                              <Skeleton className="h-8 w-12 mx-auto mb-1" />
                              <Skeleton className="h-3 w-16 mx-auto" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Overall Progress</span>
                            <span>{completionPercentage}%</span>
                          </div>

                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div 
                              className={`h-full ${completionPercentage > 0 ? 'bg-primary' : 'bg-gray-300'}`}
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold">{completedTopics}</div>
                            <div className="text-xs text-gray-500">Completed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              {inProgressTopics}
                            </div>
                            <div className="text-xs text-gray-500">In Progress</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              {notStartedTopics}
                            </div>
                            <div className="text-xs text-gray-500">Not Started</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button asChild className="w-full mt-4">
                      <Link href="/topics">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Browse All Topics
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code2 className="h-5 w-5" />
                      <span>Recommended</span>
                    </CardTitle>
                    <CardDescription>Based on your progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {progressLoading ? (
                      [1, 2, 3].map((i) => (
                        <div key={`rec-loading-${i}`} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                        </div>
                      ))
                    ) : recommendations.length > 0 ? (
                      recommendations.map((item) => (
                        <Link 
                          key={item.id} 
                          href={`/topics/${item.id}`}
                          className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{item.type}</span>
                            <span>{item.time}</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                        <p className="text-sm text-gray-500">
                          You've completed all available topics!
                        </p>
                      </div>
                    )}

                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link href="/topics">
                        View All Topics
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
