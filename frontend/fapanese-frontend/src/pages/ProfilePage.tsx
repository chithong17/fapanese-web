import React, { useEffect, useState } from "react";
import axios from "axios";

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
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token đang dùng:", token); // 
        if (!token) throw new Error("Bạn chưa đăng nhập.");
        
        const res = await axios.get(
<<<<<<< HEAD
          // "https://c49fed29a856.ngrok-free.app/fapanese/api/users/profile",
=======
>>>>>>> 28f50e3b8afeb4455b44550e265f191680c4d48d
          "http://localhost:8080/fapanese/api/users/profile",
          { 
            // headers: 
            // { 
            //   Authorization: `Bearer ${token}`, 
            //   "ngrok-skip-browser-warning": "any-value" 
            // } 
          }
        );

        console.log("Profile API response:", res.data); // debug API
        setProfile(res.data.result); // Lấy result đúng
      } catch (err: any) {
        console.error(err);
        setMessage({ text: err.response?.data?.message || "Không thể tải thông tin người dùng.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
<<<<<<< HEAD
        // "https://c49fed29a856.ngrok-free.app/fapanese/api/users/profile/update",
=======
>>>>>>> 28f50e3b8afeb4455b44550e265f191680c4d48d
        "http://localhost:8080/fapanese/api/users/profile/update",
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: "Cập nhật thành công!", type: "success" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Cập nhật thất bại!", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-20">Đang tải thông tin...</p>;
  if (!profile) return <p className="text-center mt-20 text-red-500">Không có thông tin người dùng.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>

      {message && (
        <div className={`mb-4 text-center text-white rounded-full py-2 ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Họ</label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Tên</label>
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Campus</label>
          <input
            type="text"
            name="campus"
            value={profile.campus}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Ngày sinh</label>
          <input
            type="date"
            name="dob"
            value={profile.dob || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Vai trò</label>
          <input
            type="text"
            name="role"
            value={profile.role || ""}
            disabled
            className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
