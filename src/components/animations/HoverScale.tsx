import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface HoverScaleProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({
  children,
  scale = 1.02,
  className = "",
  ...props
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Lift effect on hover
export function HoverLift({
  children,
  lift = -4,
  className = "",
  ...props
}: HoverScaleProps & { lift?: number }) {
  return (
    <motion.div
      whileHover={{ y: lift, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
