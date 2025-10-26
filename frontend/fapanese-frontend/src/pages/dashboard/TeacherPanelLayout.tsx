import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";

export default function TeacherPanelLayout() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b">
        <h1 className="text-2xl font-bold text-cyan-600">TEACHER PANEL</h1>

        <button
          onClick={handleLogout}
          className="flex items-center bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <IoIosLogOut className="mr-2" />
          Đăng xuất
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  );
}
