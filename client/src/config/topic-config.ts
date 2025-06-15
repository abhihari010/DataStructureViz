import { CheckCircle, List, Link as LinkIcon, Layers, GitBranch, GitMerge, GitPullRequest, Hash, Cpu, Network, GitCompare } from "lucide-react";

export interface TopicConcept {
  icon: any;
  title: string;
  description: string;
}

export interface NextStep {
  id: string;
  name: string;
  icon: any;
  path: string;
}

export interface TopicConfig {
  keyConcepts: TopicConcept[];
  nextSteps: NextStep[];
}

type TopicConfigs = {
  [key: string]: TopicConfig;
};

export const topicConfigs: TopicConfigs = {
  stack: {
    keyConcepts: [
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
    ],
    nextSteps: [
      { id: "queue", name: "Queue", icon: List, path: "/queue" },
      { id: "linked-list", name: "Linked List", icon: LinkIcon, path: "/linked-list" },
    ],
  },
  queue: {
    keyConcepts: [
      {
        icon: CheckCircle,
        title: "FIFO Principle",
        description: "First element added is first to be removed",
      },
      {
        icon: CheckCircle,
        title: "Enqueue & Dequeue",
        description: "Primary operations for adding and removing",
      },
      {
        icon: CheckCircle,
        title: "Front & Rear",
        description: "Track the front and rear of the queue",
      },
    ],
    nextSteps: [
      { id: "stack", name: "Stack", icon: Layers, path: "/stack" },
      { id: "deque", name: "Deque", icon: GitCompare, path: "/deque" },
    ],
  },
  'linked-list': {
    keyConcepts: [
      {
        icon: CheckCircle,
        title: "Node Structure",
        description: "Data and reference to next node",
      },
      {
        icon: CheckCircle,
        title: "Pointers",
        description: "Maintain head and tail pointers",
      },
      {
        icon: CheckCircle,
        title: "Traversal",
        description: "Iterate through nodes using next references",
      },
    ],
    nextSteps: [
      { id: "doubly-linked-list", name: "Doubly Linked List", icon: GitMerge, path: "/doubly-linked-list" },
      { id: "stack", name: "Stack", icon: Layers, path: "/stack" },
    ],
  },
  tree: {
    keyConcepts: [
      {
        icon: CheckCircle,
        title: "Hierarchy",
        description: "Nodes connected in a parent-child relationship",
      },
      {
        icon: CheckCircle,
        title: "Traversal",
        description: "In-order, pre-order, post-order, and level-order",
      },
      {
        icon: CheckCircle,
        title: "Binary Search",
        description: "Efficient searching in sorted trees",
      },
    ],
    nextSteps: [
      { id: "binary-search-tree", name: "BST", icon: GitBranch, path: "/binary-search-tree" },
      { id: "graph", name: "Graph", icon: Network, path: "/graph" },
    ],
  },
  graph: {
    keyConcepts: [
      {
        icon: CheckCircle,
        title: "Vertices & Edges",
        description: "Fundamental components of a graph",
      },
      {
        icon: CheckCircle,
        title: "Traversal",
        description: "BFS and DFS algorithms",
      },
      {
        icon: CheckCircle,
        title: "Weighted Graphs",
        description: "Graphs with weighted edges",
      },
    ],
    nextSteps: [
      { id: "dijkstra", name: "Dijkstra's", icon: Hash, path: "/dijkstra" },
      { id: "tree", name: "Tree", icon: GitBranch, path: "/tree" },
    ],
  },
  hash: {
    keyConcepts: [
      {
        icon: CheckCircle,
        title: "Key-Value Pairs",
        description: "Store and retrieve data using keys",
      },
      {
        icon: CheckCircle,
        title: "Hashing Function",
        description: "Maps keys to array indices",
      },
      {
        icon: CheckCircle,
        title: "Collision Resolution",
        description: "Handle multiple keys hashing to same index",
      },
    ],
    nextSteps: [
      { id: "hashmap", name: "Hash Map", icon: Cpu, path: "/hashmap" },
      { id: "bloom-filter", name: "Bloom Filter", icon: GitPullRequest, path: "/bloom-filter" },
    ],
  },
};

export const getTopicConfig = (topicId: string): TopicConfig => {
  return topicConfigs[topicId] || {
    keyConcepts: [
      {
        icon: CheckCircle,
        title: "Key Concept 1",
        description: "Description for key concept 1",
      },
      {
        icon: CheckCircle,
        title: "Key Concept 2",
        description: "Description for key concept 2",
      },
      {
        icon: CheckCircle,
        title: "Key Concept 3",
        description: "Description for key concept 3",
      },
    ],
    nextSteps: [
      { id: "stack", name: "Stack", icon: Layers, path: "/stack" },
      { id: "queue", name: "Queue", icon: List, path: "/queue" },
    ],
  };
};
