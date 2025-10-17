import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiCheckCircle } from "react-icons/fi";
import { FaLanguage, FaBookOpen, FaComments } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// 🖼️ Import 4 ảnh SVG (tùy bạn đổi đường dẫn cho đúng)
import BannerVocab from "../../assets/1.svg";
import BannerGrammar from "../../assets/2.svg";
import BannerSpeaking from "../../assets/3.svg";
import BannerTest from "../../assets/4.svg";

// ----------------------------- DỮ LIỆU GIẢ -----------------------------
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
    "vocab" | "grammar" | "speaking" | "test"
  >("vocab");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // 🖼️ Đổi banner dựa trên contentType
  const bannerImage = {
    vocab: BannerVocab,
    grammar: BannerGrammar,
    speaking: BannerSpeaking,
    test: BannerTest,
  }[contentType];

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
        className={`w-full py-4 font-bold text-lg transition-all duration-300 rounded-4xl
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
    const renderContentSection = () => {
      switch (contentType) {
        case "vocab":
          return (
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                第1課ーはじめて
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
                Speaking: Giao tiếp chào hỏi cơ bản
              </h1>
              <p>Các đoạn hội thoại mẫu và công cụ luyện tập...</p>
            </div>
          );
        case "test":
          return (
            <div className="p-6 text-gray-700">
              <h1 className="text-3xl font-bold mb-3">
                Kiểm tra cuối khóa
              </h1>
              <p>Bài kiểm tra tổng hợp kiến thức đã học trong chương này.</p>
            </div>
          );
      }
    };

    return (
      <div className="w-full flex-shrink-0">
        {/* Banner đổi theo contentType */}
        <div className="aspect-video w-full bg-black relative overflow-hidden rounded-t-xl">
          <motion.img
            key={bannerImage}
            src={bannerImage}
            alt={contentType}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        </div>

        {/* Nội dung bài học */}
        <div className="bg-gradient-to-br from-white via-[#f9fdff] to-[#f1fbfc]">
          {renderContentSection()}
        </div>
      </div>
    );
  };

  // ----------------------------- TRẢ VỀ GIAO DIỆN -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#f8fdfe] to-[#e6f7f9] flex justify-center py-20">
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl py-10 px-6">
        {/* CỘT TRÁI */}
        <div className="lg:w-3/4 pr-0 lg:pr-8 space-y-4">
          {/* Thanh chuyển Bài học / Bài tập */}
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

          {/* Nội dung chính */}
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
<div className="lg:w-1/4 mt-8 lg:mt-0 bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-6 space-y-6 border border-gray-100 h-fit sticky top-4 transition-all duration-500">
  {/* Ô tìm kiếm */}
  <div className="relative">
    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
    <input
      type="text"
      placeholder="Tìm kiếm bài học..."
      className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#80DEEA] focus:border-[#00BCD4] bg-white/60 placeholder-gray-400 text-gray-700 transition-all duration-300 shadow-sm"
    />
  </div>

  {/* Danh sách học phần */}
  <div className="space-y-5">
    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 tracking-wide">
      Bài 1 - はじめて
    </h3>

    {[
      { type: "Từ vựng", key: "vocab", icon: <FaLanguage className="text-gray-500" /> },
      { type: "Ngữ pháp", key: "grammar", icon: <FaBookOpen className="text-gray-500" /> },
      { type: "Speaking", key: "speaking", icon: <FaComments className="text-gray-500" /> },
      { type: "Kiểm tra cuối khóa", key: "test", icon: <FiCheckCircle className="text-gray-500" /> },
    ].map((part, idx) => (
      <Link
        key={idx}
        to="#"
        onClick={() => setContentType(part.key as any)}
        className={`flex items-center gap-4 p-4 rounded-2xl border border-transparent transition-all duration-300 group ${
          contentType === part.key
            ? "bg-gradient-to-r from-[#E0F7FA] to-[#B2EBF2] shadow-lg border-[#B2EBF2]"
            : "hover:bg-gray-50 hover:shadow-md"
        }`}
      >
        <div
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-transform duration-300 ${
            contentType === part.key ? "bg-white shadow-sm scale-105" : "bg-gray-100"
          }`}
        >
          {React.cloneElement(part.icon, {
            className: `text-xl transition-colors duration-300 ${
              contentType === part.key
                ? "text-[#00ACC1]"
                : "text-gray-500 group-hover:text-[#00BCD4]"
            }`,
          })}
        </div>

        <div className="flex-1">
          <p
            className={`text-[15px] font-medium tracking-wide transition-colors duration-300 ${
              contentType === part.key
                ? "text-[#0097A7]"
                : "text-gray-800 group-hover:text-[#00BCD4]"
            }`}
          >
            {part.type}
          </p>
          <p className="text-xs text-gray-500 group-hover:text-[#00ACC1] mt-1 cursor-pointer hover:underline">
            Tài liệu
          </p>
        </div>
      </Link>
    ))}
  </div>
</div>

      </div>
    </div>
  );
};

export default LessonContentPage;
