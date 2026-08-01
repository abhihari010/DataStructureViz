export type GuidedAlgorithmId = "linked-list-search" | "bubble-sort";

export type GuidedProblemId =
  | "guided-linked-list-search"
  | "guided-bubble-sort";

export type GuidedTraceStatus =
  | "initial"
  | "searching"
  | "found"
  | "comparing"
  | "swapped"
  | "pass-complete"
  | "complete";

export interface GuidedTraceRequest {
  readonly algorithmId: string;
  readonly problemId: string;
  readonly input: unknown;
}

export interface GuidedTraceOptions {
  /** Rendering preferences must not change the deterministic trace contract. */
  readonly reducedMotion?: boolean;
}

export interface LinkedListNodeSnapshot {
  readonly id: string;
  readonly value: number;
  readonly nextId: string | null;
}

export interface LinkedListTraceState {
  readonly structure: "linked-list";
  readonly status: GuidedTraceStatus;
  readonly nodes: readonly LinkedListNodeSnapshot[];
  readonly currentIndex: number | null;
  readonly visitedIndices: readonly number[];
  readonly target: number;
  readonly resultIndex: number | null;
}

export interface BubbleSortTraceState {
  readonly structure: "array";
  readonly status: GuidedTraceStatus;
  readonly values: readonly number[];
  readonly compareIndices: readonly number[] | null;
  readonly sortedIndices: readonly number[];
  readonly pass: number;
  readonly comparison: "less" | "equal" | "greater" | null;
}

export type GuidedTraceState = LinkedListTraceState | BubbleSortTraceState;

export type GuidedTraceFocus =
  | {
      readonly kind: "linked-list-node";
      readonly nodeId: string;
    }
  | {
      readonly kind: "array-indices";
      readonly indices: readonly number[];
    };

export interface GuidedTraceEvent {
  readonly stepId: string;
  readonly codeLine: number;
  readonly state: GuidedTraceState;
  readonly narration: string;
  readonly focus?: GuidedTraceFocus;
}

export interface GuidedTrace {
  readonly kind: "guided-trace";
  readonly algorithmId: GuidedAlgorithmId;
  readonly problemId: GuidedProblemId;
  readonly events: readonly GuidedTraceEvent[];
}

/** Freeze every nested value so callers cannot mutate an earlier step snapshot. */
export function freezeDeep<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      freezeDeep(child);
    }
  }
  return value;
}

export function freezeTrace(trace: GuidedTrace): GuidedTrace {
  return freezeDeep(trace);
}
