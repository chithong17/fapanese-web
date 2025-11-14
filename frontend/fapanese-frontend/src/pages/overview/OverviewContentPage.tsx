import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Giả định các hàm API này đã được import
import { getOverviewPartsByOverview } from "../../api/overviewPart";
import { getSpeakingExamsByPartId } from "../../api/speakingExam";
import { getMiddleExamsByPartId } from "../../api/middleExam";
import { getFinalExamsByPartId } from "../../api/finalExam";
// ✅ Import submitExamAnswers (đã được đổi tên từ submitQuizAnswers để rõ ràng hơn)
import { submitExamAnswers } from "../../api/quiz";


import NotificationModal from "../../components/NotificationModal";
import PassageViewer from "../../components/PassageViewer";
import QuestionViewer from "../../components/QuestionViewer";

import spk from "../../assets/spk.svg"
import mid from "../../assets/mid.svg"
import final from "../../assets/final.svg"


const PART_BANNERS: Record<string, string> = {
    SPEAKING: spk,
    MIDDLE_EXAM: mid,
    FINAL_EXAM: final,
};

// --- Định nghĩa Interfaces ---
// Tự định nghĩa UserAnswer ngay trong file này
interface UserAnswer {
    questionId: number;
    userAnswer: string;
}

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

interface Exam {
    id: number;
    overviewPartId?: number;
    examTitle: string;
    semester: string;
    type: string;
    year: number;
    questions: ExamQuestion[];
}

// --- ✅ HÀM TIỆN ÍCH: FORMAT CONTENT (Đã thêm) ---
/**
 * Chuyển đổi ký tự xuống dòng '\n' trong chuỗi (từ database) thành <br /> trong JSX
 * để hiển thị nội dung đa dòng.
 */
const formatContent = (text: string | undefined): React.ReactNode => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            {/* Thêm <br /> cho mọi dòng trừ dòng cuối cùng */}
            {index < text.split('\n').length - 1 && <br />}
        </React.Fragment>
    ));
};


const formatAINode = (text: string | undefined): React.ReactNode => {
    if (!text) return null;

    // 1. Tách văn bản thành các đoạn (paragraphs) dựa trên một hoặc nhiều ngắt dòng
    const paragraphs = text.split(/\n+/g); // Tách bằng 1 hoặc nhiều \n

    return paragraphs.map((line, lineIndex) => {
        // Bỏ qua các dòng trống hoàn toàn (thường là do \n\n)
        if (line.trim() === "") {
            return null;
        }

        // 2. Tách mỗi dòng dựa trên dấu ** (bold)
        // Regex này sẽ tách chuỗi, giữ lại các phần bold (ví dụ: "text **bold** text")
        const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean); // Tách và lọc ra các chuỗi rỗng

        const lineContent = parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                // Nếu là phần bold, bỏ dấu ** và bọc bằng <strong>
                return (
                    <strong key={`bold-${lineIndex}-${partIndex}`} className="font-bold text-[#0092B8]">
                        {part.substring(2, part.length - 2)}
                    </strong>
                );
            } else {
                // Nếu là text thường
                return (
                    <React.Fragment key={`text-${lineIndex}-${partIndex}`}>
                        {part}
                    </React.Fragment>
                );
            }
        });

        // 3. Trả về mỗi dòng trong một thẻ <p> để có khoảng cách đoạn văn
        return (
            <p key={`line-${lineIndex}`} className="mb-3 last:mb-0"> {/* Thêm margin bottom cho mỗi đoạn */}
                {lineContent}
            </p>
        );
    });
};

