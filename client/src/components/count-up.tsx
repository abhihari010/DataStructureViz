import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type CountUpProps = {
  value: number;
  suffix?: string;
  pad?: number;
};

export default function CountUp({ value, suffix = "", pad = 0 }: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    const controls = animate(0, value, {
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [reduceMotion, value]);

  return (
    <>
      {String(displayValue).padStart(pad, "0")}
      {suffix}
    </>
  );
}
