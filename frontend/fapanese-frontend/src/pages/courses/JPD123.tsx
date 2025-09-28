import React from "react";
import { Link } from "react-router-dom";

const JPD113: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900">Khóa học JPD113</h1>
          <p className="text-gray-700 text-lg">
            Khóa học tiếng Nhật cơ bản toàn diện - Từ bảng chữ cái đến giao tiếp cơ bản
          </p>
          <p className="text-gray-800 font-semibold">Chứng chỉ hoàn thành</p>
          <Link
            to="#"
            className="inline-block mt-2 px-6 py-3 bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            Bắt đầu học ngay
          </Link>
        </div>

        {/* Lộ trình học tập */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Lộ trình học tập chi tiết</h2>
          <p className="text-gray-700">
            Chương trình học được thiết kế bài bản từ cơ bản đến nâng cao
          </p>

          {/* Bảng chữ cái */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Bảng chữ cái - 3 chủ đề chính</h3>
            <ul className="space-y-1 list-disc list-inside text-gray-700">
              <li>Chữ Hiragana - 2 bài tập</li>
              <li>Chữ Katakana - 2 bài tập</li>
              <li>Âm đặc biệt - 2 bài tập</li>
            </ul>
          </div>

          {/* Từ vựng */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Từ vựng - 3 chủ đề chính</h3>
            <ul className="space-y-1 list-disc list-inside text-gray-700">
              <li>Theo bài (Thêm kanji) - 2 bài tập</li>
              <li>Chào hỏi cơ bản - 2 bài tập</li>
              <li>Số đếm, Thứ, Ngày, Tháng, Năm - 3 bài tập</li>
            </ul>
          </div>

          {/* Ngữ pháp */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Ngữ pháp - 1 chủ đề chính</h3>
            <ul className="space-y-1 list-disc list-inside text-gray-700">
              <li>Theo bài - 2 bài tập</li>
            </ul>
          </div>

          {/* Speaking */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Speaking - 2 chủ đề chính</h3>
            <ul className="space-y-1 list-disc list-inside text-gray-700">
              <li>Đọc đoạn văn theo chủ đề - 2 bài tập</li>
              <li>Câu hỏi - 2 bài tập</li>
            </ul>
          </div>

          {/* Ôn tập */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Ôn tập cuối kì - 1 chủ đề chính</h3>
            <ul className="space-y-1 list-disc list-inside text-gray-700">
              <li>Kiểm tra tổng hợp - 1 bài tập</li>
            </ul>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center space-y-4">
          <p className="text-gray-800 font-semibold text-lg">
            Sẵn sàng bắt đầu hành trình học tiếng Nhật?
          </p>
          <p className="text-gray-600">Tham gia cùng hàng nghìn học viên đã thành công với khóa học JPD113</p>
          <Link
            to="#"
            className="inline-block mt-2 px-6 py-3 bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  );
};

export default JPD113;
