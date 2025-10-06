import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import axios from "axios";
import ResetPassword from "./ResetPassword";


interface OtpVerificationProps {
  email: string;
  mode: "register" | "forgotPassword";
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ email, mode }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(300); // 4 phút 30 giây -> thành 5p
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);

    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(paste)) {
      setOtp(paste.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    try {
      setError(null);
      const response = await axios.post(
         "http://localhost:8080/fapanese/api/auth/verify-otp",
       //"https://1eb4ad2349e8.ngrok-free.app/fapanese/api/auth/verify-otp",
        { email, otp: code, mode }
      );

      if (response.data?.code === 0) {
        setSuccess("Xác thực thành công 🎉");
        // Chờ 2 giây rồi chuyển về login
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("switchToLogin"));
        }, 2000);
      } else {
        setError(response.data?.message || "OTP không hợp lệ");
      }
    } catch (err: any) {
      console.error("Lỗi verify OTP:", err.response || err);
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <Mail className="w-12 h-12 text-[#14a5a5]" />
        </div>

        {/* Tiêu đề */}
        <h1 className="text-xl font-bold mb-2 text-gray-800">Xác thực OTP</h1>
        <p className="text-gray-600 text-sm mb-6">
          {mode === "register"
            ? `Mã OTP đã được gửi đến email của bạn: ${email}. Vui lòng nhập để xác thực tài khoản.`
            : `Mã OTP đã được gửi đến email của bạn: ${email}. Vui lòng nhập để đặt lại mật khẩu.`}
        </p>

        {/* Input OTP */}
        <div className="flex justify-center gap-3 mb-4" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-lg font-bold focus:border-[#14a5a5] focus:outline-none transition"
            />
          ))}
        </div>

        {/* Countdown */}
        <p className="text-sm text-gray-500 mb-4">
          {timeLeft > 0
            ? `Mã OTP sẽ hết hạn sau ${minutes}:${seconds
                .toString()
                .padStart(2, "0")}`
            : "OTP đã hết hạn. Vui lòng nhấn gửi lại."}
        </p>

        {/* Error / Success */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

        {/* Buttons */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleVerify}
          className="w-full bg-[#14a5a5] text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition"
        >
          Xác thực
        </motion.button>

        <button className="mt-4 text-sm font-medium text-gray-400 cursor-not-allowed">
          Gửi lại OTP
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
