import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import logo from "../assets/banneredit.jpg";

interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  campus: string;
  dob?: string; // yyyy-mm-dd
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
          //"https://1eb4ad2349e8.ngrok-free.app/fapanese/api/users/profile",
          "http://localhost:8080/fapanese/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              //  "ngrok-skip-browser-warning": "any-value",
            },
          }
        );

        // Convert dob to yyyy-mm-dd string if present
        const user = res.data.result;
        if (user.dob) {
          // Nếu là ISO (có chữ T) -> cắt 10 ký tự đầu
          if (typeof user.dob === "string") {
            // Nếu dạng 2025-10-06T00:00:00Z
            if (user.dob.includes("T")) {
              user.dob = user.dob.slice(0, 10);
            }
            // Nếu dạng dd/MM/yyyy (thỉnh thoảng BE trả vậy)
            else if (user.dob.includes("/")) {
              const [day, month, year] = user.dob.split("/");
              user.dob = `${year}-${month.padStart(2, "0")}-${day.padStart(
                2,
                "0"
              )}`;
            }
          }
        }
        setProfile(user);
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
      // Ensure dob is yyyy-mm-dd string
      // const payload = {
      //   ...profile,
      //   dob:
      //     profile.dob && typeof profile.dob === "string"
      //       ? profile.dob.slice(0, 10)
      //       : "",
      // };

      const payload = {
        ...profile,
        dob: profile.dob ? profile.dob.slice(0, 10) : "",
      };
      await axios.post(
        //"https://1eb4ad2349e8.ngrok-free.app/fapanese/api/users/profile/update",
        "http://localhost:8080/fapanese/api/users/profile/update",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Hiện popup sang trọng
      setPopup({ text: "Cập nhật thành công!", type: "success" });
      setTimeout(() => setPopup(null), 2500);
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
      {/* Popup sang trọng */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ duration: 0.4 }}
            className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl pt-30 shadow-xl flex items-center gap-3 font-semibold text-white ${
              popup.type === "success"
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : "bg-gradient-to-r from-rose-500 to-red-400"
            }`}
          >
            {popup.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            {popup.text}
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
        <div className="relative bg-gradient-to-r from-teal-600 to-cyan-500 h-44 flex items-center justify-center">
          <img src={logo} alt="" className="h-[100%]" />
          <div className="absolute -bottom-14 flex flex-col items-center ">
            <h1 className="mt-2 text-xl font-bold text-[#0b7a75]">
              Học viên: {profile.firstName} {profile.lastName}
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
