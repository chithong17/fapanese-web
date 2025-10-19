import React, { useState, useEffect, useRef } from "react";
// Thêm useNavigate để chuyển hướng
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiCheckCircle } from "react-icons/fi";
// Thêm icon cho Flashcard
import { FaLanguage, FaBookOpen, FaComments, FaClipboardList } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import BannerVocab from "../../assets/1.svg";
import BannerGrammar from "../../assets/2.svg";
import BannerSpeaking from "../../assets/3.svg";
import BannerTest from "../../assets/4.svg";
import { useParams } from "react-router-dom";

import { getVocabulariesByLessonPartId } from "../../api/vocabulary";
// Giữ lại type, giả định đã có
import type { VocabularyResponse } from "../../types/api"; 

// ----------------------------- DỮ LIỆU GIẢ -----------------------------
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
  const { lessonPartId } = useParams();
  const navigate = useNavigate(); // Hook chuyển trang

  const [vocabularyContent, setVocabularyContent] = useState<
    VocabularyResponse[]
  >([]);
  const [loadingVocab, setLoadingVocab] = useState(true);

  const [activeTab, setActiveTab] = useState<"lesson" | "exercise">("lesson");
  const [contentType, setContentType] = useState<
    "vocab" | "grammar" | "speaking" | "test"
  >("vocab");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // === 🆕 STATE MỚI CHO FLASHCARD POP-UP ===
  const [showFlashcardButton, setShowFlashcardButton] = useState(false);
  // Ref cho nội dung Từ vựng để kiểm tra vị trí cuộn
  const vocabContentRef = useRef<HTMLDivElement>(null); 
  // =========================================

  // === 🚀 LOGIC FLOATING NAV BAR (Giữ nguyên) ===
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const navTop = navRef.current.getBoundingClientRect().top;
        setShowFloatingNav(navTop < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // ===================================

  // === 🆕 LOGIC HIỂN THỊ NÚT FLASHCARD ===
  useEffect(() => {
    const checkScrollForFlashcard = () => {
      // 1. Chỉ chạy khi ở đúng tab và loại nội dung
      if (activeTab !== "lesson" || contentType !== "vocab") {
        setShowFlashcardButton(false);
        return;
      }

      if (vocabContentRef.current) {
        const rect = vocabContentRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Điều kiện: 
        // 1. Phần nội dung đã bắt đầu cuộn ra khỏi viewport (top < 0). 
        // 2. Và (rect.bottom < windowHeight * 1.5): nghĩa là người dùng đang cuộn gần cuối nội dung
        // (ví dụ: 1.5 lần chiều cao viewport, bạn có thể điều chỉnh 1.0 đến 2.0 tùy ý)
        const nearBottom = rect.bottom < windowHeight * 1.5;
        
        // Ngược lại, nếu người dùng đã cuộn qua nội dung (bottom < 0), không hiện nữa.
        if (rect.bottom < 0) {
          setShowFlashcardButton(false);
          return;
        }

        setShowFlashcardButton(nearBottom);
      }
    };

    window.addEventListener("scroll", checkScrollForFlashcard);
    checkScrollForFlashcard(); // Chạy lần đầu
    return () => window.removeEventListener("scroll", checkScrollForFlashcard);
  }, [activeTab, contentType]);

  // Reset flashcard button state khi chuyển tab/content type
  useEffect(() => {
    setShowFlashcardButton(false);
  }, [activeTab, contentType]);
  // ===================================

  // === LOGIC CUỘN VÀ TẢI DỮ LIỆU (Giữ nguyên) ===
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (activeTab === "exercise" || contentType !== "test") {
      setSelectedOption(null);
    }
  }, [activeTab, contentType]);

  useEffect(() => {
    const fetchVocabularies = async () => {
      try {
        if (!lessonPartId) return;
        setLoadingVocab(true);
        const res = await getVocabulariesByLessonPartId(Number(lessonPartId));
        setVocabularyContent(Array.isArray(res) ? res : res.result || []);
      } catch (err) {
        console.error("Không thể tải từ vựng:", err);
      } finally {
        setLoadingVocab(false);
      }
    };

    if (activeTab === "lesson" && contentType === "vocab") {
      fetchVocabularies();
    }
  }, [activeTab, contentType, lessonPartId]);

  // === HÀM CHUYỂN TRANG FLASHCARD ===
  const handleGoToFlashcard = () => {
    if (lessonPartId) {
      // Sử dụng `Maps` để chuyển đến trang flashcard.
      // Giả định đường dẫn flashcard là /flashcard/ID
      navigate(`/flashcard/${lessonPartId}`); 
    } else {
      alert("Không tìm thấy ID bài học!");
    }
  };
  // ===================================

  const bannerImage = {
    vocab: BannerVocab,
    grammar: BannerGrammar,
    speaking: BannerSpeaking,
    test: BannerTest,
  }[contentType];

  // ----------------------------- COMPONENT THANH CHUYỂN ĐỔI CHUNG (Giữ nguyên) -----------------------------
  const NavTabButtons = ({ isFloating = false }: { isFloating?: boolean }) => (
    <div
      className={`relative mt-15 flex justify-between w-72 mx-auto bg-gray-200 rounded-full p-1 shadow-inner overflow-hidden ${
        isFloating ? "shadow-2xl" : ""
      }`}
    >
      {/* THANH TRƯỢT MÀU XANH */}
      <motion.div
        className="absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r from-[#B2EBF2] to-[#80DEEA] shadow-md"
        animate={{
          left: activeTab === "lesson" ? "2%" : "48%",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {/* NÚT BẤM (ĐÃ TĂNG Z-INDEX) */}
      {["lesson", "exercise"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab as any)}
          className={`relative z-[20] w-1/2 py-2 text-base font-semibold rounded-full transition-all duration-300 ${
            activeTab === tab
              ? "text-[#00838F]"
              : "text-gray-600 hover:text-[#00BCD4]"
          }`}
        >
          {tab === "lesson" ? "Bài học" : "Bài tập"}
        </button>
      ))}
    </div>
  );

  // ----------------------------- BÀI TẬP (Giữ nguyên) -----------------------------
  const renderExerciseContent = () => (
    // ... (Giữ nguyên nội dung renderExerciseContent)
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


  // ----------------------------- BÀI HỌC (ĐÃ CẬP NHẬT: Thêm ref và nút Flashcard) -----------------------------
  const renderLessonContent = () => {
    const renderContentSection = () => {
      switch (contentType) {
        case "vocab":
          // ⭐⭐⭐ GÁN REF Ở ĐÂY ⭐⭐⭐
          return (
            <div ref={vocabContentRef} className="p-6 relative"> 
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                第1課ーはじめて
              </h1>
              <p className="text-gray-600 mb-6">
                Bạn sẽ học các từ vựng cơ bản về chào hỏi, giới thiệu bản thân.
              </p>
              {loadingVocab ? (
                <p className="text-gray-500 italic text-center py-6">
                  Đang tải từ vựng...
                </p>
              ) : vocabularyContent.length === 0 ? (
                <p className="text-gray-500 italic text-center py-6">
                  Không có từ vựng nào trong phần này.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl shadow-md border border-gray-100">
                  <table className="w-full min-w-[600px] bg-white">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      {/* ... (Giữ nguyên cấu trúc bảng) ... */}
                        <tr>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                                STT
                            </th>
                            <th className="px-10 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Kana
                            </th>
                            <th className="px-10 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Hán tự
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Ý nghĩa
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Romaji
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Âm thanh
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {vocabularyContent.map((word, index) => (
                        <motion.tr
                          key={word.id || index}
                          className="hover:bg-gray-50 transition-colors duration-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="px-4 py-4 text-center text-sm font-bold text-[#00BCD4]">
                            {index + 1}
                          </td>
                          <td className="px-10 py-4">
                            <p className="text-sm font-bold text-gray-900">
                              {word.wordKana}
                            </p>
                          </td>
                          <td className="px-10 py-4">
                            {word.wordKanji ? (
                              <p className="text-sm text-gray-900">
                                {word.wordKanji}
                              </p>
                            ) : (
                              <span className="text-gray-300 text-xl">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {word.meaning}
                          </td>
                          <td className="px-4 py-4">
                            {word.romaji ? (
                              <p className="text-sm text-gray-400">
                                {word.romaji}
                              </p>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="text-white bg-[#00BCD4] hover:bg-[#00ACC1] p-3 rounded-full shadow-md transition transform hover:scale-110 duration-300">
                              <FaComments />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              <h1 className="text-3xl font-bold mb-3">Kiểm tra cuối khóa</h1>
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

  // ----------------------------- TRẢ VỀ GIAO DIỆN CHÍNH (ĐÃ CẬP NHẬT: Thêm nút Flashcard) -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#f8fdfe] to-[#e6f7f9] flex justify-center py-5">
      {/* 🚀 FLOATING NAV BAR - CHỈ HIỆN NÚT VÀ CĂN GIỮA (Giữ nguyên) */}
      <AnimatePresence>
        {showFloatingNav && (
          <motion.div
            key="floating-nav"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999]"
          >
            <NavTabButtons isFloating={true} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ⭐⭐⭐ NÚT POPUP FLASHCARD (NEW) ⭐⭐⭐ */}
      <AnimatePresence>
        {showFlashcardButton && (
          <motion.button
            key="flashcard-button"
            onClick={handleGoToFlashcard}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
            className="fixed bottom-10 right-10 z-[5000] p-4 flex items-center gap-3 bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] text-white font-bold rounded-full shadow-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 transform"
          >
            <FaClipboardList className="text-xl" />
            <span>Ôn tập bằng Flashcard</span>
          </motion.button>
        )}
      </AnimatePresence>
      {/* ⭐⭐⭐ END NÚT POPUP FLASHCARD ⭐⭐⭐ */}

      {/* CONTAINER CHÍNH CỦA TRANG (Giữ nguyên) */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl py-10 px-6">
        {/* CỘT TRÁI (Nội dung chính) */}
        <div className="lg:w-3/4 pr-0 lg:pr-8 space-y-4">
          {/* VỊ TRÍ BAN ĐẦU (Gán Ref để theo dõi cuộn) */}
          <div ref={navRef} className="pb-4">
            <NavTabButtons />
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

        {/* SIDEBAR (Giữ nguyên) */}
        <div className="lg:w-1/4 mt-8 lg:mt-0 bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-6 space-y-6 border border-gray-100 h-fit sticky top-20 transition-all duration-500 z-30">
          {/* ... (Sidebar giữ nguyên) ... */}
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    <FiSearch />
                </span>
                <input
                    type="text"
                    placeholder="Tìm kiếm bài học..."
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#80DEEA] focus:border-[#00BCD4] bg-white/60 placeholder-gray-400 text-gray-700 transition-all duration-300 shadow-sm"
                />
            </div>
            <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 tracking-wide">
                    Bài 1 - はじめて
                </h3>

                {[
                    {
                        type: "Từ vựng",
                        key: "vocab",
                        icon: (
                            <span className="text-gray-500">
                                <FaLanguage />
                            </span>
                        ),
                    },
                    {
                        type: "Ngữ pháp",
                        key: "grammar",
                        icon: (
                            <span className="text-gray-500">
                                <FaBookOpen />
                            </span>
                        ),
                    },
                    {
                        type: "Speaking",
                        key: "speaking",
                        icon: (
                            <span className="text-gray-500">
                                <FaComments />
                            </span>
                        ),
                    },
                    {
                        type: "Kiểm tra cuối khóa",
                        key: "test",
                        icon: (
                            <span className="text-gray-500">
                                <FiCheckCircle />
                            </span>
                        ),
                    },
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
                                contentType === part.key
                                    ? "bg-white shadow-sm scale-105"
                                    : "bg-gray-100"
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