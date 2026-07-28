import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Clock3, Play, Route, TimerReset } from "lucide-react";
import { Link } from "wouter";
import AppShell from "@/components/app-shell";
import CountUp from "@/components/count-up";
import Reveal from "@/components/reveal";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { progressApi, type User } from "@/lib/api";
import type { UserProgress } from "@shared/schema";

const learningPath = [
  { id: "stack", name: "Stack", group: "Structure", path: "/topics/stack", duration: 20 },
  { id: "queue", name: "Queue", group: "Structure", path: "/topics/queue", duration: 20 },
  { id: "linked-list", name: "Linked list", group: "Structure", path: "/topics/linked-list", duration: 30 },
  { id: "binary-tree", name: "Binary tree", group: "Structure", path: "/topics/binary-tree", duration: 45 },
  { id: "graph", name: "Graph", group: "Structure", path: "/topics/graph", duration: 60 },
  { id: "bubble-sort", name: "Bubble sort", group: "Algorithm", path: "/bubble-sort", duration: 25 },
  { id: "quick-sort", name: "Quick sort", group: "Algorithm", path: "/quick-sort", duration: 35 },
  { id: "bfs", name: "Breadth-first search", group: "Algorithm", path: "/bfs", duration: 35 },
  { id: "dfs", name: "Depth-first search", group: "Algorithm", path: "/dfs", duration: 35 },
  { id: "dijkstra", name: "Dijkstra", group: "Algorithm", path: "/dijkstra", duration: 50 },
];

export default function Home() {
  const { user } = useAuthJWT();
  const typedUser = user as User | null;
  const { data: progress = [], isLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    queryFn: progressApi.getUserProgress,
  });

  const progressByTopic = new Map(progress.map((item) => [item.topicId, item]));
  const completedCount = learningPath.filter(
    (topic) => progressByTopic.get(topic.id)?.completed,
  ).length;
  const totalTime = progress.reduce((sum, item) => sum + (item.timeSpent || 0), 0);
  const nextTopic =
    learningPath.find((topic) => !progressByTopic.get(topic.id)?.completed) ||
    learningPath[0];
  const activeProgress = progressByTopic.get(nextTopic.id);
  const percent = completedCount * 10;

  return (
    <AppShell>
      <div className="app-dashboard">
        <header className="app-dashboard-hero">
          <div>
            <span className="app-kicker">Your execution ledger</span>
            <h1>
              Keep going,
              <br />
              {typedUser?.firstName || "learner"}.
            </h1>
            <p>
              Return to the next unresolved structure, or jump directly to any
              point in the learning path.
            </p>
          </div>

          <div className="app-dashboard-progress" aria-label={`${percent}% complete`}>
            <span>Path resolved</span>
            <strong><CountUp value={percent} suffix="%" pad={2} /></strong>
            <div className="app-dashboard-progress-track">
              <i style={{ transform: `scaleX(${percent / 100})` }} />
            </div>
            <small>{completedCount} of {learningPath.length} topics complete</small>
            <div className="app-ambient-trace" aria-hidden="true"><i /></div>
            <div className="app-progress-caption"><span>10 topics</span><span>one visible state at a time</span></div>
          </div>
        </header>

        <Reveal>
        <section className="app-continue-band">
          <div className="app-continue-copy">
            <span className="app-kicker">Continue from here</span>
            <h2>{nextTopic.name}</h2>
            <p>
              {activeProgress?.timeSpent
                ? "Your previous state is recorded. Reopen the visualization and continue."
                : "Open the visualization, move the state, and connect each operation to the code."}
            </p>
          </div>
          <div className="app-continue-meta">
            <span><Clock3 aria-hidden="true" /> {nextTopic.duration} min</span>
            <span><Route aria-hidden="true" /> {nextTopic.group}</span>
          </div>
          <Link className="app-primary-command" href={nextTopic.path}>
            <Play aria-hidden="true" />
            Open {nextTopic.name}
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
        </Reveal>

        <Reveal className="app-dashboard-ledger">
          <div className="app-ledger-heading">
            <div>
              <span className="app-kicker">Full learning path</span>
              <h2>Every structure in sequence</h2>
            </div>
            <div className="app-ledger-totals">
              <span><Check aria-hidden="true" /> {completedCount} complete</span>
              <span><TimerReset aria-hidden="true" /> {Math.round(totalTime / 60)} min recorded</span>
            </div>
          </div>

          {isLoading ? (
            <div className="app-inline-state" role="status">Loading your learning path…</div>
          ) : (
            <ol className="app-learning-ledger">
              {learningPath.map((topic, index) => {
                const topicProgress = progressByTopic.get(topic.id);
                const completed = Boolean(topicProgress?.completed);
                const started = Boolean(topicProgress?.timeSpent);

                return (
                  <li key={topic.id}>
                    <Link href={topic.path}>
                      <span className="app-learning-ledger-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <strong>{topic.name}</strong>
                        <small>{topic.group}</small>
                      </div>
                      <span className="app-learning-ledger-time">
                        {topic.duration} min
                      </span>
                      <span
                        className={`app-learning-ledger-state ${
                          completed ? "is-complete" : started ? "is-active" : ""
                        }`}
                      >
                        {completed ? "Resolved" : started ? "In progress" : "Not started"}
                      </span>
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </Reveal>
      </div>
    </AppShell>
  );
}
