import { createBubbleSortTrace } from "@/components/visualizations/bubble-sort-guided-adapter";
import { createLinkedListSearchTrace } from "@/components/visualizations/linked-list-guided-adapter";
import type {
  GuidedTrace,
  GuidedTraceOptions,
  GuidedTraceRequest,
} from "./trace-types";

export class UnsupportedGuidedAlgorithmError extends Error {
  constructor(
    readonly algorithmId: string,
    readonly problemId: string,
  ) {
    super(
      `No deterministic guided trace is registered for algorithm '${algorithmId}' and problem '${problemId}'.`,
    );
    this.name = "UnsupportedGuidedAlgorithmError";
  }
}

export function createGuidedTrace(
  request: GuidedTraceRequest,
  options: GuidedTraceOptions = {},
): GuidedTrace {
  // Reduced motion belongs to rendering. Trace generation is always ordered data.
  void options;

  if (
    request.algorithmId === "linked-list-search" &&
    request.problemId === "guided-linked-list-search"
  ) {
    return createLinkedListSearchTrace(request.input);
  }

  if (
    request.algorithmId === "bubble-sort" &&
    request.problemId === "guided-bubble-sort"
  ) {
    return createBubbleSortTrace(request.input);
  }

  throw new UnsupportedGuidedAlgorithmError(
    request.algorithmId,
    request.problemId,
  );
}

export type {
  BubbleSortTraceState,
  GuidedAlgorithmId,
  GuidedProblemId,
  GuidedTrace,
  GuidedTraceEvent,
  GuidedTraceFocus,
  GuidedTraceOptions,
  GuidedTraceRequest,
  GuidedTraceState,
  LinkedListNodeSnapshot,
  LinkedListTraceState,
} from "./trace-types";
