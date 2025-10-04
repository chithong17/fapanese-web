import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface OtpSuccessProps {
  mode: "register" | "forgotPassword";
  onNext: () => void; // Callback chuyển sang bước tiếp theo
}

const OtpSuccess: React.FC<OtpSuccessProps> = ({ mode, onNext }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
      >
        {/* Icon thành công */}
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        {/* Tiêu đề */}
        <h1 className="text-2xl font-bold mb-3 text-gray-800">Xác thực thành công!</h1>

        <p className="text-gray-600 text-sm mb-6">
          {mode === "register"
            ? "Tài khoản của bạn đã được kích hoạt. 🎉"
            : "Bạn có thể đặt lại mật khẩu mới ngay bây giờ."}
        </p>

        {/* Nút tiếp tục */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="w-full bg-[#14a5a5] text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition"
        >
          Tiếp tục
        </motion.button>
      </motion.div>
    </div>
  );
};

export default OtpSuccess;
