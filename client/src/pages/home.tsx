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
} from "lucide-react";

export default function Home() {
  type User = { firstName?: string } | null;
  const { user } = useAuth() as { user: User };

  const { data: progress, isLoading: progressLoading } = useQuery<
    UserProgress[]
  >({
    queryKey: ["/api/progress"],
  });

  const completedTopics = progress?.filter((p) => p.completed).length || 0;
  const totalTopics = 25; 
  const completionPercentage = (completedTopics / totalTopics) * 100;

  const recentTopics = [
    { id: "stack", name: "Stack", status: "completed", difficulty: "Beginner" },
    { id: "queue", name: "Queue", status: "completed", difficulty: "Beginner" },
    {
      id: "linked-list",
      name: "Linked List",
      status: "in-progress",
      difficulty: "Beginner",
    },
    {
      id: "binary-tree",
      name: "Binary Tree",
      status: "not-started",
      difficulty: "Intermediate",
    },
  ];

  const recommendations = [
    {
      id: "stack",
      name: "Stack Data Structure",
      type: "Data Structure",
      time: "15 min",
    },
    {
      id: "bubble-sort",
      name: "Bubble Sort",
      type: "Algorithm",
      time: "20 min",
    },
    {
      id: "binary-search",
      name: "Binary Search",
      type: "Algorithm",
      time: "25 min",
    },
  ];

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
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Topics Completed
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTopics}</div>
                  <p className="text-xs text-muted-foreground">
                    out of {totalTopics} topics
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Study Time
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24h</div>
                  <p className="text-xs text-muted-foreground">
                    +2h from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Streak
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">days in a row</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Problems Solved
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">
                    across all topics
                  </p>
                </CardContent>
              </Card>
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
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Overall Progress
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(completionPercentage)}%
                        </span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Recent Topics</h4>
                      {recentTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                topic.status === "completed"
                                  ? "bg-green-500"
                                  : topic.status === "in-progress"
                                  ? "bg-yellow-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <Link href="/stack">
                              <span className="font-medium">{topic.name}</span>
                              <Badge variant="secondary" className="ml-2">
                                {topic.difficulty}
                              </Badge>
                            </Link>
                          </div>
                          <Badge
                            variant={
                              topic.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {topic.status === "completed"
                              ? "Completed"
                              : topic.status === "in-progress"
                              ? "In Progress"
                              : "Not Started"}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <Button asChild className="w-full">
                      <Link href="/stack">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Continue Learning
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
                    {recommendations.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.type}</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full mt-4">
                      View All Topics
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
