import React from "react";
import { useNavigate } from "react-router-dom";
// Import icons if you want to add them to the cards
import { FaBook, FaClipboardList, FaFolderOpen } from "react-icons/fa";

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Bảng điều khiển Giảng viên
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Adjusted grid for potentially more items */}

        {/* Card quản lý khóa học */}
        <div
          onClick={() => navigate("/teacher/courses")}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200 flex flex-col items-start hover:bg-cyan-50"
        >
          <FaBook className="text-3xl text-cyan-600 mb-3" /> {/* Example Icon */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Quản lý Khóa học
          </h2>
          <p className="text-gray-500 text-sm">
            Xem, thêm, chỉnh sửa các khóa học, bài học và nội dung tổng ôn.
          </p>
        </div>

        {/* --- ✅ THÊM CARD NGÂN HÀNG CÂU HỎI --- */}
        <div
          onClick={() => navigate("/teacher/question-bank")} // Điều hướng đến trang ngân hàng câu hỏi
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200 flex flex-col items-start hover:bg-green-50" // Added hover color
        >
           <FaClipboardList className="text-3xl text-green-600 mb-3" /> {/* Example Icon */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Ngân hàng Câu hỏi
          </h2>
          <p className="text-gray-500 text-sm">
            Xem, thêm, sửa và xóa các câu hỏi trắc nghiệm, điền từ dùng chung.
          </p>
        </div>
        {/* --- HẾT PHẦN THÊM --- */}

        {/* --- ✅ THÊM CARD QUẢN LÝ TÀI LIỆU --- */}
        <div
          onClick={() => navigate("/teacher/materials")} // Điều hướng đến trang tài liệu
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200 flex flex-col items-start hover:bg-blue-50"
        >
           <FaFolderOpen className="text-3xl text-blue-600 mb-3" /> {/* Icon mới */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Quản lý Tài liệu
          </h2>
          <p className="text-gray-500 text-sm">
            Tải lên và quản lý các tài liệu học tập, bài tập cho sinh viên.
          </p>
        </div>
        {/* --- HẾT PHẦN THÊM --- */}


        {/* Bạn có thể thêm các card khác ở đây sau này */}

      </div>
    </div>
  );
};

export default TeacherDashboard;