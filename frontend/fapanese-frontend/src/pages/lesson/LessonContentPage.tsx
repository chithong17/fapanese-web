import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaComments, FaLanguage, FaDownload } from "react-icons/fa";
import { FiSearch, FiVideo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// ----------------------------- DỮ LIỆU GIẢ -----------------------------
const sidebarLessons = [
  { title: "Bộ thủ chữ Hán 2", duration: "0h24'", type: "Video" },
  { title: "Bộ thủ chữ Hán 3", duration: "0h33'", type: "Video" },
  { title: "Bộ thủ chữ Hán 4", duration: "0h29'", type: "Video" },
  { title: "Bộ thủ chữ Hán 6", duration: "0h26'", type: "Video" },
];

const vocabularyContent = [
  { jp: "はじめまして", vn: "Rất hân hạnh (Lần đầu gặp mặt)" },
  { jp: "わたし", vn: "Tôi" },
  { jp: "にほん", vn: "Nhật Bản" },
  { jp: "がくせい", vn: "Học sinh, sinh viên" },
  { jp: "せんせい", vn: "Giáo viên, giảng viên" },
];

const quizData = {
  title: "Giới thiệu chữ Hán trong tiếng Nhật",
  totalQuestions: 8,
  question: "Chữ Hán có nguồn gốc từ đâu?",
  options: [
    { id: 1, text: "Ấn Độ" },
    { id: 2, text: "Ai Cập" },
    { id: 3, text: "Trung Quốc" },
    { id: 4, text: "Triều Tiên" },
  ],
};

// ----------------------------- COMPONENT CHÍNH -----------------------------
const LessonContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"lesson" | "exercise">("lesson");
  const [contentType, setContentType] = useState<
    "vocab" | "grammar" | "speaking"
  >("vocab");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // ----------------------------- BÀI TẬP -----------------------------
  const renderExerciseContent = () => (
    <div className="w-full p-10 bg-gradient-to-br from-white via-[#f8fdfe] to-[#f2faff] rounded-xl">
      <div className="mb-8">
        <p className="text-xl font-medium text-gray-700 mb-2">
          1/{quizData.totalQuestions}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] h-2.5"
            initial={{ width: 0 }}
            animate={{ width: `${(1 / quizData.totalQuestions) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      <div className="mb-10 space-y-3">
        <p className="text-gray-500 text-sm">{quizData.title}</p>
        <p className="text-gray-400 text-xs">Chọn đáp án đúng</p>
        <h2 className="text-2xl font-semibold text-gray-800 pt-3">
          {quizData.question}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-12">
        {quizData.options.map((option) => (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`p-5 rounded-4xl text-left shadow-sm border-2 transition-all duration-300 
              ${
                selectedOption === option.id
                  ? "bg-[#E0F7FA] border-[#00BCD4] text-[#00BCD4] shadow-lg"
                  : "bg-white border-gray-200 hover:border-[#B2EBF2] text-gray-800"
              }`}
          >
            <span className="font-bold mr-2">{option.id}.</span> {option.text}
          </motion.button>
        ))}
      </div>

      <button
        disabled={selectedOption === null}
        className={`w-full py-4 font-bold text-lg rounded-5xl transition-all duration-300 
          ${
            selectedOption !== null
              ? "bg-gradient-to-r from-[#00BCD4] to-[#26C6DA] text-white shadow-md hover:shadow-xl hover:opacity-95"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
      >
        KIỂM TRA
      </button>
    </div>
  );

  // ----------------------------- BÀI HỌC -----------------------------
  const renderLessonContent = () => {
    const contentButtons = [
      {
        key: "vocab",
        title: "Từ vựng",
        icon: <FaLanguage />,
        color: "text-blue-500",
      },
      {
        key: "grammar",
        title: "Ngữ pháp",
        icon: <FaBookOpen />,
        color: "text-green-500",
      },
      {
        key: "speaking",
        title: "Speaking",
        icon: <FaComments />,
        color: "text-orange-500",
      },
    ];

    const renderContentSection = () => {
      switch (contentType) {
        case "vocab":
          return (
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Từ vựng: 第1課ーはじめて
              </h1>
              <p className="text-gray-600 mb-6">
                Bạn sẽ học các từ vựng cơ bản về chào hỏi, giới thiệu bản thân.
              </p>
              <div className="space-y-4">
                {vocabularyContent.map((word, index) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-[#00BCD4] w-12 text-center">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-xl font-semibold text-gray-900">
                          {word.jp}
                        </p>
                        <p className="text-sm text-gray-500">{word.vn}</p>
                      </div>
                    </div>
                    <button className="text-white bg-[#00BCD4] hover:bg-[#00ACC1] p-3 rounded-full shadow-md transition transform hover:scale-110 duration-300">
                      <FaComments />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        case "grammar":
          return (
            <div className="p-6 text-gray-700">
              <h1 className="text-3xl font-bold mb-3">
                Ngữ pháp: Cấu trúc cơ bản Desu / Desu ka
              </h1>
              <p className="text-gray-600">
                Nội dung chi tiết về ngữ pháp và các ví dụ liên quan...
              </p>
            </div>
          );
        case "speaking":
          return (
            <div className="p-6 text-gray-700">
              <h1 className="text-3xl font-bold mb-3">
                Kỹ năng Nói: Giao tiếp chào hỏi cơ bản
              </h1>
              <p>Các đoạn hội thoại mẫu và công cụ luyện tập...</p>
            </div>
          );
      }
    };

    return (
      <div className="w-full flex-shrink-0">
        {/* Video header */}
        <div className="aspect-video w-full bg-black relative overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/80 to-black/60 text-white p-6">
            <h1 className="text-4xl font-extrabold text-cyan-400 mb-2">
              NHẬP MÔN SƠ CẤP
            </h1>
            <h2 className="text-5xl font-extrabold tracking-wide">CHỮ HÁN</h2>
            <p className="text-xl mt-3 opacity-90">
              Giới thiệu chữ Hán trong tiếng Nhật
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="mt-6 text-white bg-gradient-to-r from-green-400 to-teal-400 p-4 rounded-full shadow-lg"
            >
              <FiVideo className="text-3xl" />
            </motion.button>
            <span className="text-xs absolute bottom-2 left-3 text-gray-400">
              Nguồn: Video bài giảng Fapanese
            </span>
          </div>
        </div>

        {/* Nội dung bài học */}
        <div className="bg-gradient-to-br from-white via-[#f9fdff] to-[#f1fbfc]">
          {renderContentSection()}
        </div>

        {/* Nút chọn mục */}
        {/* <div className="grid grid-cols-3 gap-4 text-center p-6 border-t border-gray-100 bg-white rounded-b-xl">
          {contentButtons.map((item) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              key={item.key}
              onClick={() => setContentType(item.key as any)}
              className={`p-4 rounded-xl font-medium transition-all duration-300 ${
                contentType === item.key
                  ? "bg-gradient-to-r from-[#E0F7FA] to-[#B2EBF2] shadow-lg ring-2 ring-[#00BCD4]"
                  : "bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
              }`}
            >
              {React.cloneElement(item.icon, {
                className: `mx-auto text-3xl ${item.color} mb-2`,
              })}
              {item.title}
            </motion.button>
          ))}
        </div> */}
      </div>
    );
  };

  // ----------------------------- TRẢ VỀ GIAO DIỆN -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#f8fdfe] to-[#e6f7f9] flex justify-center py-20">
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl py-10 px-6">
        {/* CỘT TRÁI */}
        <div className="lg:w-3/4 pr-0 lg:pr-8 space-y-4">
          {/* Thanh chuyển bài học/bài tập */}
          <div className="relative flex justify-between mb-6 w-72 mx-auto bg-gray-200 rounded-full p-1 shadow-inner overflow-hidden">
            <motion.div
              className="absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r from-[#B2EBF2] to-[#80DEEA] shadow-md"
              animate={{
                left: activeTab === "lesson" ? "2%" : "48%",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            {["lesson", "exercise"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative z-10 w-1/2 py-2 text-base font-semibold rounded-full transition-all duration-300 ${
                  activeTab === tab
                    ? "text-[#00838F]"
                    : "text-gray-600 hover:text-[#00BCD4]"
                }`}
              >
                {tab === "lesson" ? "Bài học" : "Bài tập"}
              </button>
            ))}
          </div>

          {/* Hiệu ứng chuyển fade */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-h-[450px]">
            <AnimatePresence mode="wait">
              {activeTab === "lesson" ? (
                <motion.div
                  key="lesson"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {renderLessonContent()}
                </motion.div>
              ) : (
                <motion.div
                  key="exercise"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {renderExerciseContent()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:w-1/4 mt-8 lg:mt-0 bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 space-y-6 border border-gray-100 h-fit sticky top-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài học..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#80DEEA] transition-all"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              Các bài học chữ Hán
            </h3>
            {sidebarLessons.map((lesson, index) => (
              <Link
                key={index}
                to="#"
                className="flex items-start p-3 hover:bg-[#f8fdfe] rounded-lg transition duration-300 group"
              >
                <div className="w-16 h-12 bg-gradient-to-br from-gray-200 to-gray-100 rounded-md flex-shrink-0 relative overflow-hidden shadow-inner">
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                    {lesson.duration}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#00BCD4] transition-colors duration-300">
                    {lesson.title}...
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <FiVideo className="mr-1 text-green-500" />
                    <span>{lesson.type}</span>
                    <span className="ml-3 text-red-500 font-semibold cursor-pointer hover:underline">
                      Tài liệu
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t">
            <button className="w-full py-3 bg-gradient-to-r from-[#80DEEA] to-[#4DD0E1] text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center shadow-md hover:shadow-xl">
              <FaDownload className="mr-2" /> Tải tài liệu bài học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonContentPage;
