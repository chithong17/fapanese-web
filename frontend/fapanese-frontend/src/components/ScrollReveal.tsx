import React from "react";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
}

const ScrollReveal: React.FC<Props> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}   // ban đầu ẩn và hơi dịch xuống
      whileInView={{ opacity: 1, y: 0 }} // khi cuộn tới -> hiện
      viewport={{ once: true, amount: 0.2 }} // chỉ animation 1 lần, khi 20% element vào view
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
