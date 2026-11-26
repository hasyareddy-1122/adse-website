import { motion, useScroll, useSpring } from "framer-motion";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1];
const TACTILE_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.8,
};

/**
 * Wraps each routed page for clean route transitions.
 */
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}>
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
  y = 22,
  scale = 1,
  once = true,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: scale === 1 ? 1 : scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once, amount: "some" }}
      transition={{ duration: 0.48, delay, ease: EASE_OUT_EXPO }}>
      {children}
    </motion.div>
  );
}

/**
 * Container for staggered card grids (faculty, events, features, programs).
 */
export function StaggerGrid({ children, className, stagger = 0.06 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: "some" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: 0.04 },
        },
      }}>
      {children}
    </motion.div>
  );
}

/**
 * Individual card item inside a StaggerGrid with hover lift & tap feedback.
 */
export function StaggerItem({ children, className }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: EASE_OUT_EXPO },
        },
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.18, ease: EASE_OUT_EXPO },
      }}
      whileTap={{ scale: 0.99, transition: TACTILE_SPRING }}>
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
        y: -1,
        transition: { duration: 0.15, ease: EASE_OUT_EXPO },
      }}
      whileTap={{ scale: 0.97, transition: TACTILE_SPRING }}
      {...props}>
      {children}
    </motion.div>
  );
}

/**
 * Optional top reading/scroll progress bar for long pages.
 */
export function ScrollProgressBar({ color = "#002147", height = 3 }) {
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
