import React, { useState, useEffect } from "react";
import { FaGithub, FaGoogle, FaLinkedin } from "react-icons/fa";
import logo from "../assets/logologin.png";
import WelcomeLogo from "../assets/welcomeLog.jpg";
import axios from "axios";
import OtpVerification from "../pages/OtpVerification";
import ForgotPasswordPopup from "../pages/ResetPassword";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationModal from "./NotificationModal"; // <-- THÊM IMPORT NÀY
import { useNavigate } from "react-router-dom";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: "login" | "signup";
}

// XÓA component NotificationModal đã ở đây

const AuthPopup: React.FC<AuthPopupProps> = ({
  isOpen,
  onClose,
  initialTab,
}) => {
  // --- State chung ---
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [show, setShow] = useState(isOpen);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notification modal
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  // OTP & step
  const [step, setStep] = useState<"login" | "signup" | "otp">(initialTab);
  const [otpEmail, setOtpEmail] = useState("");

  // email chưa xác thực
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // Forgot password
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // --- Login state ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // --- Signup state ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState<"student" | "lecturer">("student");
  const [campus, setCampus] = useState("");
  const [dob, setDob] = useState("");
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");

  // --- Animation open/close ---
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setShow(false), 300);
    }
  }, [isOpen]);

  // --- Switch to login after OTP verified ---
  useEffect(() => {
    const handleSwitch = () => {
      setStep("login");
      setActiveTab("login");
    };
    window.addEventListener("switchToLogin", handleSwitch);
    return () => window.removeEventListener("switchToLogin", handleSwitch);
  }, []);

  // --- Handle notification close ---
  const handleNotifClose = async () => {
    setNotifMessage(null);
    if (unverifiedEmail) {
      try {
        await axios.post(
          // "https://5180368dcd09.ngrok-free.app/fapanese/api/auth/send-otp",
          "http://localhost:8080/fapanese/api/auth/send-otp",
          { email: unverifiedEmail }
        );
        setStep("otp");
        setOtpEmail(unverifiedEmail);
        setUnverifiedEmail(null);
      } catch (err: any) {
        console.error("Lỗi gửi OTP:", err.response || err);
        setNotifMessage(err.response?.data?.message || "Gửi OTP thất bại");
      }
    }
  };

  const navigate = useNavigate();
  // --- Login ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/fapanese/api/auth/login",
        { email: loginEmail, password: loginPassword }
      );

      const data = response.data?.result;

      if (data?.authenticated && data?.token) {
        const token = data.token;

        // 🔍 Decode JWT để lấy scope
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(atob(base64));
        const scope = decodedPayload.scope || "";
        const role = scope.replace("ROLE_", "");

        // Lưu lại
        localStorage.setItem("token", token);
        localStorage.setItem("email", loginEmail);
        localStorage.setItem("role", role);

        setNotifMessage("Đăng nhập thành công!");

        // 🔁 Reload đúng role
        if (role === "ADMIN") {
          window.location.href = "/admin";
        } else if (role === "STUDENT") {
          window.location.href = "/";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err: any) {
      if (err.response?.data?.code === 1008) {
        setUnverifiedEmail(loginEmail);
        setNotifMessage(
          err.response.data?.message || "Tài khoản chưa xác thực email"
        );
      } else {
        setNotifMessage(
          err.response?.data?.message || "Kết nối thất bại tới hệ thống."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Signup ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userData = {
      firstName,
      lastName,
      email: signupEmail,
      password: signupPassword,
      role: role.toUpperCase(),
      dateOfBirth: dob,
      ...(role === "student" && { campus }),
      ...(role === "lecturer" && { expertise, bio }),
    };

    try {
      await axios.post(
        // "https://5180368dcd09.ngrok-free.app/fapanese/api/users/register",

        "http://localhost:8080/fapanese/api/users/register",
        userData
      );

      await axios.post(
        // "https://5180368dcd09.ngrok-free.app/fapanese/api/auth/send-otp",
        "http://localhost:8080/fapanese/api/auth/send-otp",
        { email: signupEmail }
      );

      setStep("otp");
      setOtpEmail(signupEmail);
      setNotifMessage(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực."
      );

      // Reset form
      setFirstName("");
      setLastName("");
      setSignupEmail("");
      setSignupPassword("");
      setCampus("");
      setDob("");
      setExpertise("");
      setBio("");
    } catch (err: any) {
      setNotifMessage(
        err.response?.data?.message ||
          "Đăng ký thất bại. Kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all duration-300 ${
          animate ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 rounded-full p-1 transition"
        >
          ✕
        </button>

        {/* === OTP Step === */}
        {step === "otp" ? (
          <OtpVerification email={otpEmail} mode="register" />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex justify-between items-center px-10 border-b bg-gray-50">
              <img src={logo} alt="" className="h-40 w-auto -my-7" />
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
                <button
                  className="text-black  py-2 px-4 rounded-md shadow hover:bg-gray-600 transition-all"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Quên mật khẩu
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              className="flex w-[200%] transition-transform duration-700 ease-in-out"
              style={{
                transform:
                  activeTab === "login" ? "translateX(0%)" : "translateX(-50%)",
              }}
            >
              {/* LOGIN SIDE */}
              <div className="w-1/2 flex flex-col items-center justify-center p-10 ml-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Đăng nhập
                </h2>
                <p className="text-gray-500 mb-6">
                  Chào mừng quay lại Fapanese
                </p>

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

                <form
                  onSubmit={handleLogin}
                  className="flex flex-col gap-4 w-full max-w-sm"
                >
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                  />
                  <button
                    type="submit"
                    className="bg-black text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Login"}
                  </button>
                </form>
              </div>

              {/* LOGIN IMAGE */}
              <div className="w-1/2 bg-gray-100 flex items-center justify-center mx-17">
                <img
                  src={WelcomeLogo}
                  alt="login"
                  className="max-w-sm h-155 w-125 rounded-2xl"
                />
              </div>

              {/* SIGNUP SIDE */}
              <div className="w-1/2 flex flex-col items-center justify-center p-9 mr-5 ">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Đăng ký
                </h2>
                <p className="text-gray-500 mb-6">
                  Tạo tài khoản mới để bắt đầu học
                </p>

                <form
                  onSubmit={handleSignup}
                  className="flex flex-col gap-4 w-full max-w-sm "
                >
                  <div className="flex gap-3 w-full">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition w-30"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                  />

                  <select
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "student" | "lecturer")
                    }
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                  </select>

                  {role === "student" && (
                    <>
                      <select
                        className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                      >
                        <option value="">Select Campus</option>
                        <option value="Hanoi">Hà Nội</option>
                        <option value="HCM">TP. Hồ Chí Minh</option>
                        <option value="Danang">Đà Nẵng</option>
                      </select>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                      />
                    </>
                  )}

                  {role === "lecturer" && (
                    <>
                      <input
                        type="text"
                        placeholder="Expertise"
                        value={expertise}
                        onChange={(e) => setExpertise(e.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                      />
                      <textarea
                        placeholder="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                      />
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                      />
                    </>
                  )}

                  <button
                    type="submit"
                    className="bg-black text-white py-2 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading && <CircularProgress size={20} color="inherit" />}
                    {loading ? "Đang tải..." : "Sign Up"}
                  </button>
                </form>
              </div>

              {/* SIGNUP IMAGE */}
              <div className="w-1/2 bg-gray-100 flex items-center justify-center">
                <img
                  src={WelcomeLogo}
                  alt="signup"
                  className="max-w-sm rounded-2xl h-155 w-125"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Notification Modal */}
      {notifMessage && (
        <NotificationModal message={notifMessage} onClose={handleNotifClose} />
      )}

      {/* Forgot Password */}
      <ForgotPasswordPopup
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default AuthPopup;
