import { useRef, useState, type CSSProperties } from "react";
import { Helmet } from "react-helmet";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDownRight, ArrowRight, Play, Waypoints } from "lucide-react";
import { Link } from "wouter";
import "@fontsource-variable/anybody";
import "@fontsource-variable/public-sans";
import typesetterImage from "@/assets/typesetter-algorithm.webp";
import "./landing.css";

const traversalNodes = [
  { id: "A", value: 8, x: 442, y: 112, delay: "0s" },
  { id: "B", value: 3, x: 244, y: 270, delay: "0.7s" },
  { id: "C", value: 10, x: 646, y: 270, delay: "1.4s" },
  { id: "D", value: 1, x: 135, y: 468, delay: "2.1s" },
  { id: "E", value: 6, x: 348, y: 468, delay: "2.8s" },
  { id: "F", value: 14, x: 747, y: 468, delay: "3.5s" },
  { id: "G", value: 4, x: 287, y: 648, delay: "4.2s" },
  { id: "H", value: 7, x: 421, y: 648, delay: "4.9s" },
  { id: "I", value: 13, x: 680, y: 648, delay: "5.6s" },
];

const traversalEdges = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["B", "E"],
  ["C", "F"],
  ["E", "G"],
  ["E", "H"],
  ["F", "I"],
];

const traceSteps = [
  {
    verb: "Queue",
    title: "Begin with what is known.",
    body: "The start node enters the queue. Every next move now has a visible reason.",
  },
  {
    verb: "Visit",
    title: "Take the nearest candidate.",
    body: "The active node moves to the front while its neighbors become possible routes.",
  },
  {
    verb: "Relax",
    title: "Replace the expensive path.",
    body: "A shorter distance wins. The edge changes state and the table updates with it.",
  },
  {
    verb: "Repeat",
    title: "Watch the answer emerge.",
    body: "The final path is not a reveal. It is the accumulated result of every prior decision.",
  },
];

const graphNodes = [
  { id: "A", x: 120, y: 210 },
  { id: "B", x: 300, y: 100 },
  { id: "C", x: 315, y: 320 },
  { id: "D", x: 520, y: 110 },
  { id: "E", x: 535, y: 315 },
  { id: "F", x: 730, y: 210 },
];

const graphEdges = [
  { from: "A", to: "B", weight: 4, activeAt: 0 },
  { from: "A", to: "C", weight: 2, activeAt: 0 },
  { from: "B", to: "D", weight: 5, activeAt: 1 },
  { from: "C", to: "D", weight: 1, activeAt: 1 },
  { from: "C", to: "E", weight: 7, activeAt: 2 },
  { from: "D", to: "F", weight: 3, activeAt: 2 },
  { from: "E", to: "F", weight: 2, activeAt: 3 },
];

const topicRows = [
  {
    name: "Sorting",
    note: "Compare, swap, settle.",
    values: [62, 28, 84, 43, 70, 35],
  },
  {
    name: "Graphs",
    note: "Traverse every relationship.",
    values: [30, 74, 44, 88, 56, 38],
  },
  {
    name: "Trees",
    note: "Follow structure through depth.",
    values: [82, 54, 34, 68, 28, 46],
  },
  {
    name: "Linear structures",
    note: "Push, pop, enqueue, remove.",
    values: [36, 48, 60, 72, 84, 96],
  },
];

