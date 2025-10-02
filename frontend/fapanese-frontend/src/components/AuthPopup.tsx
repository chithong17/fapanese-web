import React, { useState, useEffect } from "react";
import { FaGithub, FaGoogle, FaLinkedin } from "react-icons/fa";
import logo from "../assets/logologin.png";
import WelcomeLogo from "../assets/welcomeLog.jpg";
import axios from "axios";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: "login" | "signup";
}

const AuthPopup: React.FC<AuthPopupProps> = ({
  isOpen,
  onClose,
  initialTab,
}) => {
  const [role, setRole] = useState<"student" | "lecturer">("student");
  const [campus, setCampus] = useState("");
  const [dob, setDob] = useState("");
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // <--- THÊM STATE NÀY
  const [loading, setLoading] = useState(false);

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

  // them code xu ly login
  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError(null);
  //   setLoading(true);

  //   //1. API đăng nhập localhost
  //   //http://localhost:8080/fapanese/api/auth/login
  //   //https://7a85ec43c9f4.ngrok-free.app/fapanese/api/auth/login
  //   try {
  //     // 1. Gửi yêu cầu POST đến API đăng nhập
  //     const response = await axios.post(
  //       //API đăng nhập thông qua ngrok
  //       "https://7a85ec43c9f4.ngrok-free.app/fapanese/api/auth/login",
  //       {
  //         email: loginEmail,
  //         password: loginPassword,
  //       }
  //     );

  //     // 2. Xử lý khi thành công
  //     console.log("API Response:", response.data);
  //     alert("Đăng nhập thành công!"); // <-- MỤC TIÊU CỦA BẠN

  //     onClose(); // Đóng popup sau khi đăng nhập thành công
  //   } catch (err: any) {
  //     // 3. Xử lý khi thất bại
  //     console.error("Lỗi đăng nhập:", err.response);
  //     setError(
  //       err.response?.data?.message || "Email hoặc mật khẩu không chính xác."
  //     );
  //   } finally {
  //     // 4. Luôn tắt loading khi xong
  //     setLoading(false);
  //   }
  // };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("Payload being sent:", { email: loginEmail, password: loginPassword });
      const response = await axios.post(
        "https://7a85ec43c9f4.ngrok-free.app/fapanese/api/auth/login",
        JSON.stringify({ email: loginEmail, password: loginPassword }),
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("API Response:", response.data);

      if (response.data?.result?.authenticated) {
        alert("Đăng nhập thành công!");
        localStorage.setItem("token", response.data.result.token);
        onClose();
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.");
      }
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err.response || err);
      console.error("Response data:", err.response?.data);
      setError(
        err.response?.data?.message || "Email hoặc mật khẩu không chính xác."
      );
    } finally {
      setLoading(false);
    }
  };

  // them code xu ly dang ky
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const userData = {
      email: signupEmail,
      password: signupPassword,
      role: role.toUpperCase(), // Gửi đi dạng 'STUDENT' hoặc 'LECTURER'
      dateOfBirth: dob,
      // Thêm các trường khác tùy theo vai trò đã chọn
      ...(role === "student" && { campus: campus}),
      ...(role === "lecturer" && { expertise: expertise, bio: bio }),
    };

    console.log("Payload being sent for signup:", userData);

    try {
      const response = await axios.post(
        "https://7a85ec43c9f4.ngrok-free.app/fapanese/api/users/register",
        userData
      );

      console.log("Signup API Response:", response.data);
      alert("Đăng ký thành công! Kiểm tra database và thử đăng nhập.");

      setActiveTab("login");
      setSignupEmail("");
      setSignupPassword("");
    } catch (err: any) {
      console.error("Lỗi đăng ký:", err.response || err);
      console.error("Response data:", err.response?.data);
      setError(
        err.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

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
          <h2>
            <img src={logo} alt="" className="h-40 w-auto -my-7" />
          </h2>
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
          style={{
            transform:
              activeTab === "login" ? "translateX(0%)" : "translateX(-50%)",
          }}
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

            <form
              onSubmit={handleLogin} //xy ly su kien login
              className="flex flex-col gap-4 w-full max-w-sm"
            >
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
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
              <button
                type="submit"
                className="bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
                disabled={loading}
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>
          </div>

          {/* Hình bên phải LOGIN */}
          <div className="w-1/2 bg-gray-100 flex items-center justify-center mx-17 ">
            <img
              src={WelcomeLogo}
              alt="login"
              className="max-w-sm h-152 w-125 rounded-2xl"
            />
          </div>

          {/* --- SIGNUP SIDE --- */}
          <div className="w-1/2 flex flex-col items-center justify-center p-10 mr-5">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đăng ký</h2>
            <p className="text-gray-500 mb-6">
              Tạo tài khoản mới để bắt đầu học
            </p>

            {/* FORM ĐĂNG KÝ */}
            <form
              onSubmit={handleSignup} //xy ly su kien dang ky
              className="flex flex-col gap-4 w-full max-w-sm"
            >
              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
              />
              {/* Password */}
              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
              />
              {/* Confirm Password */}
              <input
                type="password"
                placeholder="Confirm Password"
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
              />

              {/* Role chọn Student / Lecturer */}
              <select
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "student" | "lecturer")
                }
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
              </select>

              {/* Nếu Student → Campus + DOB */}
              {role === "student" && (
                <>
                  <select
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
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
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
                  />
                </>
              )}

              {/* Nếu Lecturer → Expertise + Bio + DOB */}
              {role === "lecturer" && (
                <>
                  <input
                    type="text"
                    placeholder="Expertise"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
                  />
                  <textarea
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
                  />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#80D9E6] outline-none transition"
                  />
                </>
              )}

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
            <img
              src={WelcomeLogo}
              alt="signup"
              className="max-w-sm rounded-2xl h-152 w-125"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;
