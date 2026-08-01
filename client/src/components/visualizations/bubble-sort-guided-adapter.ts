import {
  freezeTrace,
  type BubbleSortTraceState,
  type GuidedTrace,
} from "@/features/guided-mode/trace-types";

export interface BubbleSortInput {
  readonly values: readonly number[];
}

function readInput(input: unknown): BubbleSortInput {
  if (
    typeof input !== "object" ||
    input === null ||
    !Array.isArray((input as { values?: unknown }).values) ||
    (input as { values: unknown[] }).values.some(
      (value) => !Number.isInteger(value),
    )
  ) {
    throw new TypeError("bubble-sort expects input { values: number[] }");
  }

  return { values: [...(input as BubbleSortInput).values] };
}

function makeEvent(
  step: number,
  codeLine: number,
  state: BubbleSortTraceState,
  narration: string,
  indices?: readonly number[],
) {
  return {
    stepId: `bubble-sort:step-${step}`,
    codeLine,
    state,
    narration,
    ...(indices
      ? { focus: { kind: "array-indices" as const, indices: [...indices] } }
      : {}),
  };
}

export function createBubbleSortTrace(input: unknown): GuidedTrace {
  const { values: inputValues } = readInput(input);
  const values = [...inputValues];
  const events: ReturnType<typeof makeEvent>[] = [];
  let step = 0;
  let sortedIndices: number[] = [];

  events.push(
    makeEvent(
      step++,
      1,
      {
        structure: "array",
        status: "initial",
        values: [...values],
        compareIndices: null,
        sortedIndices: [],
        pass: 0,
        comparison: null,
      },
      "Start at the beginning of the array and compare neighboring values.",
    ),
  );

  for (let pass = 0; pass < values.length - 1; pass += 1) {
    for (let index = 0; index < values.length - pass - 1; index += 1) {
      const indices = [index, index + 1];
      const comparison =
        values[index] < values[index + 1]
          ? "less"
          : values[index] > values[index + 1]
            ? "greater"
            : "equal";

      events.push(
        makeEvent(
          step++,
          4,
          {
            structure: "array",
            status: "comparing",
            values: [...values],
            compareIndices: [...indices],
            sortedIndices: [...sortedIndices],
            pass,
            comparison,
          },
          `Compare positions ${index} and ${index + 1}: the left value is ${comparison} than the right value.`,
          indices,
        ),
      );

      if (comparison === "greater") {
        [values[index], values[index + 1]] = [values[index + 1], values[index]];
        events.push(
          makeEvent(
            step++,
            5,
            {
              structure: "array",
              status: "swapped",
              values: [...values],
              compareIndices: [...indices],
              sortedIndices: [...sortedIndices],
              pass,
              comparison,
            },
            `Swap positions ${index} and ${index + 1} so the larger value moves right.`,
            indices,
          ),
        );
      }
    }

    sortedIndices = [...sortedIndices, values.length - pass - 1].sort(
      (left, right) => left - right,
    );
    events.push(
      makeEvent(
        step++,
        6,
        {
          structure: "array",
          status: "pass-complete",
          values: [...values],
          compareIndices: null,
          sortedIndices: [...sortedIndices],
          pass: pass + 1,
          comparison: null,
        },
        `Pass ${pass + 1} is complete; position ${values.length - pass - 1} is settled.`,
      ),
    );
  }

  events.push(
    makeEvent(
      step,
      8,
      {
        structure: "array",
        status: "complete",
        values: [...values],
        compareIndices: null,
        sortedIndices: values.map((_, index) => index),
        pass: Math.max(values.length - 1, 0),
        comparison: null,
      },
      "The array is sorted; the guided trace is complete.",
    ),
  );

  return freezeTrace({
    kind: "guided-trace",
    algorithmId: "bubble-sort",
    problemId: "guided-bubble-sort",
    events,
  });
}
