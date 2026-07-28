import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Waypoints } from "lucide-react";
import { Link } from "wouter";
import "@fontsource-variable/anybody";
import "@fontsource-variable/public-sans";
import "@/pages/auth.css";

type AuthStep = {
  label: string;
  detail: string;
};

type AuthLayoutProps = {
  activeStep: number;
  children: ReactNode;
  description: string;
  mode: "login" | "register";
  steps: AuthStep[];
  switchHref: string;
  switchLabel: string;
  switchPrompt: string;
  title: string;
};

const graphPositions = {
  login: [
    { x: 112, y: 120 },
    { x: 354, y: 274 },
    { x: 588, y: 120 },
  ],
  register: [
    { x: 92, y: 120 },
    { x: 250, y: 252 },
    { x: 414, y: 120 },
    { x: 560, y: 268 },
    { x: 676, y: 104 },
  ],
};

export function AuthLayout({
  activeStep,
  children,
  description,
  mode,
  steps,
  switchHref,
  switchLabel,
  switchPrompt,
  title,
}: AuthLayoutProps) {
  const reduceMotion = useReducedMotion();
  const positions = graphPositions[mode];

  return (
    <div className={`auth-page auth-page--${mode}`}>
      <a className="auth-skip-link" href="#auth-content">
        Skip to content
      </a>
      <header className="auth-nav">
        <Link href="/" className="auth-brand" aria-label="DSA Visualizer home">
          <span className="auth-brand-mark">
            <Waypoints aria-hidden="true" />
          </span>
          <span>DSA Visualizer</span>
        </Link>

        <div className="auth-switch">
          <span>{switchPrompt}</span>
          <Link href={switchHref}>
            {switchLabel}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="auth-main" id="auth-content" tabIndex={-1}>
        <section className="auth-scene" aria-labelledby={`${mode}-scene-title`}>
          <div className="auth-scene-copy">
            <span className="auth-scene-index">
              {mode === "login" ? "RETURN PATH" : "NEW PATH"}
            </span>
            <h2 id={`${mode}-scene-title`}>
              {mode === "login" ? (
                <>
                  Pick up where
                  <br />
                  you left off.
                </>
              ) : (
                <>
                  Build your
                  <br />
                  learning path.
                </>
              )}
            </h2>
            <p>
              {mode === "login"
                ? "Resolve two checks, then return to your visual workspace."
                : "Each field completes another link between you and the workspace."}
            </p>
          </div>

          <div className="auth-trace" aria-label={`Authentication progress: ${activeStep + 1} of ${steps.length}`}>
            <svg
              className="auth-trace-map"
              viewBox="0 0 768 360"
              role="img"
              aria-labelledby={`${mode}-trace-title ${mode}-trace-description`}
            >
              <title id={`${mode}-trace-title`}>Account access trace</title>
              <desc id={`${mode}-trace-description`}>
                A connected path advances as the account form is completed.
              </desc>

              <g className="auth-trace-grid" aria-hidden="true">
                {[72, 144, 216, 288].map((y) => (
                  <line key={`horizontal-${y}`} x1="0" x2="768" y1={y} y2={y} />
                ))}
                {[96, 192, 288, 384, 480, 576, 672].map((x) => (
                  <line key={`vertical-${x}`} x1={x} x2={x} y1="0" y2="360" />
                ))}
              </g>

              <g className="auth-trace-edges" aria-hidden="true">
                {positions.slice(0, -1).map((position, index) => {
                  const next = positions[index + 1];
                  const isResolved = index < activeStep;

                  return (
                    <g key={`${position.x}-${next.x}`}>
                      <line
                        className="auth-trace-edge-base"
                        x1={position.x}
                        x2={next.x}
                        y1={position.y}
                        y2={next.y}
                      />
                      <motion.line
                        className="auth-trace-edge-active"
                        x1={position.x}
                        x2={next.x}
                        y1={position.y}
                        y2={next.y}
                        initial={false}
                        animate={{ pathLength: isResolved ? 1 : 0 }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { duration: 0.52, ease: [0.23, 1, 0.32, 1] }
                        }
                      />
                    </g>
                  );
                })}
              </g>

              <g className="auth-trace-nodes">
                {positions.map((position, index) => {
                  const state =
                    index < activeStep
                      ? "is-complete"
                      : index === activeStep
                        ? "is-active"
                        : "";

                  return (
                    <g
                      key={`${mode}-${steps[index].label}`}
                      transform={`translate(${position.x} ${position.y})`}
                    >
                      <motion.g
                        className={state}
                        initial={false}
                        animate={{ scale: index === activeStep ? 1.08 : 1 }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 340, damping: 24 }
                        }
                      >
                        <circle className="auth-trace-node-ring" r="39" />
                        <circle className="auth-trace-node-core" r="27" />
                        <text textAnchor="middle" dominantBaseline="central">
                          {String(index + 1).padStart(2, "0")}
                        </text>
                      </motion.g>
                    </g>
                  );
                })}
              </g>
            </svg>

            <ol className="auth-trace-legend">
              {steps.map((step, index) => (
                <li
                  key={step.label}
                  className={
                    index < activeStep
                      ? "is-complete"
                      : index === activeStep
                        ? "is-active"
                        : ""
                  }
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.detail}</small>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Link href="/" className="auth-back-link">
            <ArrowLeft aria-hidden="true" />
            Back to the visualizer
          </Link>
        </section>

        <section className="auth-form-pane" aria-labelledby={`${mode}-form-title`}>
          <div className="auth-form-frame">
            <div className="auth-form-heading">
              <span>
                {mode === "login" ? "Account access" : "Account setup"}
              </span>
              <h1 id={`${mode}-form-title`}>{title}</h1>
              <p>{description}</p>
            </div>
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
