// src/components/ForgotPasswordPopup.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine } from "react-icons/ri";
import { BiKey } from "react-icons/bi";

interface ForgotPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordPopup: React.FC<ForgotPasswordPopupProps> = ({
  isOpen,
  onClose,
}) => {
  const [show, setShow] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setShow(false), 300);
    }
  }, [isOpen]);

  const handleSendOtp = async () => {
    if (!email) return setError("Vui lòng nhập email");
    try {
      setError(null);
      await axios.post(
        "https://a252c7297f36.ngrok-free.app/fapanese/api/auth/send-otp",
        // "http://localhost:8080/fapanese/api/auth/forgot-password",
        { email }
      );
      setOtpSent(true);
      setSuccess("OTP đã được gửi đến email!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Không gửi được OTP");
    }
  };

  const handleReset = async () => {
    if (!email || !otp || !newPassword || !confirmPassword)
      return setError("Vui lòng điền đầy đủ thông tin");
    if (newPassword !== confirmPassword) return setError("Mật khẩu không khớp");

    try {
      setLoading(true);
      setError(null);
      await axios.post(
        "https://a252c7297f36.ngrok-free.app/fapanese/api/auth/reset-password",
        // "http://localhost:8080/fapanese/api/auth/reset-password",
        { email, otp, newPassword }
      );
      setSuccess("Đặt lại mật khẩu thành công 🎉");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const inputWrapper =
    "flex items-center gap-2 w-full p-3 rounded-xl border-2 border-gray-200 focus-within:border-[#14a5a5] focus-within:shadow-md focus-within:shadow-[#14a5a530] transition-all duration-300";
  const inputStyle = "flex-1 border-none outline-none bg-transparent";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 transition-all`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 rounded-full p-1 transition"
        >
          ✕
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Quên mật khẩu
        </h1>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">
            Email<span className="text-amber-600">*</span>
          </label>
          <div className={inputWrapper}>
            <HiOutlineMail />
            <input
              type="email"
              placeholder="Nhập email tại đây"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
            />
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">
            Mật khẩu mới<span className="text-red-600">*</span>
          </label>
          <div className={inputWrapper}>
            <RiLockPasswordLine />
            <input
              type="password"
              placeholder="Nhập mật khẩu tại đây"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputStyle}
            />
          </div>
        </div>

        {/* Xác minh mật khẩu */}
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">
            Xác minh mật khẩu<span className="text-red-600">*</span>
          </label>
          <div className={inputWrapper}>
            <RiLockPasswordLine />
            <input
              type="password"
              placeholder="Nhập mật khẩu tại đây"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputStyle}
            />
          </div>
        </div>

        {/* OTP */}
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-1">
            Mã xác minh<span className="text-red-600">*</span>
          </label>
          <div className="flex gap-2">
            <div className={inputWrapper}>
              <BiKey />
              <input
                type="text"
                placeholder="Nhập mã xác minh"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={inputStyle}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendOtp}
              className={`px-4 rounded-xl font-semibold text-white transition ${
                otpSent
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#14a5a5] to-[#0c9c9c] hover:opacity-90"
              }`}
              disabled={otpSent}
            >
              Lấy mã OTP
            </motion.button>
          </div>
        </div>

        {/* Error / Success */}
        {error && <p className="text-red-500 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">{success}</p>}

        {/* Reset button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleReset}
          className={`w-full py-3 rounded-2xl font-bold text-white shadow-md transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#14a5a5] to-[#0c9c9c] hover:opacity-90"
          }`}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </motion.button>

        {/* Back to login */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full py-3 rounded-full border border-[#14a5a5] text-[#14a5a5] font-semibold hover:bg-[#14a5a5] hover:text-white transition"
          onClick={() => window.dispatchEvent(new CustomEvent("switchToLogin"))}
        >
          Quay lại đăng nhập
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPopup;
