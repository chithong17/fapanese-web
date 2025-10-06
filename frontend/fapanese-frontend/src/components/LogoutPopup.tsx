import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { MdLogout } from "react-icons/md";

interface LogoutPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const popupVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: -100 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.8, y: -100, transition: { duration: 0.2 } },
};

const iconVariants: Variants = {
  hidden: { scale: 0, rotate: -45, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 25 },
  },
  hover: {
    scale: 1.2,
    rotate: [0, 15, -15, 0],
    transition: { repeat: Infinity, duration: 1.5 },
  },
};

const LogoutPopup: React.FC<LogoutPopupProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-2xl w-[90%] max-w-sm text-center relative"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Icon điểm nhấn */}
            <motion.div
              className="flex justify-center mb-4 relative"
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <div className="bg-red-100 rounded-full p-4 text-red-600 text-3xl shadow-lg shadow-red-200">
                <MdLogout />
              </div>
              {/* Glow xung quanh icon */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-red-200/40 -translate-x-1/2 -translate-y-1/2"
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 0.2, 0.6] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">Xác nhận đăng xuất</h2>
            <p className="mb-6 text-gray-600">
              Bạn có chắc chắn muốn đăng xuất không?
            </p>

            <div className="flex justify-center gap-4">
              <motion.button
                onClick={onConfirm}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(239,68,68,0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-full font-semibold shadow-lg transition"
              >
                <MdLogout /> Đăng Xuất
              </motion.button>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(107,114,128,0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-full font-semibold shadow transition"
              >
                Hủy
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutPopup;
