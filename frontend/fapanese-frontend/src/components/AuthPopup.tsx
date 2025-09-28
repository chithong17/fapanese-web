import React, { useState, useEffect } from "react";
import { FaGithub, FaGoogle, FaLinkedin } from "react-icons/fa";

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

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white  rounded-2xl shadow-2xl w-full max-w-md relative p-8 transition-transform transform scale-100 animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1 transition"
        >
          ✕
        </button>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-black text-center mb-6">
          Chào mừng bạn đến với <span className="text-[#80D9E6]">Fapanese</span>
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          Học tiếng Nhật dễ dàng và hiệu quả
        </p>

        {/* Tabs */}
        <div className="flex justify-center mb-6 gap-4">
  <button
    className={`px-6 py-2 font-semibold rounded-xl transition-all ${
      activeTab === "login"
        ? "bg-black text-white shadow-lg"
        : "bg-white text-black dark:bg-gray-700 dark:text-gray-300 hover:shadow-md"
    }`}
    onClick={() => setActiveTab("login")}
  >
    Login
  </button>
  <button
    className={`px-6 py-2 font-semibold rounded-xl transition-all ${
      activeTab === "signup"
        ? "bg-black text-white shadow-lg"
        : "bg-white text-black dark:bg-gray-700 dark:text-gray-300 hover:shadow-md"
    }`}
    onClick={() => setActiveTab("signup")}
  >
    Sign Up
  </button>
</div>


        {/* Social Login Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button className="flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-xl py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-sm">
            <FaGithub /> Continue with GitHub
          </button>
          <button className="flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-xl py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-sm">
            <FaGoogle /> Continue with Google
          </button>
          <button className="flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-xl py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-sm">
            <FaLinkedin /> Continue with LinkedIn
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 text-gray-400">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span>OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Form */}
        {activeTab === "login" ? (
          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Login
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Sign Up
            </button>
          </form>
        )}

        {/* Toggle tab */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {activeTab === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-[#80D9E6] font-semibold hover:opacity-80 transition"
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-[#80D9E6] font-semibold hover:opacity-80 transition"
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;
