import React from "react";
import { Link } from "react-router-dom";

const JPD133: React.FC = () => {
  const lessons = [
    {
      part: "Phần 1: Bảng Chữ Cái Hiragana và Katakana",
      items: [
        "Buổi 1 - Bảng chữ cái Hiragana và Katakana",
        "Buổi 2 - Quy Tắc Phát Âm & Số Đếm Cũ",
        "Buổi 2 - Quy Tắc Phát Âm & Số Đếm Mới",
      ],
    },
    {
      part: "Phần 2: Giới Thiệu Bản Thân, Đếm Số, Trợ Từ - Ngữ Pháp bài 1,2",
      items: [
        "Buổi 3 - Ngữ pháp bài 1",
        "Buổi 4 - Luyện tập ngữ pháp bài 1",
        "Buổi 5 - Luyện tập ngữ pháp bài 1 (Phần 2)",
      ],
    },
    {
      part: "Phần 3: Ôn Tập Thực Hành",
      items: ["Buổi 6 - Ôn tập tất cả từ vựng, kanji và ngữ pháp"],
    },
    {
      part: "Phần 4: Chia Động Từ & Cách Thực Hiện Hành Động - Ngữ pháp bài 2,3",
      items: ["Buổi 7 - Ngữ pháp bài 2", "Buổi 8 - Ngữ pháp bài 3"],
    },
    {
      part: "Phần 5: Luyện Nói, Phản Xạ Tự Nhiên",
      items: ["Buổi 9 - Luyện nói cơ bản", "Buổi 10 - Luyện nói nâng cao"],
    },
    {
      part: "Phần 6: Ôn Tập Bài Tập Trắc Nghiệm",
      items: ["Buổi 11 - Kiểm tra trắc nghiệm tổng hợp"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-10 space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Khóa học JPD133
          </h1>
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

        {/* Lộ trình học tập chi tiết */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Lộ trình học tập chi tiết</h2>
          <p className="text-gray-700">
            Chương trình học được thiết kế bài bản từ cơ bản đến nâng cao
          </p>

          {/* Thẻ info tổng quát */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <h3 className="font-semibold text-gray-800">Bảng chữ cái</h3>
              <p className="text-gray-600 mt-1">3 chủ đề chính</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <h3 className="font-semibold text-gray-800">Từ vựng</h3>
              <p className="text-gray-600 mt-1">3 chủ đề chính</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <h3 className="font-semibold text-gray-800">Ngữ pháp</h3>
              <p className="text-gray-600 mt-1">1 chủ đề chính</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <h3 className="font-semibold text-gray-800">Speaking</h3>
              <p className="text-gray-600 mt-1">2 chủ đề chính</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <h3 className="font-semibold text-gray-800">Ôn tập cuối kì</h3>
              <p className="text-gray-600 mt-1">1 chủ đề chính</p>
            </div>
          </div>
        </div>

        {/* Danh sách bài học chi tiết */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Danh sách bài học
          </h2>
          {lessons.map((lesson, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition hover:shadow-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{lesson.part}</h3>
              <ul className="space-y-2">
                {lesson.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition"
                  >
                    <span className="text-gray-700">{item}</span>
                    <button className="px-4 py-1 bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white font-semibold rounded-lg shadow hover:scale-105 transition-transform">
                      Học ngay
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Call to action cuối trang */}
        <div className="text-center space-y-4 mt-12">
          <p className="text-gray-800 font-semibold text-lg">
            Sẵn sàng bắt đầu hành trình học tiếng Nhật?
          </p>
          <p className="text-gray-600">
            Tham gia cùng hàng nghìn học viên đã thành công với khóa học JPD113
          </p>
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

export default JPD133;
