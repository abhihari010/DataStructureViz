import { useEffect, useMemo, useState } from "react";
import type { GuidedTrace } from "./trace-types";

type GuidedTracePlayerProps = {
  trace: GuidedTrace;
};

function describeState(trace: GuidedTrace, index: number): string {
  const event = trace.events[index];
  const state = event.state;
  if (state.structure === "linked-list") {
    return `Target ${state.target}; visited ${state.visitedIndices.length} node${state.visitedIndices.length === 1 ? "" : "s"}.`;
  }
  const compared = state.compareIndices?.join(" and ") || "none";
  return `Comparing ${compared}; ${state.sortedIndices.length} position${state.sortedIndices.length === 1 ? "" : "s"} settled.`;
}

export default function GuidedTracePlayer({ trace }: GuidedTracePlayerProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const event = trace.events[index];
  const progress = useMemo(
    () => `${index + 1} of ${trace.events.length}`,
    [index, trace.events.length],
  );

  useEffect(() => {
    if (!playing) return;
    if (index >= trace.events.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(
      () => setIndex((current) => Math.min(current + 1, trace.events.length - 1)),
      reducedMotion ? 0 : 850,
    );
    return () => window.clearTimeout(timer);
  }, [index, playing, reducedMotion, trace.events.length]);

  return (
    <section className="guided-trace-player" aria-labelledby="guided-trace-title">
      <div className="guided-trace-player__header">
        <div>
          <span className="app-kicker">Guided execution</span>
          <h1 id="guided-trace-title">Inspect every consequence.</h1>
        </div>
        <span aria-live="polite">Step {progress}</span>
      </div>

      <div className="guided-trace-player__layout">
        <div className="guided-trace-player__state" aria-live="polite">
          <strong>{event.state.status.replaceAll("-", " ")}</strong>
          <p>{describeState(trace, index)}</p>
          {event.state.structure === "linked-list" ? (
            <ol aria-label="Linked list state">
              {event.state.nodes.map((node, nodeIndex) => (
                <li key={node.id} data-active={nodeIndex === (event.state.structure === "linked-list" ? event.state.currentIndex : null)}>
                  {node.value}
                </li>
              ))}
            </ol>
          ) : (
            <ol aria-label="Array state">
              {event.state.values.map((value, valueIndex) => (
                <li key={`${value}-${valueIndex}`} data-active={event.state.structure === "array" ? event.state.compareIndices?.includes(valueIndex) : false}>
                  {value}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="guided-trace-player__explanation">
          <p className="guided-trace-player__narration" aria-live="polite">{event.narration}</p>
          <p className="guided-trace-player__code" aria-label={`Highlighted code line ${event.codeLine}`}>
            <span>{String(event.codeLine).padStart(2, "0")}</span> inspect the highlighted operation
          </p>
        </div>
      </div>

      <div className="guided-trace-player__controls" aria-label="Guided trace controls">
        <button type="button" onClick={() => setIndex(0)}>Restart</button>
        <button type="button" onClick={() => setIndex((current) => Math.max(0, current - 1))} disabled={index === 0}>Previous</button>
        <button type="button" onClick={() => setPlaying((current) => !current)} aria-pressed={playing}>
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={() => setIndex((current) => Math.min(trace.events.length - 1, current + 1))} disabled={index === trace.events.length - 1}>Next</button>
        <label>
          <input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} />
          Reduced motion
        </label>
      </div>
    </section>
  );
}
