import React, { useState, useEffect } from "react";
import { FaGithub, FaGoogle, FaLinkedin } from "react-icons/fa";
import logo from "../assets/logologin.png";
import ScrollReveal from "./ScrollReveal";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: "login" | "signup";
}

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // --- thêm state cho animation ---
  const [show, setShow] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setTimeout(() => setAnimate(true), 10); // bật animation mở
    } else {
      setAnimate(false);
      setTimeout(() => setShow(false), 300); // chờ animation đóng
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center 
      bg-black/60 backdrop-blur-sm p-4 
      transition-opacity duration-300 
      ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden
        transform transition-all duration-300
        ${animate ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 rounded-full p-1 transition"
        >
          ✕
        </button>

        {/* Header với nút tab */}
        <div className="flex justify-between items-center px-10 border-b bg-gray-50">
          <h2><img src={logo} alt="" className="h-40 w-auto -my-7" /></h2>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("login")}
              className={`px-6 py-2 font-semibold rounded-xl transition ${
                activeTab === "login"
                  ? "bg-black text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`px-6 py-2 font-semibold rounded-xl transition ${
                activeTab === "signup"
                  ? "bg-black text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Container 2 cột trượt */}
        <div
          className="flex w-[200%] transition-transform duration-700 ease-in-out"
          style={{ transform: activeTab === "login" ? "translateX(0%)" : "translateX(-50%)" }}
        >
          {/* --- LOGIN SIDE --- */}
          <div className="w-1/2 flex flex-col items-center justify-center p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đăng nhập</h2>
            <p className="text-gray-500 mb-6">Chào mừng quay lại Fapanese</p>

            {/* Social buttons */}
            <div className="flex flex-col gap-3 mb-6 w-full max-w-sm">
              <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2 hover:bg-gray-100 transition">
                <FaGithub /> Continue with GitHub
              </button>
              <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2 hover:bg-gray-100 transition">
                <FaGoogle /> Continue with Google
              </button>
              <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2 hover:bg-gray-100 transition">
                <FaLinkedin /> Continue with LinkedIn
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6 text-gray-400 w-full max-w-sm">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span>OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <form className="flex flex-col gap-4 w-full max-w-sm">
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Login
              </button>
            </form>
          </div>

          {/* Hình bên phải LOGIN */}
          <div className="w-1/2 bg-gray-100 flex items-center justify-center">
            <img src="/login-image.svg" alt="login" className="max-w-sm" />
          </div>

          {/* --- SIGNUP SIDE --- */}
          <div className="w-1/2 flex flex-col items-center justify-center p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đăng ký</h2>
            <p className="text-gray-500 mb-6">Tạo tài khoản mới để bắt đầu học</p>

            {/* Social buttons */}
            <div className="flex flex-col gap-3 mb-6 w-full max-w-sm">
              <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2 hover:bg-gray-100 transition">
                <FaGithub /> Continue with GitHub
              </button>
              <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2 hover:bg-gray-100 transition">
                <FaGoogle /> Continue with Google
              </button>
              <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2 hover:bg-gray-100 transition">
                <FaLinkedin /> Continue with LinkedIn
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6 text-gray-400 w-full max-w-sm">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span>OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <form className="flex flex-col gap-4 w-full max-w-sm">
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
              />
              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Sign Up
              </button>
            </form>
          </div>

          {/* Hình bên trái SIGNUP */}
          <div className="w-1/2 bg-gray-100 flex items-center justify-center">
            <img src="/signup-image.svg" alt="signup" className="max-w-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;
