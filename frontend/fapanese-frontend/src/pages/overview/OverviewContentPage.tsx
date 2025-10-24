import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOverviewPartsByOverview } from "../../api/overviewPart";
import { getSpeakingExamsByPartId } from "../../api/speakingExam";
import { getMiddleExamsByPartId } from "../../api/middleExam";
import { getFinalExamsByPartId } from "../../api/finalExam";
import { IoMdArrowBack } from "react-icons/io";
import NotificationModal from "../../components/NotificationModal"; // Đảm bảo bạn có component này

// --- IMPORT HELPER COMPONENTS ---
import PassageViewer from "../../components/PassageViewer";
import QuestionViewer from "../../components/QuestionViewer";
import { submitQuizAnswers } from "../../api/quiz";

// --- Định nghĩa Interfaces ---
interface OverviewPart {
  id: number;
  overviewId: number;
  title: string;
  type: "SPEAKING" | "MIDDLE_EXAM" | "FINAL_EXAM" | string;
}

interface SpeakingQuestion {
  id: number;
  question: string;
  questionRomaji?: string;
  questionMeaning?: string;
  answer?: string;
  answerRomaji?: string;
  answerMeaning?: string;
}

interface SpeakingItem {
  id: number;
  topic: string;
  speakingType: "PASSAGE" | "PICTURE" | "QUESTION";
  passage?: string;
  passageRomaji?: string;
  passageMeaning?: string;
  description?: string;
  imgUrl?: string;
  speakingQuestions: SpeakingQuestion[];
}

interface SpeakingGroup {
  id: number;
  overviewPartId: number;
  title: string;
  type: string;
  description?: string;
  speakings: SpeakingItem[];
}

// Interface cho câu hỏi Exam
interface ExamQuestion {
  id: number;
  content: string;
  category: string;
  questionType: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
}

// Interface cho đề Exam (ME/FE)
interface Exam {
  id: number;
  overviewPartId?: number; // Có thể có hoặc không tùy API ME/FE
  examTitle: string;
  semester: string;
  type: string;
  year: number;
  questions: ExamQuestion[];
}

