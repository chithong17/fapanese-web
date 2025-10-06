import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import logo from "../assets/editprofile.png";

interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  campus: string;
  dob?: string;
  role?: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Bạn chưa đăng nhập.");

        const res = await axios.get(
          "http://localhost:8080/fapanese/api/users/profile",
          // "https://5180368dcd09.ngrok-free.app/fapanese/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "any-value",
            },
          }
        );

        setProfile(res.data.result);
      } catch (err: any) {
        console.error(err);
        setPopup({
          text:
            err.response?.data?.message ||
            "Không thể tải thông tin người dùng.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setPopup(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
      
        "http://localhost:8080/fapanese/api/users/profile/update",
        //"https://5180368dcd09.ngrok-free.app/fapanese/api/users/profile/update",
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Hiện popup
      setPopup({ text: "Cập nhật thành công!", type: "success" });
      setTimeout(() => {
        setPopup(null);
        setTimeout(() => {
          window.location.reload();
        }, 500); // thêm 0.5s để đảm bảo hiệu ứng tắt popup xong
      }, 1000);
    } catch (err) {
      console.error(err);
      setPopup({ text: "Cập nhật thất bại!", type: "error" });
      setTimeout(() => setPopup(null), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500"></div>
      </div>
    );

  if (!profile)
    return (
      <p className="text-center mt-20 text-red-500 font-semibold">
        Không có thông tin người dùng.
      </p>
    );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 py-10 px-4 pt-20">
      {/* Popup*/}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999]"
          >
            <div
              className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] border 
        ${
          popup.type === "success"
            ? "border-emerald-400/50 bg-gradient-to-r from-emerald-400/20 to-teal-300/20 text-emerald-900"
            : "border-rose-400/50 bg-gradient-to-r from-rose-400/20 to-red-300/20 text-rose-900"
        }`}
            >
              {/* Icon */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: popup.type === "success" ? 360 : -360 }}
                transition={{ duration: 0.6 }}
                className="text-2xl"
              >
                {popup.type === "success" ? (
                  <FaCheckCircle />
                ) : (
                  <FaTimesCircle />
                )}
              </motion.div>

              {/* Text */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="font-semibold text-base tracking-wide"
              >
                {popup.text}
              </motion.span>

              {/* Glow Border Animation */}
              <motion.div
                className={`absolute inset-0 rounded-2xl pointer-events-none ${
                  popup.type === "success"
                    ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                    : "bg-gradient-to-r from-rose-400 to-red-400"
                }`}
                style={{
                  opacity: 0.2,
                  filter: "blur(8px)",
                  zIndex: -1,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#32a9a9] to-[#70caca] h-44 flex items-center justify-center overflow-hidden">
          {/* SVG caro overlay */}
          <svg
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="pl-150 pt-5">
            <img src={logo} alt="" className="w-50 " />
          </div>
          {/* Nội dung hiển thị tên học viên */}
          <div className="absolute bottom-4 flex flex-col items-start z-10 ">
            <h1 className="mt-2 text-xl font-bold text-white">
              HỌC VIÊN: {profile.firstName} {profile.lastName}
            </h1>
          </div>
        </div>

        {/* Body */}
        <div className="mt-20 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Họ<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Tên<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Email<span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                disabled
                className="w-full border border-gray-200 bg-gray-100 rounded-xl p-3 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Campus<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="campus"
                value={profile.campus}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Ngày sinh<span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={profile.dob || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Vai trò<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="role"
                value={profile.role || ""}
                disabled
                className="w-full border border-gray-200 bg-gray-100 rounded-xl p-3 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-10 flex justify-end">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSave}
              disabled={saving}
              className={`px-10 py-3 rounded-full font-semibold text-white shadow-lg transition-all duration-300 ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:shadow-xl hover:brightness-110"
              }`}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