function HeroTraversal() {
  const nodeMap = new Map(traversalNodes.map((node) => [node.id, node]));

  return (
    <div className="landing-hero-visual" aria-label="Animated binary tree traversal">
      <svg
        className="landing-tree"
        viewBox="0 0 880 760"
        role="img"
        aria-labelledby="hero-tree-title hero-tree-description"
      >
        <title id="hero-tree-title">Binary search tree traversal</title>
        <desc id="hero-tree-description">
          A binary search tree highlights one node at a time to show traversal order.
        </desc>
        <g className="landing-tree-edges">
          {traversalEdges.map(([from, to], index) => {
            const start = nodeMap.get(from)!;
            const end = nodeMap.get(to)!;
            return (
              <line
                key={`${from}-${to}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                pathLength="1"
                style={{ animationDelay: `${index * 0.11}s` }}
              />
            );
          })}
        </g>
        <g>
          {traversalNodes.map((node, index) => (
            <g
              key={node.id}
              className="landing-tree-node"
              transform={`translate(${node.x} ${node.y})`}
              style={
                {
                  "--node-delay": node.delay,
                  "--enter-delay": `${0.12 + index * 0.07}s`,
                } as CSSProperties
              }
            >
              <circle className="landing-node-ring" r="48" />
              <circle className="landing-node-core" r="36" />
              <text textAnchor="middle" dominantBaseline="central">
                {node.value}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <div className="landing-trace-readout" aria-hidden="true">
        <span>in-order</span>
        <strong>1 3 4 6 7 8 10 13 14</strong>
      </div>
    </div>
  );
}

function ScrollTrace() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const routeProgress = useTransform(scrollYProgress, [0.08, 0.9], [0, 1]);
  const graphScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.96]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (reduceMotion) return;
    const nextStep = Math.min(traceSteps.length - 1, Math.floor(latest * 4));
    setCurrentStep((previous) => (previous === nextStep ? previous : nextStep));
  });

  const displayedStep = reduceMotion ? traceSteps.length - 1 : currentStep;
  const nodeMap = new Map(graphNodes.map((node) => [node.id, node]));

  return (
    <section ref={sectionRef} id="trace" className="landing-trace-section">
      <div className="landing-trace-sticky">
        <div className="landing-trace-copy" aria-live="polite">
          <span className="landing-kicker">Dijkstra, one decision at a time</span>
          <div className="landing-trace-step">
            <span className="landing-trace-verb">
              {traceSteps[displayedStep].verb}
            </span>
            <h2>{traceSteps[displayedStep].title}</h2>
            <p>{traceSteps[displayedStep].body}</p>
          </div>
          <div className="landing-step-index" aria-label={`Step ${displayedStep + 1} of 4`}>
            {traceSteps.map((step, index) => (
              <span
                key={step.verb}
                className={index <= displayedStep ? "is-active" : ""}
              />
            ))}
          </div>
        </div>

        <motion.div
          className="landing-route-board"
          style={reduceMotion ? undefined : { scale: graphScale }}
        >
          <svg viewBox="0 0 850 430" role="img" aria-labelledby="route-title route-desc">
            <title id="route-title">Shortest path trace</title>
            <desc id="route-desc">
              A weighted graph progressively highlights the shortest route from A to F.
            </desc>
            <g className="landing-route-edges">
              {graphEdges.map((edge) => {
                const start = nodeMap.get(edge.from)!;
                const end = nodeMap.get(edge.to)!;
                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <line
                      className={edge.activeAt <= displayedStep ? "is-active" : ""}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                    />
                    <text
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 - 10}
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}
              {!reduceMotion && (
                <motion.path
                  className="landing-route-progress"
                  d="M120 210 L315 320 L520 110 L730 210"
                  style={{ pathLength: routeProgress }}
                />
              )}
            </g>
            <g className="landing-route-nodes">
              {graphNodes.map((node, index) => (
                <g
                  key={node.id}
                  className={index <= displayedStep + 1 ? "is-active" : ""}
                  transform={`translate(${node.x} ${node.y})`}
                >
                  <circle r="36" />
                  <text textAnchor="middle" dominantBaseline="central">
                    {node.id}
                  </text>
                </g>
              ))}
            </g>
          </svg>
          <div className="landing-distance-table">
            {["A 0", "C 2", "D 3", "F 6"].map((value, index) => (
              <span key={value} className={index <= displayedStep ? "is-active" : ""}>
                {value}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MaterialReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.04]);
  const imageClip = useTransform(
    scrollYProgress,
    [0.05, 0.45],
    ["inset(8% 8% 8% 8%)", "inset(0% 0% 0% 0%)"],
  );

  return (
    <section ref={sectionRef} className="landing-material">
      <motion.img
        src={typesetterImage}
        alt="Metal type tiles arranged as a binary tree and sorting sequence"
        style={reduceMotion ? undefined : { scale: imageScale, clipPath: imageClip }}
      />
      <div className="landing-material-copy">
        <p>Structure is easier to remember when it behaves like a real thing.</p>
        <h2>Move it.<br />Trace it.<br />Understand it.</h2>
      </div>
    </section>
  );
}

function TopicRow({
  name,
  note,
  values,
  index,
}: {
  name: string;
  note: string;
  values: number[];
  index: number;
}) {
  return (
    <Link
      href="/login"
      className="landing-topic-row"
      aria-label={`Start learning ${name}`}
    >
      <div className="landing-topic-copy">
        <span>{name}</span>
        <p>{note}</p>
      </div>
      <div className={`landing-topic-visual landing-topic-visual-${index}`} aria-hidden="true">
        {values.map((value, valueIndex) => (
          <i
            key={`${name}-${value}`}
            style={
              {
                "--bar-height": `${value}%`,
                "--bar-delay": `${valueIndex * 0.12}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <ArrowDownRight aria-hidden="true" />
    </Link>
  );
}

function CodeSync() {
  const values = [42, 17, 8, 31, 23, 12];

  return (
    <section className="landing-code-sync">
      <div className="landing-code-intro">
        <h2>The code and the state should never tell separate stories.</h2>
        <p>
          Every highlighted line has a visible consequence. Pause, step, and inspect
          the exact moment the structure changes.
        </p>
      </div>
      <div className="landing-code-stage">
        <div className="landing-code-block" aria-label="Bubble sort code example">
          <span>for (let i = 0; i &lt; n; i++) {"{"}</span>
          <span className="is-running">{"  "}if (a[j] &gt; a[j + 1]) {"{"}</span>
          <span>{"    "}swap(a, j, j + 1);</span>
          <span>{"  "}{"}"}</span>
          <span>{"}"}</span>
        </div>
        <div className="landing-sort-stage" aria-label="Animated sorting values">
          {values.map((value, index) => (
            <div
              key={value}
              className="landing-sort-value"
              style={{ "--sort-index": index } as CSSProperties}
            >
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="landing-page">
      <Helmet>
        <title>DSA Visualizer | See algorithms execute</title>
        <meta
          name="description"
          content="Learn data structures and algorithms by watching every operation, route, and state change as it happens."
        />
      </Helmet>

      <a className="landing-skip-link" href="#landing-content">
        Skip to content
      </a>

      <span
        hidden
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html:
            "<!-- THESIS: The algorithm is the image; this refuses the generic SaaS card stack. OWN-WORLD: Warm near-black, graphite-green work surfaces, pale type, signal orange, and live execution traces. STORY: See a structure, follow its decisions, then start learning. FIRST VIEWPORT: Left-aligned offer and CTA beside a full-height traversing tree, with the topic index peeking below. FORM: Night-lab execution ledger, staged as a living map of connected units; seed 94b54ea3. -->",
        }}
      />

      <header className="landing-nav">
        <a href="/" className="landing-brand" aria-label="DSA Visualizer home">
          <span className="landing-brand-mark"><Waypoints /></span>
          <span>DSA Visualizer</span>
        </a>
        <nav aria-label="Landing page navigation">
          <a href="#trace">How it works</a>
          <a href="#topics">Topics</a>
        </nav>
        <Link href="/login" className="landing-nav-action">
          Sign in <ArrowRight aria-hidden="true" />
        </Link>
      </header>

      <main id="landing-content" tabIndex={-1}>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">Interactive algorithm lab / 01</span>
            <h1>See what the code is doing.</h1>
            <p>
              Follow every comparison, visit, and state change until the algorithm
              makes sense.
            </p>
            <div className="landing-hero-actions">
              <Link href="/login" className="landing-primary-action">
                Start learning <ArrowRight aria-hidden="true" />
              </Link>
              <a href="#trace" className="landing-secondary-action">
                <Play aria-hidden="true" /> Watch the trace
              </a>
            </div>
          </div>
          <HeroTraversal />
        </section>

        <div className="landing-topic-ticker" aria-label="Available data structure and algorithm topics">
          <div>
            <span>Stack</span>
            <span>Queue</span>
            <span>Linked list</span>
            <span>Binary tree</span>
            <span>Graphs</span>
            <span>Bubble sort</span>
            <span>Quick sort</span>
            <span>BFS</span>
            <span>DFS</span>
            <span>Dijkstra</span>
          </div>
        </div>

        <ScrollTrace />
        <MaterialReveal />

        <section id="topics" className="landing-topics">
          <div className="landing-topics-heading">
            <h2>Pick a structure.<br />Break it open.</h2>
            <p>
              Learn the operation, inspect each state, then practice it in code.
            </p>
          </div>
          <div className="landing-topic-list">
            {topicRows.map((topic, index) => (
              <TopicRow key={topic.name} {...topic} index={index} />
            ))}
          </div>
        </section>

        <CodeSync />

        <section className="landing-final-cta">
          <div className="landing-final-orbit" aria-hidden="true">
            <span>8</span>
            <span>3</span>
            <span>10</span>
            <span>1</span>
          </div>
          <div>
            <h2>Stop memorizing.<br />Start seeing.</h2>
            <Link href="/login" className="landing-primary-action">
              Start learning <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <a href="/" className="landing-brand" aria-label="DSA Visualizer home">
          <span className="landing-brand-mark"><Waypoints /></span>
          <span>DSA Visualizer</span>
        </a>
        <p>Interactive learning for data structures and algorithms.</p>
        <span>Built for the moment it clicks.</span>
      </footer>
    </div>
  );
}