// --- Component chính ---
const OverviewContentPage: React.FC = () => {
    const { courseCode, overviewId, partId } = useParams();
    const navigate = useNavigate();

    const [sidebarParts, setSidebarParts] = useState<OverviewPart[]>([]);
    const [contentGroups, setContentGroups] = useState<any[]>([]);
    const [currentPartType, setCurrentPartType] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [loadingContent, setLoadingContent] = useState(true);
    const [loadingBanner, setLoadingBanner] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitResult, setSubmitResult] = useState<any>(null);

    const [showExplainModal, setShowExplainModal] = useState(false); // Bật/tắt modal AI
    const [explanation, setExplanation] = useState(""); // Lưu nội dung giải thích
    const [explainingAI, setExplainingAI] = useState(false); // Trạng thái loading
    const [selectedQuestionForExplain, setSelectedQuestionForExplain] = useState<ExamQuestion | null>(null); // <-- THÊM DÒNG NÀY

    // --- LOGIC FETCH DATA (GIỮ NGUYÊN) ---
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

            setLoadingContent(true);
            setLoadingBanner(true);
            setError(null);
            setCurrentPartType(currentPart.type);
            setSelectedGroupId(null);
            setIsSubmitted(false);
            setUserAnswers({});
            setSubmitResult(null);

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
                setTimeout(() => {
                    setLoadingContent(false);
                }, 100);
            }
        };

        fetchContentGroups();
    }, [partId, sidebarParts, overviewId, courseCode, navigate]);

    // --- HÀM NỘP BÀI ĐÃ SỬA LỖI 400 VÀ LỖI UNDEFINED ---
    const handleSubmitQuiz = async (
        examId: number,
        questions: ExamQuestion[]
    ) => {
        // Định dạng payload chính xác
        const answersArray: UserAnswer[] = Object.entries(userAnswers).map(([qid, ans]) => ({
            questionId: Number(qid),
            userAnswer: ans,
        }));

        if (answersArray.length < questions.length) {
            alert("⚠️ Bạn chưa chọn hết các câu!");
            return;
        }

        try {
            console.log("📤 Gọi API /exam/submit với payload:", answersArray);

            // Gọi hàm submitExamAnswers từ file api/quiz
            // Lưu ý: Nếu bạn chỉ import submitQuizAnswers, hãy sửa lại tên hàm gọi tại đây:
            const data = await submitExamAnswers(answersArray);

            console.log("📩 Kết quả từ server:", data);

            // Xử lý kết quả thành công
            setSubmitResult(data.result);
            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (err: any) {
            // Xử lý lỗi Axios
            console.error("❌ Submit error:", err);
            const serverMessage = err.response?.data?.message;
            const defaultMessage = "Lỗi nộp bài! Vui lòng kiểm tra lại câu trả lời và kết nối mạng.";

            setError(serverMessage || defaultMessage);

            // Đặt lại trạng thái
            setIsSubmitted(false);
            setSubmitResult(null);
        }
    };


    const handleExplainAI = async (question: ExamQuestion) => {
        setExplainingAI(true);
        setExplanation(""); // Xóa giải thích cũ
        setSelectedQuestionForExplain(question);
        setShowExplainModal(true); // Hiển thị modal (sẽ thấy loading)
        setError(null); // Xóa lỗi chung (nếu có)

        try {
            // 1. Lấy token (giả sử lưu trong localStorage)
            const token = localStorage.getItem("token") || "";
            if (!token) {
                throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
            }

            // 2. Xây dựng payload
            const options = [
                question.optionA,
                question.optionB,
                question.optionC,
                question.optionD
            ].filter(Boolean).join('\n'); // Lọc ra các option rỗng/null và nối bằng \n

            const payload = {
                question: question.content,
                options: options,
                correctAnswer: question.correctAnswer
            };

            console.log("📤 Gửi yêu cầu giải thích AI:", payload);

            // 3. Gọi API
            const res = await axios.post(
                // Thay thế URL nếu API_BASE của bạn khác
                `https://fapanese-backend-production.up.railway.app/fapanese/api/interview/explain-exam`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 4. Xử lý kết quả
            if (res.data && res.data.result) {
                setExplanation(res.data.result);
            } else {
                throw new Error("API không trả về kết quả giải thích.");
            }

        } catch (err: any) {
            console.error("❌ Lỗi giải thích AI:", err);
            const errorMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
            setExplanation(`Lỗi: Không thể lấy giải thích từ AI.\nChi tiết: ${errorMsg}`);
        } finally {
            setExplainingAI(false); // Tắt loading
        }
    };

    // --- HÀM XỬ LÝ CHỌN ĐÁP ÁN VÀ CUỘN TỰ ĐỘNG (GIỮ NGUYÊN) ---
    const handleAnswerSelection = (
        questionId: number,
        selectedAnswer: string,
        currentIndex: number,
        totalQuestions: number
    ) => {
        setUserAnswers((prev) => ({
            ...prev,
            [questionId]: selectedAnswer,
        }));

        if (currentIndex < totalQuestions - 1) {
            const nextQuestionIndex = currentIndex + 1;
            const nextQuestionElement = document.getElementById(`question-${nextQuestionIndex}`);

            if (nextQuestionElement) {
                nextQuestionElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    };

    // Hàm lấy URL Banner theo loại Part (GIỮ NGUYÊN)
    const getBannerImage = () => {
        return PART_BANNERS[currentPartType as string] || PART_BANNERS.DEFAULT;
    };

    // --- A. Render CHI TIẾT 1 nhóm SPEAKING (GIỮ NGUYÊN) ---
    const renderSpeakingDetail = (group: SpeakingGroup) => (
        <div className="p-6 sm:p-10 bg-white rounded-2xl shadow-xl transition-all duration-300 transform hover:shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 pb-4 border-b-2 border-cyan-100">
                {group.title}
            </h2>
            {group.description && (
                <p className="text-gray-700 mb-10 text-lg italic border-l-4 border-cyan-300 pl-4 py-2 bg-cyan-50 rounded-lg">
                    {group.description}
                </p>
            )}
            <div className="space-y-12">
                {group.speakings.map((item: SpeakingItem, index) => (
                    <div
                        key={item.id}
                        className="p-6 rounded-xl bg-gray-50 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-cyan-200"
                    >
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Bài tập {index + 1}: {item.topic || 'Nội dung luyện tập'}
                        </h3>

                        {(item.speakingType === "PASSAGE" && item.passage) || (item.speakingType === "PICTURE" && item.imgUrl) ? (
                            <div className="my-6">
                                {item.speakingType === "PASSAGE" && item.passage && (
                                    <PassageViewer
                                        passage={item.passage}
                                        romaji={item.passageRomaji}
                                        meaning={item.passageMeaning}
                                    />
                                )}
                                {item.speakingType === "PICTURE" && item.imgUrl && (
                                    <div className="flex justify-center my-6">
                                        <img
                                            src={item.imgUrl}
                                            alt={item.topic}
                                            className="max-w-2xl w-full rounded-lg shadow-xl border-4 border-gray-100"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {item.speakingQuestions && item.speakingQuestions.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                                <h4 className="font-semibold mb-4 text-gray-800 text-lg">
                                    Các câu hỏi:
                                </h4>
                                <div className="space-y-5">
                                    {item.speakingQuestions.map((q: SpeakingQuestion) => (
                                        <QuestionViewer
                                            key={q.id}
                                            question={q.question}
                                            romaji={q.questionRomaji}
                                            meaning={q.questionMeaning}
                                            answer={q.answer}
                                            answerRomaji={q.answerRomaji}
                                            answerMeaning={q.answerMeaning}
                                            isSuggestion={item.speakingType === "QUESTION"}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.description && (
                            <p className="text-base text-gray-600 mt-8 italic bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-inner">
                                Gợi ý: {item.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    // --- B. Render CHI TIẾT 1 Đề thi (Middle/Final) ---
    const renderExamDetail = (exam: Exam) => {
        return (
            <div className="p-6 sm:p-10 bg-white rounded-2xl shadow-xl transition-all duration-300 transform hover:shadow-2xl">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 pb-4 border-b-2 border-indigo-100">
                    {exam.examTitle}
                </h2>

                {isSubmitted && (
                    <div className="mb-10 p-6 bg-green-50 border-2 border-green-300 rounded-xl text-center shadow-md animate-fade-in">
                        <h3 className="font-extrabold text-2xl text-green-700 mb-3">
                            Kết quả của bạn: Hoàn thành xuất sắc!
                        </h3>
                        <p className="text-2xl text-gray-800 font-bold">
                            Điểm số:{" "}
                            <span className="font-black text-green-800 text-4xl">
                                {submitResult?.scorePercentage.toFixed(2)}%
                            </span>{" "}
                            <span className="text-xl">({submitResult?.correctCount}/{submitResult?.totalQuestions})</span>
                        </p>
                    </div>
                )}

                <div className="space-y-10">
                    {exam.questions.map((q: ExamQuestion, index: number) => {
                        const selected = userAnswers[q.id];
                        const result = submitResult?.detailedResults?.find(
                            (r: any) => r.questionId === q.id
                        );

                        const isAnswer = result && result.correctAnswer === selected;
                        const isWrong = isSubmitted && selected && !isAnswer;

                        const containerClass = isSubmitted
                            ? isAnswer ? "bg-green-50 border-green-300 shadow-sm" : isWrong ? "bg-red-50 border-red-300 shadow-sm" : "bg-white border-gray-200 shadow-sm"
                            : "bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow";

                        return (
                            <div
                                key={q.id}
                                id={`question-${index}`}
                                className={`p-6 rounded-xl border ${containerClass}`}
                            >
                                <p className="font-bold text-gray-900 mb-4 text-xl flex items-start">
                                    <span className="text-cyan-600 mr-3 mt-1">{index + 1}.</span>
                                    {/* ✅ ÁP DỤNG formatContent cho nội dung câu hỏi */}
                                    {formatContent(q.content)}
                                </p>

                                {isSubmitted && ( // Chỉ hiển thị sau khi đã nộp bài
                                    <div className="mb-4 -mt-2 ml-10"> {/* Điều chỉnh lề */}
                                        <button
                                            onClick={() => handleExplainAI(q)}
                                            disabled={explainingAI} // Vô hiệu hóa nếu đang load
                                            className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full shadow-sm hover:bg-blue-200 transition-all text-sm disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {/* Icon AI (SVG Sparkle) */}
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.468 3.11a.75.75 0 0 0 .565 1.245h5.499l-1.83 4.401c-.321.772.773 1.415 1.245.565l7.103-9.192a.75.75 0 0 0-.565-1.245H9.16l1.708-4.107Z" clipRule="evenodd" />
                                            </svg>
                                            Giải thích bằng AI
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-3 text-lg text-gray-700 ml-8">
                                    {["A", "B", "C", "D"].map((opt) => {
                                        const value = (q as any)[`option${opt}`];
                                        if (!value) return null;

                                        const isUserSelected = selected === value;
                                        const isCorrectAnswer = result && result.correctAnswer === value;

                                        const labelBg = isSubmitted
                                            ? isCorrectAnswer
                                                ? "bg-green-100/70"
                                                : isUserSelected
                                                    ? "bg-red-100/70"
                                                    : "bg-white"
                                            : isUserSelected ? "bg-cyan-50" : "hover:bg-gray-100";

                                        const labelColor = isUserSelected ? "text-gray-900 font-semibold" : "text-gray-700";

                                        return (
                                            <label
                                                key={opt}
                                                className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 border border-transparent ${labelBg} ${labelColor}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${q.id}`}
                                                    value={value}
                                                    checked={isUserSelected}
                                                    disabled={isSubmitted}
                                                    onChange={() =>
                                                        handleAnswerSelection(
                                                            q.id,
                                                            value,
                                                            index,
                                                            exam.questions.length
                                                        )
                                                    }
                                                    className={`w-5 h-5 text-cyan-600 border-gray-300 focus:ring-cyan-500 rounded-full ${isSubmitted ? 'opacity-60' : ''}`}
                                                />
                                                <span className="flex-1">
                                                    <span className="font-bold mr-1">{opt}.</span>
                                                    {/* ✅ ÁP DỤNG formatContent cho nội dung đáp án */}
                                                    {formatContent(value)}
                                                </span>


                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!isSubmitted && (
                    <button
                        onClick={() => {
                            handleSubmitQuiz(exam.id, exam.questions);
                        }}
                        className="mt-12 px-10 py-4 bg-cyan-600 text-white rounded-full font-bold text-xl shadow-lg hover:bg-cyan-700 transition-all duration-300 transform hover:scale-[1.01] active:scale-95 w-full md:w-auto mx-auto block"
                    >
                        Nộp bài và xem kết quả
                    </button>
                )}
            </div>
        );
    };

    // --- Render nội dung chính (GIỮ NGUYÊN) ---
    const renderMainContent = () => {
        if (loadingContent && !selectedGroupId) {
            return (
                <div className="flex justify-center items-center h-64">
                    <p className="text-cyan-600 font-semibold text-lg animate-pulse">Đang tải nội dung ôn tập...</p>
                </div>
            );
        }

        if (error && !selectedGroupId) {
            return (
                <div className="text-center text-red-700 bg-red-100 p-8 rounded-lg shadow-md border-l-4 border-red-500 animate-fade-in">
                    <p className="font-bold text-xl mb-2">Lỗi:</p>
                    <p className="text-lg">{error}</p>
                </div>
            );
        }

        const selectedItem = selectedGroupId
            ? contentGroups.find((item) => item.id === selectedGroupId)
            : null;

        // 1. Hiển thị chi tiết (giữ nguyên hiệu ứng cho chi tiết)
        if (selectedItem) {
            return (
                <div className="space-y-8 animate-fade-in-up">
                    <button
                        onClick={() => setSelectedGroupId(null)}
                        className="flex items-center px-5 py-2.5 bg-white text-gray-700 text-lg rounded-xl shadow-md hover:bg-gray-100 transition-all duration-300 border border-gray-200 font-medium group"
                    >
                        <IoMdArrowBack className="mr-2 h-6 w-6 text-gray-600 group-hover:text-cyan-600 transition-colors" />
                        <span className="group-hover:text-cyan-700 transition-colors">Quay lại danh sách</span>
                    </button>

                    {currentPartType === "SPEAKING" && renderSpeakingDetail(selectedItem as SpeakingGroup)}
                    {(currentPartType === "MIDDLE_EXAM" ||
                        currentPartType === "FINAL_EXAM") &&
                        renderExamDetail(selectedItem as Exam)}
                </div>
            );
        }

        // 2. Hiển thị danh sách (giữ nguyên)
        if (contentGroups.length === 0) {
            return (
                <div className="text-center p-10 bg-white rounded-2xl shadow-xl animate-fade-in">
                    <p className="italic text-gray-600 text-xl">
                        Không tìm thấy bài ôn tập cho mục này.
                    </p>
                </div>
            );
        }

        const partTitle = sidebarParts.find((p) => p.id === Number(partId))?.title;

        const cardBg = currentPartType === "SPEAKING" ? "bg-cyan-50" : "bg-indigo-50";
        const titleColor = currentPartType === "SPEAKING" ? "text-cyan-800" : "text-indigo-800";
        const statTextColor = currentPartType === "SPEAKING" ? "text-cyan-600" : "text-indigo-600";


        return (
            <div className="space-y-8">
                {/* Banner với hiệu ứng fade-in */}
                <img
                    src={getBannerImage()}
                    alt={`Banner ${partTitle}`}
                    className={`rounded-2xl w-full h-auto shadow-lg transition-all duration-700 ease-out 
                                 ${loadingBanner ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                    onLoad={() => setLoadingBanner(false)} // Khi ảnh tải xong, bỏ loading banner
                />

                {/* Phần mô tả và các card bài tập sẽ có hiệu ứng riêng */}
                <div className={`transition-opacity duration-700 ease-in-out delay-200 ${loadingContent ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

                    <p className="text-xl text-gray-700 font-light leading-relaxed mb-6">
                        Chọn một mục dưới đây để bắt đầu ôn luyện. Mỗi phần được thiết kế để giúp bạn nắm vững kiến thức một cách hiệu quả.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* =============================================================== */}
                        {/* ✅ BẮT ĐẦU THÊM MỚI: Card "Thi Mô Phỏng" (Chỉ cho Speaking) */}
                        {/* =============================================================== */}
                        {currentPartType === "SPEAKING" && (
                            <Link
                                to={`/speaking-test/${courseCode}/${overviewId}/${partId}`}
                                className={`p-6 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl flex flex-col justify-between min-h-[160px] transform hover:scale-[1.02] text-white md:col-span-2 lg:col-span-3`}

                                style={{
                                    backgroundImage: 'linear-gradient(to bottom right, #019ba5ff, #94f3eeff)'
                                }}
                            >
                                <div>
                                    <h3 className="text-xl font-bold mb-3 line-clamp-2">
                                        Thi mô phỏng JPD113
                                    </h3>
                                    <p className="text-cyan-50 text-base line-clamp-2">
                                        Bắt đầu bài thi ngẫu nhiên theo đúng thể lệ (Đọc, Tự do, Tranh).
                                    </p>
                                </div>
                                <div className="mt-4 text-right">
                                    <div className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-cyan-700 px-3 py-1.5 rounded-full shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z" clipRule="evenodd" />
                                        </svg>
                                        Bắt đầu thi
                                    </div>
                                </div>
                            </Link>
                        )}

                        {contentGroups.map((item) => (
                            <div
                                key={item.id}
                                className={`p-6 ${cardBg} rounded-2xl shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-opacity-80 flex flex-col justify-between min-h-[160px] transform hover:scale-[1.02]`}
                                onClick={() => {
                                    setSelectedGroupId(item.id);
                                    setIsSubmitted(false);
                                    setUserAnswers({});
                                    setSubmitResult(null);
                                }}
                            >
                                <div>
                                    <h3
                                        className={`text-xl font-bold ${titleColor} mb-3 line-clamp-2`}
                                    >
                                        {item.title || item.examTitle}
                                    </h3>
                                    <p className="text-gray-600 text-base line-clamp-2">
                                        {currentPartType === "SPEAKING"
                                            ? item.description || `Các bài tập dạng ${item.type || item.speakingType}`
                                            : `Kỳ thi ${item.semester} - Năm ${item.year}`}
                                    </p>
                                </div>
                                <div className="mt-4 text-right">
                                    <span className={`text-sm font-semibold ${statTextColor} bg-white px-3 py-1.5 rounded-full shadow-sm`}>
                                        {currentPartType === "SPEAKING" && item.speakings ?
                                            `${item.speakings.length} Bài tập` :
                                            (item.questions ? `${item.questions.length} Câu hỏi` : '')
                                        }
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // --- JSX return (Layout chính) ---
    return (
        <div className="min-h-screen bg-gray-50 antialiased">

            {/* Notification Modal (Hiển thị tất cả lỗi từ Fetch Data và Submit Quiz) */}
            {error && (
                <NotificationModal
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            {/* --- ✅ THÊM MODAL GIẢI THÍCH AI --- */}
            <AnimatePresence>
                {showExplainModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
                            style={{ boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header Modal */}
                            <div className="flex items-center gap-3 p-5 border-b border-gray-200 bg-white">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.468 3.11a.75.75 0 0 0 .565 1.245h5.499l-1.83 4.401c-.321.772.773 1.415 1.245.565l7.103-9.192a.75.75 0 0 0-.565-1.245H9.16l1.708-4.107Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Giải thích từ AI
                                </h3>
                            </div>

                            {/* Content Modal */}
                            <div className="p-6 overflow-y-auto flex-grow" style={{ backgroundColor: "#f8f9fa" }}>

                                {/* --- 1. PHẦN CÂU HỎI VÀ ĐÁP ÁN --- */}
                                {selectedQuestionForExplain && (
                                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                                        <p className="font-bold text-gray-900 mb-4 text-lg">
                                            {formatAINode(selectedQuestionForExplain.content)}
                                        </p>
                                        <div className="space-y-2 text-base text-gray-700 ml-4">
                                            {["A", "B", "C", "D"].map((opt) => {
                                                const q = selectedQuestionForExplain;
                                                const value = (q as any)[`option${opt}`];
                                                if (!value) return null;

                                                const userAnswer = userAnswers[q.id];
                                                const correctAnswer = q.correctAnswer;

                                                const isUserSelected = userAnswer === value;
                                                const isCorrectAnswer = correctAnswer === value;

                                                const labelBg = isCorrectAnswer
                                                    ? "bg-green-100/70"  // Xanh cho đáp án đúng
                                                    : isUserSelected
                                                        ? "bg-red-100/70"    // Đỏ nếu user chọn sai
                                                        : "bg-white/50";     // Nền thường

                                                const labelWeight = (isUserSelected || isCorrectAnswer) ? "font-semibold" : "font-normal";

                                                let icon = null;
                                                if (isCorrectAnswer) {
                                                    // Icon Check (Nguồn: heroicons)
                                                    icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600 flex-shrink-0"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>;
                                                } else if (isUserSelected) {
                                                    // Icon X (Nguồn: heroicons)
                                                    icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>; // 🐞 Lỗi icon, dùng icon X
                                                    icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>; // 🐞 Icon X thật
                                                    icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" /></svg>;
                                                } else {
                                                    // Placeholder rỗng để căn chỉnh
                                                    icon = <div className="w-5 h-5 flex-shrink-0"></div>;
                                                }

                                                return (
                                                    <div
                                                        key={opt}
                                                        className={`flex items-start gap-2 p-3 rounded-lg ${labelBg} ${labelWeight}`}
                                                    >
                                                        <span className="mt-0.5">{icon}</span>
                                                        <span className="flex-1">
                                                            <span className="font-bold mr-1">{opt}.</span>
                                                            {formatContent(value)} {/* Dùng formatAINode cho cả đáp án */}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {/* --- KẾT THÚC PHẦN CÂU HỎI --- */}


                                {/* --- 2. PHẦN GIẢI THÍCH (có điều kiện loading) --- */}
                                {explainingAI ? (
                                    // Trạng thái Loading
                                    <div className="flex flex-col items-center justify-center h-48 text-center text-gray-600">
                                        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="mt-4 text-lg font-semibold">AI đang phân tích câu hỏi...</p>
                                        <p className="text-sm">Vui lòng đợi trong giây lát.</p>
                                    </div>
                                ) : (
                                    // Nội dung giải thích (chỉ hiển thị khi có nội dung)
                                    explanation && (
                                        <div className="border-t border-gray-300 pt-5 mt-5">
                                            <div className="text-gray-800 leading-relaxed prose prose-base max-w-none">
                                                {formatAINode(explanation)}
                                            </div>
                                        </div>
                                    )
                                )}
                                {/* --- KẾT THÚC PHẦN GIẢI THÍCH --- */}
                            </div>

                            {/* Footer Modal */}
                            <div className="p-4 bg-white border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={() => {
                                        setShowExplainModal(false);
                                        setExplanation(""); // Xóa nội dung khi đóng
                                        setSelectedQuestionForExplain(null); // ✅ RESET CÂU HỎI
                                    }}
                                    className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                    Đã hiểu
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* --- KẾT THÚC THÊM --- */}

            {/* Header (GIỮ NGUYÊN) */}
            <header className="bg-white shadow-lg sticky top-0 z-20 border-b-4 border-cyan-500">
                <div className="max-w-8xl mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
                    <Link
                        to={`/courses/${courseCode}`}
                        className="flex items-center text-gray-700 hover:text-cyan-600 transition-colors text-lg font-medium group"
                    >
                        <IoMdArrowBack className="mr-2 h-6 w-6 text-gray-600 group-hover:text-cyan-600 transition-colors" />
                        <span className="hidden sm:inline">Quay lại khóa học</span>
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center flex-1 mx-4 truncate">
                        {sidebarParts.find((p) => p.id === Number(partId))?.title}
                    </h1>
                    <div className="w-auto hidden sm:block"></div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="max-w-8xl mx-auto px-6 lg:px-12 py-10">
                <div className="flex flex-col md:flex-row md:space-x-10">

                    {/* Sidebar */}
                    <aside className="w-full md:w-[320px] flex-shrink-0 mb-10 md:mb-0">
                        <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-[120px]">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                                Mục lục ôn tập
                            </h3>
                            <nav className="space-y-2">
                                {sidebarParts.map((part) => {
                                    const isActive = part.id === Number(partId);
                                    return (
                                        <Link
                                            key={part.id}
                                            to={`/overview/${courseCode}/${overviewId}/${part.id}`}
                                            className={`
                                                flex items-center w-full text-left px-5 py-2.5 rounded-xl transition-all duration-300 text-lg font-medium
                                                ${isActive
                                                    ? "bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] text-white shadow-lg transform scale-[1.03] hover:bg-cyan-600"
                                                    : "text-gray-800 hover:bg-cyan-50 hover:text-cyan-700"
                                                }
                                            `}
                                        >

                                            <span className="ml-3 truncate">{part.title}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="w-full md:flex-1">
                        {renderMainContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default OverviewContentPage;