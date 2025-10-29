import { Outlet, useNavigate, Link } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { BookOutlined, HomeOutlined } from "@ant-design/icons";
import { useState } from "react";

export default function StudentPanelLayout() {
  const navigate = useNavigate();
  const [active, setActive] = useState("materials");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentId");
    localStorage.removeItem("classCourseId");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b">
        <h1 className="text-2xl font-bold text-cyan-600">STUDENT PANEL</h1>

        <nav className="flex gap-6 text-gray-700 font-medium">
          <Link
            to="/student/materials"
            className={`hover:text-cyan-600 ${
              active === "materials" ? "text-cyan-600 font-semibold" : ""
            }`}
            onClick={() => setActive("materials")}
          >
            <BookOutlined className="mr-1" /> Tài liệu & Bài tập
          </Link>
          <Link
            to="/student/home"
            className={`hover:text-cyan-600 ${
              active === "home" ? "text-cyan-600 font-semibold" : ""
            }`}
            onClick={() => setActive("home")}
          >
            <HomeOutlined className="mr-1" /> Trang chủ
          </Link>
        </nav>

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
