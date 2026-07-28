import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(Boolean(reduceMotion));

  useEffect(() => {
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const fallback = window.setTimeout(() => setVisible(true), 2200);
    return () => window.clearTimeout(fallback);
  }, [reduceMotion]);

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={visible ? { opacity: 1, y: 0 } : undefined}
      onViewportEnter={() => setVisible(true)}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.58, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
