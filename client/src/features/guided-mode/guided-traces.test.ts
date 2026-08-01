import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createGuidedTrace,
  UnsupportedGuidedAlgorithmError,
} from "./guided-traces";
import type { GuidedTraceRequest } from "./trace-types";

const linkedListRequest: GuidedTraceRequest = {
  algorithmId: "linked-list-search",
  problemId: "guided-linked-list-search",
  input: { values: [8, 17, 23], target: 17 },
};

const bubbleSortRequest: GuidedTraceRequest = {
  algorithmId: "bubble-sort",
  problemId: "guided-bubble-sort",
  input: { values: [3, 1, 2] },
};

function readSnapshot(name: string): unknown {
  return JSON.parse(
    readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), "utf8"),
  );
}

test("linked-list guided trace has stable boundaries and snapshot output", () => {
  const trace = createGuidedTrace(linkedListRequest);

  assert.equal(trace.kind, "guided-trace");
  assert.equal(trace.algorithmId, "linked-list-search");
  assert.equal(trace.problemId, "guided-linked-list-search");
  assert.equal(trace.events[0].state.status, "initial");
  assert.equal(trace.events.at(-1)?.state.status, "complete");
  assert.deepEqual(trace, readSnapshot("linked-list-search"));
});

test("bubble-sort guided trace has valid state and snapshot output", () => {
  const trace = createGuidedTrace(bubbleSortRequest);

  assert.equal(trace.events[0].state.status, "initial");
  assert.equal(trace.events.at(-1)?.state.status, "complete");
  assert.deepEqual(trace.events.at(-1)?.state.values, [1, 2, 3]);

  for (const event of trace.events) {
    assert.match(event.stepId, /^(linked-list-search|bubble-sort):step-\d+$/);
    assert.ok(Number.isInteger(event.codeLine) && event.codeLine > 0);
    assert.ok(event.narration.length > 0);
    assert.doesNotThrow(() => JSON.stringify(event));
  }

  assert.deepEqual(trace, readSnapshot("bubble-sort"));
});

test("trace snapshots are immutable and previous states remain unchanged", () => {
  const values = [3, 1, 2];
  const trace = createGuidedTrace({ ...bubbleSortRequest, input: { values } });
  const initialState = trace.events[0].state;
  const comparisonState = trace.events[1].state;

  assert.deepEqual(values, [3, 1, 2]);
  assert.notStrictEqual(initialState, comparisonState);
  assert.deepEqual(initialState.values, [3, 1, 2]);
  assert.equal(Object.isFrozen(trace), true);
  assert.equal(Object.isFrozen(trace.events[0]), true);
  assert.equal(Object.isFrozen(initialState), true);
  assert.equal(Object.isFrozen(initialState.values), true);
  assert.throws(() => {
    (initialState.values as number[]).push(99);
  }, TypeError);
  assert.deepEqual(initialState.values, [3, 1, 2]);
});

test("unsupported algorithms fail with an explicit guided-mode error", () => {
  assert.throws(
    () =>
      createGuidedTrace({
        algorithmId: "dijkstra",
        problemId: "problem-42",
        input: { values: [1, 2] },
      }),
    (error: unknown) =>
      error instanceof UnsupportedGuidedAlgorithmError &&
      error.algorithmId === "dijkstra" &&
      error.problemId === "problem-42",
  );
});

test("reduced motion changes no trace state or event order", () => {
  const animated = createGuidedTrace(bubbleSortRequest, {
    reducedMotion: false,
  });
  const reducedMotion = createGuidedTrace(bubbleSortRequest, {
    reducedMotion: true,
  });

  assert.deepEqual(
    reducedMotion.events.map(({ stepId }) => stepId),
    animated.events.map(({ stepId }) => stepId),
  );
  assert.deepEqual(reducedMotion.events, animated.events);
});
