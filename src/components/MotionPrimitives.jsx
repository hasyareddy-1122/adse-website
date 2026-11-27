import { motion, useScroll, useSpring } from "framer-motion";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1];
const SMOOTH_SPRING = {
  type: "spring",
  stiffness: 340,
  damping: 28,
  mass: 0.85,
};
const TACTILE_SPRING = {
  type: "spring",
  stiffness: 440,
  damping: 26,
  mass: 0.75,
};

/**
 * Wraps each routed page for clean route transitions.
 */
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.36, ease: EASE_OUT_EXPO }}>
      {children}
    </motion.div>
  );
}

/**
 * Reveals sections smoothly as they scroll into view.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 24,
  scale = 0.985,
  once = true,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once, amount: "some" }}
      transition={{ duration: 0.55, delay, ease: EASE_OUT_EXPO }}>
      {children}
    </motion.div>
  );
}

/**
 * Container for staggered card grids (faculty, events, features, programs).
 */
export function StaggerGrid({ children, className, stagger = 0.055 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: "some" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: 0.03 },
        },
      }}>
      {children}
    </motion.div>
  );
}

/**
 * Individual card item inside a StaggerGrid with Pinterest-style spring lift & tap feedback.
 */
export function StaggerItem({ children, className }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.44, ease: EASE_OUT_EXPO },
        },
      }}
      whileHover={{
        y: -6,
        scale: 1.012,
        transition: SMOOTH_SPRING,
      }}
      whileTap={{ scale: 0.988, transition: TACTILE_SPRING }}>
      {children}
    </motion.div>
  );
}

/**
 * Standalone interactive card wrapper with tactile hover & press physics.
 */
export function InteractiveCard({ children, className, onClick, ...props }) {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      whileHover={{
        y: -6,
        scale: 1.01,
        transition: SMOOTH_SPRING,
      }}
      whileTap={{ scale: 0.985, transition: TACTILE_SPRING }}
      {...props}>
      {children}
    </motion.div>
  );
}

/**
 * Subtle tactile wrapper for buttons or action links.
 */
export function MotionButton({ children, className, ...props }) {
  return (
    <motion.div
      className={className}
      style={{ display: "inline-block" }}
      whileHover={{
        y: -2,
        scale: 1.02,
        transition: SMOOTH_SPRING,
      }}
      whileTap={{ scale: 0.96, transition: TACTILE_SPRING }}
      {...props}>
      {children}
    </motion.div>
  );
}

/**
 * Top reading/scroll progress bar for long pages.
 */
export function ScrollProgressBar({ color = "#0077cc", height = 3 }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{
        scaleX,
        transformOrigin: "0% 50%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height,
        backgroundColor: color,
        zIndex: 1050,
        pointerEvents: "none",
      }}
    />
  );
}
