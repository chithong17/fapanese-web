import React from "react";
import { useNavigate } from "react-router-dom";

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Bảng điều khiển Giảng viên
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card quản lý khóa học */}
        <div
          onClick={() => navigate("/teacher/courses")}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Quản lý khóa học
          </h2>
          <p className="text-gray-500 text-sm">
            Xem, thêm, chỉnh sửa và xóa các khóa học bạn phụ trách.
          </p>
        </div>

        {/* Sau này sẽ thêm các card khác: Lesson, Grammar, Vocabulary... */}
      </div>
    </div>
  );
};

export default TeacherDashboard;
