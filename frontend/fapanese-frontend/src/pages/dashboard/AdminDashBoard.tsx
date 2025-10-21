import { Link, Route, Routes, useNavigate  } from "react-router-dom";
import StudentManagementPage from "./StudentManagementPage";

export default function AdminDashBoard() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.dispatchEvent(new Event("logout"));
    navigate("/"); // quay về trang chủ
  };
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-800 text-white min-h-screen p-4">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/admin/students" className="hover:bg-gray-700 p-2 rounded">
            👩‍🎓 Quản lý học sinh
          </Link>
          <Link to="/admin/courses" className="hover:bg-gray-700 p-2 rounded">
            📘 Quản lý khóa học
          </Link>
        </nav>
        {/* Nút đăng xuất */}
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
        >
          🚪 Đăng xuất
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 p-6">
        <Routes>
          <Route path="students" element={<StudentManagementPage />} />
          <Route index element={<div>Chọn mục từ sidebar để quản lý</div>} />
        </Routes>
      </div>
    </div>
  );
}
