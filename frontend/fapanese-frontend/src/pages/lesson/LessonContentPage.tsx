import React, { useState, useEffect, useRef } from "react";
// Thêm useNavigate để chuyển hướng
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiCheckCircle } from "react-icons/fi";
// Thêm icon cho Flashcard
import {
  FaLanguage,
  FaBookOpen,
  FaComments,
  FaClipboardList,
  FaVolumeUp,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import BannerVocab from "../../assets/1.svg";
import BannerGrammar from "../../assets/2.svg";
import BannerSpeaking from "../../assets/3.svg";
import BannerTest from "../../assets/4.svg";
import { useParams } from "react-router-dom";

import { getVocabulariesByLessonPartId } from "../../api/vocabulary";
// Giữ lại type, giả định đã có
import type { VocabularyResponse } from "../../types/api";
import { getGrammarsByLessonPartId } from "../../api/grammar";
import { getLessonPartsByLesson } from "../../api/lessonPart";
import { getLessonById } from "../../api/lesson";
import { getQuestionsByLessonPartId } from "../../api/question";
import { submitQuizAnswers } from "../../api/quiz";

// ----------------------------- COMPONENT CHÍNH -----------------------------
const LessonContentPage: React.FC = () => {
  const { courseCode, lessonId, lessonPartId } = useParams();
  const navigate = useNavigate(); // Hook chuyển trang
  const [lessonInfo, setLessonInfo] = useState<any>(null);

  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [vocabularyContent, setVocabularyContent] = useState<
    VocabularyResponse[]
  >([]);
  const [loadingVocab, setLoadingVocab] = useState(true);

  const [lessonParts, setLessonParts] = useState<any[]>([]);

  const [grammarContent, setGrammarContent] = useState<any[]>([]);
  const [loadingGrammar, setLoadingGrammar] = useState(true);

  const [activeTab, setActiveTab] = useState<"lesson" | "exercise">("lesson");
  const [contentType, setContentType] = useState<
    "vocab" | "grammar" | "speaking" | "test"
  >("vocab");
  const [selectedOption, setSelectedOption] = useState<number | null>(null); // === 🆕 STATE MỚI CHO FLASHCARD POP-UP ===

  const [showFlashcardButton, setShowFlashcardButton] = useState(false); // Ref cho nội dung Từ vựng để kiểm tra vị trí cuộn
  const vocabContentRef = useRef<HTMLDivElement>(null); // ========================================= // === 🚀 LOGIC FLOATING NAV BAR (Giữ nguyên) ===
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
  }, []); // =================================== // === 🆕 LOGIC HIỂN THỊ NÚT FLASHCARD ===
  useEffect(() => {
    const checkScrollForFlashcard = () => {
      // 1. Chỉ chạy khi ở đúng tab và loại nội dung
      if (activeTab !== "lesson" || contentType !== "vocab") {
        setShowFlashcardButton(false);
        return;
      }

      if (vocabContentRef.current) {
        const rect = vocabContentRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight; // Điều kiện:

        // 1. Phần nội dung đã bắt đầu cuộn ra khỏi viewport (top < 0).
        // 2. Và (rect.bottom < windowHeight * 1.5): nghĩa là người dùng đang cuộn gần cuối nội dung
        // (ví dụ: 1.5 lần chiều cao viewport, bạn có thể điều chỉnh 1.0 đến 2.0 tùy ý)
        const nearBottom = rect.bottom < windowHeight * 5.5; // Ngược lại, nếu người dùng đã cuộn qua nội dung (bottom < 0), không hiện nữa.

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
  }, [activeTab, contentType]); // Reset flashcard button state khi chuyển tab/content type

  useEffect(() => {
    setShowFlashcardButton(false);
  }, [activeTab, contentType]); // =================================== // === LOGIC CUỘN VÀ TẢI DỮ LIỆU (Giữ nguyên) ===
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
  }, [activeTab, contentType, lessonPartId]); // === HÀM CHUYỂN TRANG FLASHCARD ===

  useEffect(() => {
    const fetchLessonParts = async () => {
      try {
        if (!lessonId) return;
        const res = await getLessonPartsByLesson(Number(lessonId));
        setLessonParts(res);
      } catch (err) {
        console.error("Không thể tải lesson parts:", err);
      }
    };
    fetchLessonParts();
  }, [lessonId]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!lessonParts.length) return;

        // 🔍 Lấy đúng lessonPartId theo contentType hiện tại
        const targetPart =
          contentType === "grammar"
            ? lessonParts.find((p) => p.type === "GRAMMAR")
            : lessonParts.find((p) => p.type === "VOCABULARY");

        if (!targetPart?.id) {
          console.warn(
            "⚠️ Không tìm thấy lesson part tương ứng với",
            contentType
          );
          return;
        }

        setLoadingQuestions(true);
        const res = await getQuestionsByLessonPartId(Number(targetPart.id));
        setQuestions(res.result || []);
        console.log("📘 Questions fetched:", res.result);
      } catch (err) {
        console.error("Không thể tải câu hỏi:", err);
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (activeTab === "exercise") {
      fetchQuestions();
    }
  }, [activeTab, contentType, lessonParts]);

  useEffect(() => {
    const fetchLessonInfo = async () => {
      try {
        if (!lessonId) return;
        const res = await getLessonById(Number(lessonId));
        setLessonInfo(res);
      } catch (err) {
        console.error("Không thể tải thông tin bài học:", err);
      }
    };
    fetchLessonInfo();
  }, [lessonId]);

  useEffect(() => {
    const fetchGrammars = async () => {
      try {
        if (!lessonParts.length) return;
        const grammarPart = lessonParts[1]; // lấy thẳng grammar part
        if (!grammarPart?.id) return;

        setLoadingGrammar(true);
        console.log("📘 Fetching grammar by ID:", grammarPart.id);
        const res = await getGrammarsByLessonPartId(Number(grammarPart.id));

        setGrammarContent(Array.isArray(res) ? res : res.result || []);
      } catch (err) {
        console.error("Không thể tải ngữ pháp:", err);
      } finally {
        setLoadingGrammar(false);
      }
    };

    if (activeTab === "lesson" && contentType === "grammar") {
      fetchGrammars();
    }
  }, [activeTab, contentType, lessonParts]);

  const handlePlaySound = (textToSpeak: string) => {
    // 1. Kiểm tra xem trình duyệt có hỗ trợ SpeechSynthesis không
    if ("speechSynthesis" in window) {
      // 2. Tạo một yêu cầu phát âm (utterance)
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // 3. Quan trọng: Đặt ngôn ngữ là tiếng Nhật để phát âm chính xác
      utterance.lang = "ja-JP";

      // 4. Thực hiện phát âm
      window.speechSynthesis.speak(utterance);
    } else {
      // Thông báo nếu trình duyệt không hỗ trợ
      alert("Trình duyệt của bạn không hỗ trợ chức năng phát âm thanh này.");
    }
  };

  const handleSwitchContent = async (type: "vocab" | "grammar") => {
    if (!lessonParts.length) {
      console.warn("⚠️ Chưa tải xong lessonParts");
      return;
    }

    const vocabPart = lessonParts[0];
    const grammarPart = lessonParts[1];

    const targetPartId =
      type === "grammar" ? grammarPart?.id || vocabPart?.id : vocabPart?.id;

    navigate(`/lesson/${courseCode}/${lessonId}/${targetPartId}`, {
      replace: false,
    });

    setContentType(type);
  };

  const handleGoToFlashcard = () => {
    if (lessonPartId) {
      navigate(`/flashcard/${lessonPartId}`);
    } else {
      alert("Không tìm thấy ID bài học!");
    }
  }; // ===================================
  const bannerImage = {
    vocab: BannerVocab,
    grammar: BannerGrammar,
    speaking: BannerSpeaking,
    test: BannerTest,
  }[contentType]; // ----------------------------- COMPONENT THANH CHUYỂN ĐỔI CHUNG (Giữ nguyên) -----------------------------

  const NavTabButtons = ({ isFloating = false }: { isFloating?: boolean }) => (
    <div
      className={`relative mt-15 flex justify-between w-72 mx-auto bg-gray-200 rounded-full p-1 shadow-inner overflow-hidden ${
        isFloating ? "shadow-2xl" : ""
      }`}
    >
            {/* THANH TRƯỢT MÀU XANH */}     {" "}
      <motion.div
        className="absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r from-[#B2EBF2] to-[#80DEEA] shadow-md"
        animate={{
          left: activeTab === "lesson" ? "2%" : "48%",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
            {/* NÚT BẤM (ĐÃ TĂNG Z-INDEX) */}     {" "}
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
                    {tab === "lesson" ? "Bài học" : "Bài tập"}       {" "}
        </button>
      ))}
         {" "}
    </div>
  ); // ----------------------------- BÀI TẬP (Giữ nguyên) -----------------------------

  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex] || null;
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswerSelect = (i: number) => {
    if (!currentQuestion || isAnswered) return;

    setSelectedOption(i);

    // ✅ Lấy giá trị người chọn
    let chosenAnswer = "";
    if (currentQuestion.questionType === "TRUE_FALSE") {
      chosenAnswer = i === 0 ? "True" : "False";
    } else {
      chosenAnswer = currentQuestion[`option${String.fromCharCode(65 + i)}`];
    }

    // ✅ So sánh đúng sai
    let correct = false;

    if (
      currentQuestion.questionType === "MULTIPLE_CHOICE" ||
      currentQuestion.questionType === "TRUE_FALSE"
    ) {
      correct =
        chosenAnswer?.trim().toLowerCase() ===
        currentQuestion.correctAnswer?.trim().toLowerCase();
    } else if (currentQuestion.questionType === "FILL") {
      correct =
        chosenAnswer?.trim().toLowerCase() ===
        currentQuestion.fillAnswer?.trim().toLowerCase();
    }

    setIsAnswered(true);
    setIsCorrect(correct);

    // ✅ Lưu lại kết quả kèm correctAnswer
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      userAnswer: chosenAnswer,
      correctAnswer:
        currentQuestion.questionType === "FILL"
          ? currentQuestion.fillAnswer
          : currentQuestion.correctAnswer,
      isCorrect: correct,
    };
    setUserAnswers(updatedAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (userAnswers.length === 0) {
      alert("Bạn chưa trả lời câu nào!");
      return;
    }

    try {
      // Lọc bỏ null hoặc undefined
      const filteredAnswers = userAnswers
        .filter((a) => a && a.questionId && a.userAnswer)
        .map((a) => ({
          questionId: a.questionId,
          userAnswer: a.userAnswer,
        }));

      console.log("📤 Payload gửi đi:", filteredAnswers);

      const res = await submitQuizAnswers(filteredAnswers);

      console.log("Quiz Result:", res.result.detailedResults); // 🧠 Log để kiểm tra backend trả gì
      setQuizResult(res.result);
    } catch (err) {
      console.error("Lỗi khi nộp bài:", err);
    }
  };

  // 🧠 Hàm nộp bài

  const renderExerciseContent = () => {
    const getOptions = () => {
      return [
        currentQuestion.optionA,
        currentQuestion.optionB,
        currentQuestion.optionC,
        currentQuestion.optionD,
      ].filter(Boolean);
    };

    // Hàm helper để xác định class cho các tùy chọn (được trích từ Question.tsx gốc)
    const getOptionClass = (i: number) => {
      let base =
        "p-5 rounded-4xl text-left shadow-md border-2 transition-all duration-300 transform"; // Thêm shadow-md và transform

      if (isAnswered) {
        const isChosen = selectedOption === i;
        // Trong hàm này, ta không có sẵn getOptions() như Question.tsx,
        // nhưng vì logic của bạn rất dài, ta giả định getOptions() có thể được định nghĩa hoặc
        // ta sử dụng logic trực tiếp cho MULTIPLE_CHOICE:
        const options = getOptions();
        const isCorrectOption =
          options[i]?.trim().toLowerCase() ===
          currentQuestion.correctAnswer?.trim().toLowerCase();

        // TRUE/FALSE logic (xử lý riêng ở dưới cho True/False để tránh phức tạp)

        if (currentQuestion.questionType === "MULTIPLE_CHOICE") {
          if (isChosen && isCorrect) {
            // Chọn đúng
            return `${base} bg-green-100 border-green-500 text-green-800 cursor-default shadow-lg`;
          } else if (isChosen && !isCorrect) {
            // Chọn sai
            return `${base} bg-red-100 border-red-500 text-red-800 cursor-default shadow-lg`;
          } else if (isCorrectOption) {
            // Đáp án đúng (làm nổi bật sau khi trả lời sai)
            return `${base} bg-green-50 border-green-400 text-green-700 cursor-default`;
          } else {
            // Các tùy chọn còn lại sau khi trả lời
            return `${base} bg-gray-50 border-gray-200 text-gray-400 cursor-default`;
          }
        }
        // Nếu không phải Multiple Choice, ta chỉ cần phân biệt đáp án đã chọn (sai) và đáp án đúng.
        else if (currentQuestion.questionType === "TRUE_FALSE") {
          // Logic TRUE_FALSE được xử lý trực tiếp trong JSX của bạn, nên ta chỉ cần giữ logic cho MC ở đây.
          // Để làm đẹp chung, ta vẫn giữ màu sắc như trên:
          return `${base} bg-gray-50 border-gray-200 text-gray-400 cursor-default`;
        }
      } else {
        // Chưa trả lời: Tối ưu hóa hiệu ứng hover
        if (selectedOption === i) {
          return `${base} bg-[#E0F7FA] border-[#00BCD4] text-[#00BCD4] shadow-lg scale-[1.01]`;
        }
        return `${base} bg-white border-gray-200 hover:border-[#00BCD4] text-gray-800 hover:shadow-lg hover:-translate-y-0.5`;
      }
    };

    // --- UI RENDER BẮT ĐẦU ---

    if (loadingQuestions) {
      return (
        <div className="w-full p-12 bg-white shadow-xl rounded-3xl border border-gray-100">
          <p className="text-gray-500 italic text-center py-8">
            Đang tải câu hỏi...
          </p>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="w-full p-12 bg-white shadow-xl rounded-3xl border border-gray-100">
          <p className="text-gray-500 italic text-center py-8">
            Không có câu hỏi nào trong phần này.
          </p>
        </div>
      );
    }

    if (quizResult) {
      return (
        <div className="mt-10 text-center bg-[#E0F7FA]/60 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-[#00796B] mb-3">
            🎉 Bạn đã hoàn thành bài luyện tập!
          </h2>
          <p className="text-gray-700 text-lg mb-2">
            Số câu đúng:{" "}
            <span className="font-bold text-[#0097A7]">
              {quizResult.correctCount}/{quizResult.totalQuestions}
            </span>
          </p>
          <p className="text-gray-700 text-lg mb-6">
            Điểm số:{" "}
            <span className="font-bold text-[#00ACC1]">
              {quizResult.scorePercentage}%
            </span>
          </p>

          <button
            onClick={() => {
              // Làm lại bài
              setQuizResult(null);
              setCurrentQuestionIndex(0);
              setIsAnswered(false);
              setIsCorrect(null);
              setSelectedOption(null);
              setUserAnswers([]);
            }}
            className="mt-4 px-6 py-3 rounded-lg bg-gradient-to-r from-[#00BCD4] to-[#26C6DA] text-white font-semibold hover:shadow-lg transition-all"
          >
            🔄 Làm lại bài
          </button>
        </div>
      );
    }

    // Giả định logic hiển thị kết quả quiz được đặt ở ngoài hoặc sử dụng hàm riêng.
    // Ta chỉ tập trung vào việc render câu hỏi.

    return (
      <div className="w-full p-8 md:p-12 bg-white shadow-2xl rounded-3xl border border-gray-100">
        {/* Thanh tiến độ + điều hướng */}
        <div className="mb-8">
          {/* Tiêu đề tiến độ được làm rõ nét và sang trọng hơn */}
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-bold text-[#00796B] tracking-wider">
              TIẾN ĐỘ BÀI TẬP
            </p>
            <p className="text-2xl font-extrabold text-gray-800">
              {currentQuestionIndex + 1} / {questions.length}
            </p>
          </div>

          {/* Thanh tiến độ với đổ bóng và màu gradient hiện đại */}
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* Nút Điều hướng: Thêm hiệu ứng hover, shadow, và làm tròn */}
          <div className="flex justify-between mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentQuestionIndex === 0}
              onClick={() => {
                setCurrentQuestionIndex((prev) => prev - 1);
                setSelectedOption(null);
                setIsAnswered(false);
                setIsCorrect(null);
              }}
              className={`px-8 py-3 rounded-full font-semibold transition-all shadow-md ${
                currentQuestionIndex === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#B2EBF2] hover:bg-[#80DEEA] text-gray-800"
              }`}
            >
              ◀ Câu trước
            </motion.button>

            {currentQuestionIndex < questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentQuestionIndex((prev) => prev + 1);
                  setSelectedOption(null);
                  setIsAnswered(false);
                  setIsCorrect(null);
                }}
                className="px-8 py-3 rounded-full font-semibold bg-[#00BCD4] hover:bg-[#0097A7] text-white shadow-lg"
              >
                Câu tiếp theo ▶
              </motion.button>
            ) : (
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 15px rgba(0, 188, 212, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitQuiz}
                className="px-8 py-3 rounded-full font-bold bg-gradient-to-r from-[#00BCD4] to-[#26C6DA] text-white text-lg shadow-xl"
              >
                HOÀN THÀNH 🚀
              </motion.button>
            )}
          </div>
        </div>

        {/* Câu hỏi (Chi tiết) */}
        {currentQuestion && (
          <div className="text-center mt-10">
            <h3 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-4 border-gray-100">
              Câu {currentQuestionIndex + 1}
            </h3>

            {/* Metadata */}
            <p className="text-[#00BCD4] text-sm font-semibold uppercase mb-1 tracking-wider">
              {currentQuestion.category}
            </p>
            <p className="text-gray-500 text-xs mb-6 font-medium italic">
              {currentQuestion.questionType === "MULTIPLE_CHOICE"
                ? "Chọn đáp án đúng"
                : currentQuestion.questionType === "TRUE_FALSE"
                ? "Chọn Đúng hoặc Sai"
                : "Điền đáp án của bạn"}
            </p>

            <p className="text-2xl font-bold text-gray-800 mb-10 p-4 bg-gray-50 rounded-xl shadow-inner">
              {currentQuestion.content}
            </p>

            {/* MULTIPLE CHOICE: Sử dụng getOptionClass và motion cho hiệu ứng */}
            {currentQuestion.questionType === "MULTIPLE_CHOICE" && (
              <div className="grid grid-cols-2 gap-6 mb-12">
                {getOptions().map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: isAnswered ? 1.0 : 1.02 }}
                    whileTap={{ scale: isAnswered ? 1.0 : 0.98 }}
                    onClick={() => handleAnswerSelect(i)}
                    disabled={isAnswered}
                    // Sử dụng getOptionClass để áp dụng style sang trọng/kết quả
                    className={getOptionClass(i) + " font-medium"}
                  >
                    <span className="font-bold mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt}
                  </motion.button>
                ))}
              </div>
            )}

            {/* FILL TYPE: Tối ưu hóa input */}
            {currentQuestion.questionType === "FILL" && (
              <div className="mt-6 mb-10">
                <input
                  key={currentQuestion.id} // 💡 thêm dòng này để reset khi đổi câu
                  type="text"
                  placeholder="Nhập đáp án và nhấn Enter..."
                  disabled={isAnswered}
                  autoFocus // ✨ tự focus mỗi khi sang câu mới
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isAnswered) {
                      e.preventDefault(); // 🔒 chặn hành vi mặc định của Enter

                      const value = e.currentTarget.value.trim();
                      if (!value) return;

                      let correct = false;

                      if (currentQuestion.fillAnswer) {
                        correct =
                          value.trim().toLowerCase() ===
                          currentQuestion.fillAnswer.trim().toLowerCase();
                      } else {
                        correct =
                          value.trim().toLowerCase() ===
                          currentQuestion.correctAnswer?.trim().toLowerCase();
                      }

                      setIsAnswered(true);
                      setIsCorrect(correct);

                      const updatedAnswers = [...userAnswers];
                      updatedAnswers[currentQuestionIndex] = {
                        questionId: currentQuestion.id,
                        userAnswer: value,
                        correctAnswer:
                          currentQuestion.fillAnswer ||
                          currentQuestion.correctAnswer,
                        isCorrect: correct,
                      };
                      setUserAnswers(updatedAnswers);

                      e.currentTarget.blur();
                    }
                  }}
                  className={`w-full border-4 rounded-xl px-6 py-4 text-gray-800 text-lg shadow-lg transition-all ${
                    isAnswered
                      ? "border-gray-300 bg-gray-100 cursor-default"
                      : "border-gray-200 focus:border-[#00BCD4] focus:ring-4 focus:ring-[#B2EBF2] outline-none"
                  }`}
                />
              </div>
            )}

            {/* TRUE/FALSE: Tối ưu hóa button */}
            {currentQuestion.questionType === "TRUE_FALSE" && (
              <div className="flex gap-6 mt-6 mb-10">
                {["True", "False"].map((val, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: isAnswered ? 1.0 : 1.03 }}
                    whileTap={{ scale: isAnswered ? 1.0 : 0.97 }}
                    disabled={isAnswered}
                    onClick={() => handleAnswerSelect(i)}
                    className={`flex-1 py-5 rounded-full text-center border-2 font-bold transition-all shadow-lg ${
                      isAnswered
                        ? val.toLowerCase() ===
                          currentQuestion.correctAnswer?.toLowerCase()
                          ? "bg-green-100 border-green-500 text-green-800 cursor-default" // Đáp án đúng
                          : selectedOption === i
                          ? "bg-red-100 border-red-500 text-red-800 cursor-default" // Đáp án sai đã chọn
                          : "bg-gray-50 border-gray-200 text-gray-400 cursor-default" // Các đáp án khác
                        : selectedOption === i
                        ? "bg-[#E0F7FA] border-[#00BCD4] text-[#00BCD4] shadow-xl"
                        : "bg-white border-gray-200 hover:border-[#00BCD4] hover:text-gray-900 hover:shadow-xl"
                    }`}
                  >
                    {val}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Hiển thị đáp án: Sử dụng motion và màu sắc tinh tế hơn */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: "tween" }} // Hiệu ứng mượt (tween)
                className={`mt-10 p-8 rounded-2xl text-center font-bold text-xl shadow-2xl transition-all duration-500 
            // Loại bỏ hoàn toàn border
            
            ${
              isCorrect
                ? // Màu xanh lá cây Tinh tế, Chuyên nghiệp
                  "bg-green-50 text-green-700 shadow-green-300/50"
                : // Màu đỏ Rõ ràng, Nghiêm túc
                  "bg-red-50 text-red-700 shadow-red-300/50"
            }`}
              >
                {isCorrect ? (
                  // Nội dung Chính xác (Rõ ràng và Nổi bật)
                  <>
                    <p className="text-2xl mb-2 font-extrabold text-green-800">
                      CHÍNH XÁC TUYỆT VỜI!
                    </p>
                    <span className="font-medium text-lg text-gray-600">
                      Bạn đã hiểu rõ kiến thức này.
                    </span>
                  </>
                ) : (
                  <>
                    <p className="text-2xl mb-2 font-extrabold text-red-800">
                      RẤT TIẾC, CHƯA CHÍNH XÁC.
                    </p>
                    <div className="text-lg font-medium text-gray-700 mt-4 pt-4 border-t border-red-200/50">
                      Đáp án đúng:
                      <span className="font-extrabold text-gray-900 ml-2 block sm:inline">
                        {currentQuestion.fillAnswer ||
                          currentQuestion.correctAnswer}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ----------------------------- BÀI HỌC (ĐÃ CẬP NHẬT: Thêm ref và nút Flashcard) -----------------------------

  const renderLessonContent = () => {
    const renderContentSection = () => {
      switch (contentType) {
        case "vocab": // ⭐⭐⭐ GÁN REF Ở ĐÂY ⭐⭐⭐
          return (
            <div ref={vocabContentRef} className="p-6 relative">
                           {" "}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                第1課ーはじめて              {" "}
              </h1>
                           {" "}
              <p className="text-gray-600 mb-6">
                                Bạn sẽ học các từ vựng cơ bản về chào hỏi, giới
                thiệu bản thân.              {" "}
              </p>
                           {" "}
              {loadingVocab ? (
                <p className="text-gray-500 italic text-center py-6">
                                    Đang tải từ vựng...                {" "}
                </p>
              ) : vocabularyContent.length === 0 ? (
                <p className="text-gray-500 italic text-center py-6">
                                    Không có từ vựng nào trong phần này.        
                         {" "}
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl shadow-md border border-gray-100">
                                   {" "}
                  <table className="w-full min-w-[600px] bg-white">
                                       {" "}
                    <thead className="bg-gray-50 border-b border-gray-200">
                                           {" "}
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
                                         {" "}
                    </thead>
                                       {" "}
                    <tbody className="divide-y divide-gray-100">
                                           {" "}
                      {vocabularyContent.map((word, index) => (
                        <motion.tr
                          key={word.id || index}
                          className="hover:bg-gray-50 transition-colors duration-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                                                   {" "}
                          <td className="px-4 py-4 text-center text-sm font-bold text-[#00BCD4]">
                                                        {index + 1}             
                                       {" "}
                          </td>
                                                   {" "}
                          <td className="px-10 py-4">
                                                       {" "}
                            <p className="text-sm font-bold text-gray-900">
                                                            {word.wordKana}     
                                                   {" "}
                            </p>
                                                     {" "}
                          </td>
                                                   {" "}
                          <td className="px-10 py-4">
                                                       {" "}
                            {word.wordKanji ? (
                              <p className="text-sm text-gray-900">
                                                                {word.wordKanji}
                                                             {" "}
                              </p>
                            ) : (
                              <span className="text-gray-300 text-xl">—</span>
                            )}
                                                     {" "}
                          </td>
                                                   {" "}
                          <td className="px-6 py-4 text-sm text-gray-600">
                                                        {word.meaning}         
                                           {" "}
                          </td>
                                                   {" "}
                          <td className="px-4 py-4">
                                                       {" "}
                            {word.romaji ? (
                              <p className="text-sm text-gray-400">
                                                                {word.romaji}   
                                                         {" "}
                              </p>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                                                     {" "}
                          </td>
                                                   {" "}
                          <td className="px-6 py-4 text-center">
                                                       {" "}
                            <button
                              className="text-white bg-[#00BCD4] hover:bg-[#00ACC1] p-3 rounded-full shadow-md transition transform hover:scale-110 duration-300"
                              onClick={() => handlePlaySound(word.wordKana)}
                            >
                                                            <FaVolumeUp />     
                                                   {" "}
                            </button>
                                                     {" "}
                          </td>
                                                 {" "}
                        </motion.tr>
                      ))}
                                         {" "}
                    </tbody>
                                     {" "}
                  </table>
                                 {" "}
                </div>
              )}
                         {" "}
            </div>
          );
        case "grammar":
          // Giữ nguyên các màu sắc ban đầu để tuân thủ yêu cầu
          const PRIMARY_TEAL = "text-[#00ACC1]";
          const STRUCTURE_GREEN = "text-[#00796B]";
          const EXAMPLE_BG_LIGHT = "bg-[#E0F7FA]";
          const BORDER_TEAL = "border-[#00ACC1]";

          return (
            <div className="p-10 lg:p-14 space-y-12 bg-gray-50 min-h-screen">
              <div className="max-w-4xl mx-auto">
                {/* TIÊU ĐỀ CHÍNH - Lớn, đậm, và có đường phân cách rõ ràng */}
                <h1
                  className={`text-4xl lg:text-4xl font-extrabold text-gray-900 pb-3 mb-10 
                       border-b-4 ${BORDER_TEAL} tracking-tight`}
                >
                  Ngữ pháp - Bài học {lessonPartId}
                </h1>

                {/* CÁC TRẠNG THÁI */}
                {loadingGrammar ? (
                  <p className="italic text-gray-600 text-center py-12 text-xl animate-pulse">
                    <span className="inline-block mr-3">⏳</span> Đang tải ngữ
                    pháp...
                  </p>
                ) : grammarContent.length === 0 ? (
                  <p className="italic text-gray-500 text-center py-12 text-lg">
                    Phần này không có nội dung ngữ pháp.
                  </p>
                ) : (
                  /* DANH SÁCH NGỮ PHÁP */
                  <div className="space-y-10">
                    {grammarContent.map((grammar, index) => (
                      <motion.div
                        key={grammar.id || index}
                        // Thẻ ngữ pháp: Shadows tinh tế hơn và hiệu ứng tương tác cao cấp
                        className="bg-white rounded-3xl p-8 shadow-xl ring-1 ring-gray-100 
                           hover:shadow-2xl hover:ring-2 hover:ring-[#00ACC1]/50 
                           hover:translate-y-[-2px] transition-all duration-500 ease-out"
                        initial={{ opacity: 0, y: 40 }}
                        // Dùng type: "spring" cho animation mượt mà
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.08,
                          type: "spring",
                          stiffness: 120,
                          damping: 18,
                        }}
                      >
                        {/* TIÊU ĐỀ NGỮ PHÁP */}
                        <h2
                          className={`text-3xl font-bold ${PRIMARY_TEAL} border-b border-gray-100 pb-3 mb-5`}
                        >
                          {grammar.title}
                        </h2>
                        <p className="text-gray-700 mb-6 leading-relaxed text-base">
                          {grammar.explanation}
                        </p>

                        {/* CHI TIẾT NGỮ PHÁP */}
                        {grammar.details?.map((detail: any, idx: number) => (
                          <div
                            key={idx}
                            // Đường phân cách dày và rõ ràng hơn
                            className="border-t border-gray-200 pt-6 mt-6 space-y-4"
                          >
                            {/* CẤU TRÚC */}
                            <p className="font-semibold text-gray-800 flex items-center">
                              {/* Icon trực quan hóa cấu trúc */}
                              <svg
                                className={`w-5 h-5 mr-3 ${STRUCTURE_GREEN}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                ></path>
                              </svg>
                              Cấu trúc:{" "}
                              {/* Cấu trúc được làm nổi bật như một khối code */}
                              <span
                                className={`ml-3 ${STRUCTURE_GREEN} font-mono ${EXAMPLE_BG_LIGHT} px-3 py-1 rounded-lg text-1xl shadow-inner`}
                              >
                                {detail.structure}
                              </span>
                            </p>

                            {/* NGHĨA */}
                            <p className="text-gray-600">
                              Ý nghĩa:{" "}
                              <span className="font-medium text-gray-800">
                                {detail.meaning}
                              </span>
                            </p>

                            {/* KHỐI VÍ DỤ NỔI BẬT */}
                            <div
                              className={`${EXAMPLE_BG_LIGHT} rounded-xl p-5 border-l-4 ${BORDER_TEAL} shadow-md`}
                            >
                              <p className="whitespace-pre-line text-lg font-medium text-gray-900">
                                {detail.exampleSentence}
                              </p>
                              <p className="text-gray-500 text-sm mt-3 border-t border-gray-200 pt-2">
                                <span className="font-bold">Dịch nghĩa:</span>{" "}
                                {detail.exampleMeaning}
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
      }
    };

    return (
      <div className="w-full flex-shrink-0">
                {/* Banner đổi theo contentType */}       {" "}
        <div className="aspect-video w-full -mt-10 relative overflow-hidden rounded-t-xl">
                   {" "}
          <motion.img
            key={bannerImage}
            src={bannerImage}
            alt={contentType}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
                 {" "}
        </div>
                {/* Nội dung bài học */}       {" "}
        <div className="bg-gradient-to-br from-white via-[#f9fdff] to-[#f1fbfc]">
                    {renderContentSection()}       {" "}
        </div>
             {" "}
      </div>
    );
  }; // ----------------------------- TRẢ VỀ GIAO DIỆN CHÍNH (ĐÃ CẬP NHẬT: Thêm nút Flashcard) -----------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#f8fdfe] to-[#e6f7f9] flex justify-center py-5">
            {/* 🚀 FLOATING NAV BAR - CHỈ HIỆN NÚT VÀ CĂN GIỮA (Giữ nguyên) */} 
         {" "}
      <AnimatePresence>
               {" "}
        {showFloatingNav && (
          <motion.div
            key="floating-nav"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-5 left-150 transform -translate-x-1/2 z-[9999]"
          >
                        <NavTabButtons isFloating={true} />         {" "}
          </motion.div>
        )}
             {" "}
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
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: 0.1,
            }}
            className="fixed bottom-10 right-10 z-[5000] p-4 flex items-center gap-3 bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] text-white font-bold rounded-full shadow-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 transform"
          >
            <FaClipboardList className="text-xl" />
            <span>Ôn tập bằng Flashcard</span>
          </motion.button>
        )}
      </AnimatePresence>
      {/* ⭐⭐⭐ END NÚT POPUP FLASHCARD ⭐⭐⭐ */}     {" "}
      {/* CONTAINER CHÍNH CỦA TRANG (Giữ nguyên) */}     {" "}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl py-10 px-6">
                {/* CỘT TRÁI (Nội dung chính) */}       {" "}
        <div className="lg:w-3/4 pr-0 lg:pr-8 space-y-4">
                    {/* VỊ TRÍ BAN ĐẦU (Gán Ref để theo dõi cuộn) */}         {" "}
          <div ref={navRef} className="pb-4">
                        <NavTabButtons />         {" "}
          </div>
                    {/* Nội dung chính */}         {" "}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-h-[450px] -mt-10">
                       {" "}
            <AnimatePresence mode="wait">
                           {" "}
              {activeTab === "lesson" ? (
                <motion.div
                  key="lesson"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                                    {renderLessonContent()}               {" "}
                </motion.div>
              ) : (
                <motion.div
                  key="exercise"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                                    {renderExerciseContent()}               {" "}
                </motion.div>
              )}
                         {" "}
            </AnimatePresence>
                     {" "}
          </div>
                 {" "}
        </div>
                {/* SIDEBAR (Giữ nguyên) */}       {" "}
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
              {lessonInfo
                ? lessonInfo.lessonTitle?.trim().startsWith("Bài")
                  ? lessonInfo.lessonTitle
                  : `Bài ${lessonInfo.id} - ${lessonInfo.lessonTitle}`
                : `Bài ${lessonId}`}
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
            ].map((part, idx) => (
              <Link
                key={idx}
                to="#"
                onClick={() => handleSwitchContent(part.key as any)}
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
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default LessonContentPage;
