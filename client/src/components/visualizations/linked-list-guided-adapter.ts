import {
  freezeTrace,
  type GuidedTrace,
  type LinkedListTraceState,
} from "@/features/guided-mode/trace-types";

export interface LinkedListSearchInput {
  readonly values: readonly number[];
  readonly target: number;
}

function readInput(input: unknown): LinkedListSearchInput {
  if (
    typeof input !== "object" ||
    input === null ||
    !Array.isArray((input as { values?: unknown }).values) ||
    typeof (input as { target?: unknown }).target !== "number"
  ) {
    throw new TypeError(
      "linked-list-search expects input { values: number[], target: number }",
    );
  }

  const { values, target } = input as LinkedListSearchInput;
  if (
    !Number.isInteger(target) ||
    values.some((value) => !Number.isInteger(value))
  ) {
    throw new TypeError(
      "linked-list-search expects integer values and an integer target",
    );
  }

  return { values: [...values], target };
}

function makeNodes(values: readonly number[]) {
  return values.map((value, index) => ({
    id: `node-${index}`,
    value,
    nextId: index < values.length - 1 ? `node-${index + 1}` : null,
  }));
}

function makeEvent(
  step: number,
  codeLine: number,
  state: LinkedListTraceState,
  narration: string,
  nodeId?: string,
) {
  return {
    stepId: `linked-list-search:step-${step}`,
    codeLine,
    state,
    narration,
    ...(nodeId
      ? { focus: { kind: "linked-list-node" as const, nodeId } }
      : {}),
  };
}

export function createLinkedListSearchTrace(input: unknown): GuidedTrace {
  const { values, target } = readInput(input);
  const nodes = makeNodes(values);
  const events: ReturnType<typeof makeEvent>[] = [];
  let step = 0;

  events.push(
    makeEvent(
      step++,
      1,
      {
        structure: "linked-list",
        status: "initial",
        nodes,
        currentIndex: null,
        visitedIndices: [],
        target,
        resultIndex: null,
      },
      `Start at the head and search for ${target}.`,
    ),
  );

  let foundIndex: number | null = null;
  for (let index = 0; index < values.length; index += 1) {
    const visitedIndices = Array.from({ length: index + 1 }, (_, item) => item);
    const nodeId = nodes[index].id;
    const matches = values[index] === target;

    events.push(
      makeEvent(
        step++,
        3,
        {
          structure: "linked-list",
          status: "searching",
          nodes,
          currentIndex: index,
          visitedIndices,
          target,
          resultIndex: null,
        },
        `Inspect node ${index + 1}: ${values[index]} ${matches ? "matches" : "does not match"} ${target}.`,
        nodeId,
      ),
    );

    if (matches) {
      foundIndex = index;
      events.push(
        makeEvent(
          step++,
          4,
          {
            structure: "linked-list",
            status: "found",
            nodes,
            currentIndex: index,
            visitedIndices,
            target,
            resultIndex: index,
          },
          `The target is found at node ${index + 1}.`,
          nodeId,
        ),
      );
      break;
    }
  }

  events.push(
    makeEvent(
      step,
      6,
      {
        structure: "linked-list",
        status: "complete",
        nodes,
        currentIndex: null,
        visitedIndices:
          foundIndex === null
            ? values.map((_, index) => index)
            : Array.from({ length: foundIndex + 1 }, (_, index) => index),
        target,
        resultIndex: foundIndex,
      },
      foundIndex === null
        ? `The search is complete; ${target} is not in the list.`
        : "The guided search is complete.",
    ),
  );

  return freezeTrace({
    kind: "guided-trace",
    algorithmId: "linked-list-search",
    problemId: "guided-linked-list-search",
    events,
  });
}
