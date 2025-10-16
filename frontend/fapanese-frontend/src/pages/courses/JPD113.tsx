import React from "react";
import { Link } from "react-router-dom";
import { motion, type Variants, easeOut } from "framer-motion";
import { FaBookOpen, FaComments, FaLanguage } from "react-icons/fa";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

const JPD113: React.FC = () => {
  const lessons = [
    {
      title: "Bài 1 - Giới thiệu bản thân & Giao tiếp cơ bản",
      details: [
        { type: "Từ vựng", icon: <FaLanguage /> },
        { type: "Ngữ pháp", icon: <FaBookOpen /> },
        { type: "Speaking", icon: <FaComments /> },
      ],
    },
    {
      title: "Bài 2 - Động từ & Cấu trúc câu",
      details: [
        { type: "Từ vựng", icon: <FaLanguage /> },
        { type: "Ngữ pháp", icon: <FaBookOpen /> },
        { type: "Speaking", icon: <FaComments /> },
      ],
    },
    {
      title: "Bài 3 - Mẫu câu nâng cao & Luyện phản xạ nói",
      details: [
        { type: "Từ vựng", icon: <FaLanguage /> },
        { type: "Ngữ pháp", icon: <FaBookOpen /> },
        { type: "Speaking", icon: <FaComments /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#f1f8ff] to-[#e3f2fd] py-16 px-6">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeInUp}
        className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 space-y-12"
      >
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Khóa học JPD113
          </h1>
          <p className="text-gray-700 text-lg">
            Khóa học tiếng Nhật cơ bản toàn diện – Từ bảng chữ cái đến giao tiếp tự tin
          </p>
          <p className="text-gray-800 font-semibold">🎓 Chứng chỉ hoàn thành</p>
          <Link
            to="#"
            className="inline-block mt-4 px-8 py-3 bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
          >
            Bắt đầu học ngay
          </Link>
        </motion.div>

        {/* Lộ trình học tập chi tiết */}
        <motion.div variants={fadeInUp} className="space-y-6 mt-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Lộ trình học tập chi tiết
          </h2>
          <p className="text-gray-700 text-center max-w-2xl mx-auto">
            Chương trình học được thiết kế bài bản từ cơ bản đến nâng cao giúp bạn nắm vững nền tảng và ứng dụng vào thực tế.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[
              { title: "Bảng chữ cái", desc: "Hiểu và ghi nhớ Hiragana, Katakana", color: "from-sky-50 to-sky-100" },
              { title: "Từ vựng", desc: "Mở rộng vốn từ cơ bản theo chủ đề", color: "from-amber-50 to-yellow-100" },
              { title: "Ngữ pháp", desc: "Nắm vững cấu trúc câu cơ bản", color: "from-pink-50 to-rose-100" },
              { title: "Speaking", desc: "Tăng khả năng phản xạ tự nhiên", color: "from-green-50 to-emerald-100" },
              { title: "Ôn tập & kiểm tra", desc: "Củng cố kiến thức toàn khóa", color: "from-indigo-50 to-blue-100" },
              { title: "Chứng chỉ", desc: "Xác nhận năng lực và hoàn thành khóa", color: "from-purple-50 to-fuchsia-100" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-br ${item.color} rounded-2xl shadow-md p-6 transition`}
              >
                <h3 className="font-semibold text-gray-800 text-lg">{item.title}</h3>
                <p className="text-gray-600 mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Danh sách bài học */}
        <motion.div variants={fadeInUp} className="space-y-10 mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
             Danh sách bài học chi tiết
          </h2>

          {lessons.map((lesson, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="bg-white/90 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-transform duration-300"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                {lesson.title}
              </h3>
              <ul className="space-y-4">
                {lesson.details.map((item, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 hover:from-sky-50 hover:to-white p-4 rounded-xl transition duration-200"
                  >
                    <div className="flex items-center gap-3 text-gray-800 font-medium">
                      {item.icon}
                      <span>{item.type}</span>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white font-semibold rounded-lg shadow hover:scale-105 transition-transform">
                      Học ngay
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          className="text-center space-y-4 mt-16"
        >
          <p className="text-gray-800 font-semibold text-xl">
               Sẵn sàng bắt đầu hành trình học tiếng Nhật?
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hãy tham gia cùng hàng nghìn học viên đã chinh phục tiếng Nhật cùng Fapanese.
          </p>
          <Link
            to="#"
            className="inline-block mt-3 px-8 py-3 bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
          >
            Đăng ký ngay
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default JPD113;