const OverviewContentPage: React.FC = () => {
  const { courseCode, overviewId, partId } = useParams();
  const navigate = useNavigate();

  const [sidebarParts, setSidebarParts] = useState<OverviewPart[]>([]);
  const [contentGroups, setContentGroups] = useState<any[]>([]); // Sẽ chứa SpeakingGroup[] hoặc Exam[]
  const [currentPartType, setCurrentPartType] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State cho phần làm bài trắc nghiệm ---
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  // --- 1. Tải Sidebar Menu ---
  useEffect(() => {
    const fetchSidebarParts = async () => {
      if (!overviewId) return;
      try {
        const partsData = await getOverviewPartsByOverview(Number(overviewId));
        setSidebarParts(partsData || []);
      } catch (err) {
        console.error("Failed to fetch sidebar parts:", err);
        setError("Không thể tải danh mục ôn tập.");
      }
    };
    fetchSidebarParts();
  }, [overviewId]);

  // --- 2. Tải Nội dung ---
  useEffect(() => {
    const fetchContentGroups = async () => {
      if (!partId || sidebarParts.length === 0) return;

      const currentPart = sidebarParts.find((p) => p.id === Number(partId));

      if (!currentPart) {
        if (sidebarParts.length > 0) {
          navigate(
            `/overview/${courseCode}/${overviewId}/${sidebarParts[0].id}`
          );
        }
        return;
      }

      setLoading(true);
      setError(null);
      setCurrentPartType(currentPart.type);
      setSelectedGroupId(null);

      try {
        let contentData;
        switch (currentPart.type) {
          case "SPEAKING":
            contentData = await getSpeakingExamsByPartId(Number(partId));
            break;
          case "MIDDLE_EXAM":
            contentData = await getMiddleExamsByPartId(Number(partId));
            break;
          case "FINAL_EXAM":
            contentData = await getFinalExamsByPartId(Number(partId));
            break;
          default:
            throw new Error("Loại nội dung không xác định.");
        }
        setContentGroups(contentData || []);
      } catch (err: any) {
        console.error("Failed to fetch content:", err);
        setError(err.response?.data?.message || "Lỗi khi tải nội dung.");
      } finally {
        setLoading(false);
      }
    };

    fetchContentGroups();
  }, [partId, sidebarParts, overviewId, courseCode, navigate]);

  // --- Các hàm Hiển thị (Render) nội dung ---

  // A. Render CHI TIẾT 1 nhóm SPEAKING
  const renderSpeakingDetail = (group: SpeakingGroup) => (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-cyan-700 mb-4 pb-2 border-b">
        {group.title}
      </h2>
      {group.description && (
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          {group.description}
        </p>
      )}
      <div className="space-y-6 sm:space-y-8">
        {" "}
        {/* Tăng khoảng cách */}
        {group.speakings.map((item: SpeakingItem) => (
          <div
            key={item.id}
            className="border p-3 sm:p-4 rounded-md bg-gray-50 shadow-sm"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
              {item.topic || `Bài tập ${item.id}`}
            </h3>

            {item.speakingType === "PASSAGE" && item.passage && (
              <PassageViewer
                passage={item.passage}
                romaji={item.passageRomaji}
                meaning={item.passageMeaning}
              />
            )}

            {item.speakingType === "PICTURE" && item.imgUrl && (
              <div className="mt-2 space-y-4">
                <img
                  src={item.imgUrl}
                  alt={item.topic}
                  className="max-w-md w-full rounded-lg shadow-md border"
                />
                {item.speakingQuestions &&
                  item.speakingQuestions.length > 0 && (
                    <div className="mt-4 border-t pt-2">
                      <h4 className="font-semibold mb-1 text-gray-700 text-sm">
                        Câu hỏi:
                      </h4>
                      <div className="space-y-1">
                        {item.speakingQuestions.map((q: SpeakingQuestion) => (
                          <QuestionViewer
                            key={q.id}
                            question={q.question}
                            romaji={q.questionRomaji}
                            meaning={q.questionMeaning}
                            answer={q.answer}
                            answerRomaji={q.answerRomaji}
                            answerMeaning={q.answerMeaning}
                            isSuggestion={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {item.speakingType === "QUESTION" &&
              item.speakingQuestions &&
              item.speakingQuestions.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <h4 className="font-semibold mb-1 text-gray-700 text-sm">
                    Câu hỏi:
                  </h4>
                  <div className="space-y-1">
                    {item.speakingQuestions.map((q: SpeakingQuestion) => (
                      <QuestionViewer
                        key={q.id}
                        question={q.question}
                        romaji={q.questionRomaji}
                        meaning={q.questionMeaning}
                        answer={q.answer}
                        answerRomaji={q.answerRomaji}
                        answerMeaning={q.answerMeaning}
                        isSuggestion={true}
                      />
                    ))}
                  </div>
                </div>
              )}

            {item.description && (
              <p className="text-xs text-gray-500 mt-3 italic bg-yellow-50 p-2 rounded border border-yellow-200">
                💡 {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // B. Render CHI TIẾT 1 Đề thi (Middle/Final)
  const renderExamDetail = (exam: Exam) => {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
        {/* --- Tiêu đề đề thi --- */}
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 mb-4 pb-2 border-b">
          {exam.examTitle} ({exam.semester} - {exam.year})
        </h2>

        {/* --- Hiển thị kết quả nếu đã nộp --- */}
        {isSubmitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center shadow-sm">
            <h3 className="font-bold text-green-700 mb-2">
              🎯 Kết quả của bạn
            </h3>
            <p className="text-gray-700 font-medium">
              Điểm:{" "}
              <span className="font-bold text-green-800">
                {submitResult?.scorePercentage.toFixed(2)}%
              </span>{" "}
              ({submitResult?.correctCount}/{submitResult?.totalQuestions})
            </p>
          </div>
        )}

        {/* --- Danh sách câu hỏi --- */}
        <div className="space-y-5 sm:space-y-6">
          {exam.questions.map((q: ExamQuestion, index: number) => {
            const selected = userAnswers[q.id];
            const result = submitResult?.detailedResults?.find(
              (r: any) => r.questionId === q.id
            );

            return (
              <div
                key={q.id}
                className="border p-4 rounded-md bg-gray-50 shadow-sm transition-all duration-200"
              >
                {/* Số thứ tự câu hỏi */}
                <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                  Câu {index + 1}:
                </p>

                {/* Nội dung câu hỏi */}
                <p
                  className="text-gray-700 mb-3 text-sm sm:text-base"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {q.content}
                </p>

                {/* Các lựa chọn đáp án */}
                <div className="space-y-1 text-sm text-gray-700">
                  {["A", "B", "C", "D"].map((opt) => {
                    const value = (q as any)[`option${opt}`];
                    if (!value) return null;

                    // So sánh theo nội dung thật, không theo A/B/C/D
                    const isUserSelected = selected === value;
                    const isCorrect = result && result.correctAnswer === value;

                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 cursor-pointer p-1 rounded 
                      ${
                        isSubmitted
                          ? isCorrect
                            ? "bg-green-50 border border-green-300"
                            : isUserSelected
                            ? "bg-red-50 border border-red-300"
                            : ""
                          : "hover:bg-gray-100"
                      }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={value}
                          checked={selected === value}
                          disabled={isSubmitted} // khóa sau khi nộp
                          onChange={() =>
                            setUserAnswers((prev) => ({
                              ...prev,
                              [q.id]: value, // ✅ lưu nội dung thật, không phải ký hiệu
                            }))
                          }
                        />
                        <span>
                          {opt}. {value}
                        </span>

                        {/* Hiển thị tick đúng/sai */}
                        {isSubmitted && isCorrect && (
                          <span className="text-green-600 font-bold">✅</span>
                        )}
                        {isSubmitted && isUserSelected && !isCorrect && (
                          <span className="text-red-600 font-bold">❌</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- Nút nộp bài --- */}
        {!isSubmitted && (
          <button
            onClick={() => {
              handleSubmitQuiz(exam.id, exam.questions);
              window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ auto scroll khi nộp
            }}
            className="mt-6 px-6 py-3 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700"
          >
            Nộp bài
          </button>
        )}
      </div>
    );
  };

  const handleSubmitQuiz = async (
    examId: number,
    questions: ExamQuestion[]
  ) => {
    const answersArray = Object.entries(userAnswers).map(([qid, ans]) => ({
      questionId: Number(qid),
      userAnswer: ans,
    }));

    if (answersArray.length < questions.length) {
      alert("⚠️ Bạn chưa chọn hết các câu!");
      return;
    }

    try {
      console.log("📤 Gọi API /exam/submit với payload:", answersArray);

      // ✅ Chỉ gọi exam submit thôi
      const { submitExamAnswers } = await import("../../api/quiz");
      const data = await submitExamAnswers(answersArray);

      console.log("📩 Kết quả từ server:", data);

      setSubmitResult(data.result);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      alert(err.response?.data?.message || "Không thể nộp bài!");
    }
  };

  // --- Render nội dung chính ---
  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center text-red-600 bg-red-100 p-4 rounded">
          {error}
        </div>
      );
    }

    const selectedItem = selectedGroupId
      ? contentGroups.find((item) => item.id === selectedGroupId)
      : null;

    // 1. Hiển thị chi tiết
    if (selectedItem) {
      return (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedGroupId(null)}
            className="flex items-center px-3 py-1.5 bg-white text-gray-700 text-sm rounded-md shadow hover:bg-gray-100 transition border"
          >
            <IoMdArrowBack className="mr-1 h-4 w-4" />
            Quay lại
          </button>

          {currentPartType === "SPEAKING" && renderSpeakingDetail(selectedItem)}
          {(currentPartType === "MIDDLE_EXAM" ||
            currentPartType === "FINAL_EXAM") &&
            renderExamDetail(selectedItem as Exam)}
        </div>
      );
    }

    // 2. Hiển thị danh sách
    if (contentGroups.length === 0) {
      return (
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <p className="italic text-gray-500">Chưa có nội dung cho mục này.</p>
        </div>
      );
    }

    const titleColor =
      currentPartType === "SPEAKING" ? "text-cyan-700" : "text-indigo-700";
    const hoverBg =
      currentPartType === "SPEAKING"
        ? "hover:bg-cyan-50"
        : "hover:bg-indigo-50";

    return (
      <div className="space-y-5">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 border-b pb-3 mb-4">
          {sidebarParts.find((p) => p.id === Number(partId))?.title}
        </h2>
        <p className="text-base sm:text-lg text-gray-600">
          Vui lòng chọn một mục để bắt đầu:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {contentGroups.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-6 bg-white rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${hoverBg} border border-transparent hover:border-gray-300 flex flex-col justify-between min-h-[120px]`} // Thêm style
              onClick={() => {
                setSelectedGroupId(item.id);
                setIsSubmitted(false);
                setUserAnswers({});
                setSubmitResult(null);
              }}
            >
              <div>
                <h3
                  className={`text-lg sm:text-xl font-bold ${titleColor} mb-1 line-clamp-2`}
                >
                  {" "}
                  {/* Giới hạn 2 dòng */}
                  {item.title || item.examTitle}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm line-clamp-2">
                  {currentPartType === "SPEAKING"
                    ? item.description ||
                      `Các bài tập dạng ${item.type || item.speakingType}`
                    : `Đề thi ${item.semester} - ${item.year}`}
                </p>
              </div>
              <div className="mt-2 text-right">
                {" "}
                {/* Đẩy số lượng xuống dưới */}
                {currentPartType === "SPEAKING" && item.speakings && (
                  <span className="text-xs text-gray-400">
                    {item.speakings.length} bài tập
                  </span>
                )}
                {(currentPartType === "MIDDLE_EXAM" ||
                  currentPartType === "FINAL_EXAM") &&
                  item.questions && (
                    <span className="text-xs text-gray-400">
                      {item.questions.length} câu hỏi
                    </span>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- JSX return (Layout chính) ---
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification */}
      {error && !loading && (
        <NotificationModal message={error} onClose={() => setError(null)} />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          {" "}
          {/* Giảm padding header */}
          <Link
            to={`/courses/${courseCode}`}
            className="flex items-center text-gray-600 hover:text-cyan-700 transition-colors text-sm"
          >
            <IoMdArrowBack className="mr-1.5 h-4 w-4" /> {/* Giảm size icon */}
            Quay lại khóa học
          </Link>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 text-center flex-1 mx-4 truncate hidden md:block">
            {" "}
            {/* Căn giữa, truncate */}
            {sidebarParts.find((p) => p.id === Number(partId))?.title}
          </h1>
          {/* Placeholder để căn giữa trên mobile nếu cần */}
          <div className="w-auto md:hidden"></div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {" "}
        {/* Giảm padding main */}
        <div className="flex flex-col md:flex-row md:space-x-6">
          {" "}
          {/* Giảm space */}
          {/* Sidebar */}
          <aside className="w-full md:w-1/4 lg:w-1/5 mb-6 md:mb-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-[70px]">
              {" "}
              {/* Điều chỉnh top sticky */}
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                {" "}
                {/* Giảm size chữ */}
                Nội dung ôn tập
              </h3>
              <nav className="space-y-1">
                {sidebarParts.map((part) => {
                  const isActive = part.id === Number(partId);
                  return (
                    <Link
                      key={part.id}
                      to={`/overview/${courseCode}/${overviewId}/${part.id}`}
                      className={`
                                                block w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium
                                                ${
                                                  isActive
                                                    ? "bg-cyan-600 text-white shadow-sm"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                }
                                            `}
                    >
                      {part.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
          {/* Content Area */}
          <main className="w-full md:w-3/4 lg:w-4/5">
            {renderMainContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default OverviewContentPage;
