import { motion } from "framer-motion";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1];

/**
 * Wraps each routed page for clean route transitions.
 */
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}>
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
  once = true,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT_EXPO }}>
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
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger },
        },
      }}>
      {children}
    </motion.div>
  );
}

/**
 * Individual card item inside a StaggerGrid.
 */
export function StaggerItem({ children, className }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.42, ease: EASE_OUT_EXPO },
        },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      {children}
    </motion.div>
  );
}
