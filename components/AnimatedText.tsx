"use client";

import { motion } from "framer-motion";
import { Children, ReactNode, memo } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
};

export const AnimatedText = memo(function AnimatedText({ children, delay = 0 }: Props) {
  const items = Children.toArray(children);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.12,
            delayChildren: delay,
          },
        },
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
});