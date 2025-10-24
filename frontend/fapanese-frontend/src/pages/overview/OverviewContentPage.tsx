import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
// Giả định các hàm API này đã được định nghĩa đúng đường dẫn
import { getOverviewPartsByOverview } from "../../api/overviewPart";
import { getSpeakingExamsByPartId } from "../../api/speakingExam";
import { getMiddleExamsByPartId } from "../../api/middleExam";
import { getFinalExamsByPartId } from "../../api/finalExam";
// Giả định hàm submitExamAnswers nằm trong quiz api
import { submitQuizAnswers } from "../../api/quiz"; 

// Giả định các Component này đã được định nghĩa đúng đường dẫn
import NotificationModal from "../../components/NotificationModal"; 
import PassageViewer from "../../components/PassageViewer";
import QuestionViewer from "../../components/QuestionViewer";


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


// Component chính
const OverviewContentPage: React.FC = () => {
    const { courseCode, overviewId, partId } = useParams();
    const navigate = useNavigate();

    const [sidebarParts, setSidebarParts] = useState<OverviewPart[]>([]);
    const [contentGroups, setContentGroups] = useState<any[]>([]); 
    const [currentPartType, setCurrentPartType] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitResult, setSubmitResult] = useState<any>(null);

    // --- LOGIC FETCH DATA ---
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

            setLoading(true);
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
                setLoading(false);
            }
        };

        fetchContentGroups();
    }, [partId, sidebarParts, overviewId, courseCode, navigate]);

    // Hàm nộp bài trắc nghiệm
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
            const { submitExamAnswers } = await import("../../api/quiz");
            const data = await submitExamAnswers(answersArray);

            setSubmitResult(data.result);
            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: any) {
            console.error("❌ Submit error:", err);
            setError(err.response?.data?.message || "Không thể nộp bài! Vui lòng thử lại.");
        }
    };
    
    // --- HÀM XỬ LÝ CHỌN ĐÁP ÁN VÀ CUỘN TỰ ĐỘNG ---
    const handleAnswerSelection = (
        questionId: number,
        selectedAnswer: string,
        currentIndex: number,
        totalQuestions: number
    ) => {
        // 1. Cập nhật đáp án người dùng
        setUserAnswers((prev) => ({
            ...prev,
            [questionId]: selectedAnswer,
        }));

        // 2. Cuộn xuống câu hỏi tiếp theo (nếu chưa phải câu cuối)
        if (currentIndex < totalQuestions - 1) {
            const nextQuestionIndex = currentIndex + 1;
            const nextQuestionElement = document.getElementById(`question-${nextQuestionIndex}`);

            if (nextQuestionElement) {
                // Cuộn mượt mà
                nextQuestionElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center'      
                });
            }
        }
    };


    // --- A. Render CHI TIẾT 1 nhóm SPEAKING ---
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

                        {/* Nội dung Bài đọc / Hình ảnh */}
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

                        {/* Câu hỏi Speaking */}
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
                {/* --- Tiêu đề đề thi --- */}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 pb-4 border-b-2 border-indigo-100">
                    {exam.examTitle}
                </h2>
                

                {/* --- Hiển thị kết quả nếu đã nộp --- */}
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

                {/* --- Danh sách câu hỏi --- */}
                <div className="space-y-10">
                    {exam.questions.map((q: ExamQuestion, index: number) => {
                        const selected = userAnswers[q.id];
                        const result = submitResult?.detailedResults?.find(
                            (r: any) => r.questionId === q.id
                        );

                        const isAnswer = result && result.correctAnswer === selected;
                        const isWrong = isSubmitted && selected && !isAnswer;
                        
                        // Màu sắc container câu hỏi
                        const containerClass = isSubmitted 
                            ? isAnswer ? "bg-green-50 border-green-300 shadow-sm" : isWrong ? "bg-red-50 border-red-300 shadow-sm" : "bg-white border-gray-200 shadow-sm"
                            : "bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow";

                        return (
                            <div
                                key={q.id}
                                // Gán ID để làm mục tiêu cuộn
                                id={`question-${index}`} 
                                className={`p-6 rounded-xl border ${containerClass}`}
                            >
                                {/* Số thứ tự câu hỏi */}
                                <p className="font-bold text-gray-900 mb-4 text-xl flex items-start">
                                    <span className="text-cyan-600 mr-3 mt-1">{index + 1}.</span>
                                    {q.content}
                                </p>

                                {/* Các lựa chọn đáp án */}
                                <div className="space-y-3 text-lg text-gray-700 ml-8">
                                    {["A", "B", "C", "D"].map((opt) => {
                                        const value = (q as any)[`option${opt}`];
                                        if (!value) return null;

                                        const isUserSelected = selected === value;
                                        const isCorrectAnswer = result && result.correctAnswer === value;
                                        
                                        // Màu sắc nền cho lựa chọn
                                        const labelBg = isSubmitted
                                            ? isCorrectAnswer
                                                ? "bg-green-100/70" // Đáp án đúng
                                                : isUserSelected
                                                ? "bg-red-100/70" // Chọn sai
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
                                                    // Gọi hàm cuộn tự động khi chọn
                                                    onChange={() =>
                                                        handleAnswerSelection(
                                                            q.id, 
                                                            value, 
                                                            index, // index hiện tại
                                                            exam.questions.length // tổng số câu hỏi
                                                        )
                                                    }
                                                    className={`w-5 h-5 text-cyan-600 border-gray-300 focus:ring-cyan-500 rounded-full ${isSubmitted ? 'opacity-60' : ''}`}
                                                />
                                                <span className="flex-1">
                                                    <span className="font-bold mr-1">{opt}.</span> {value}
                                                </span>
                                                
                                                {/* Hiển thị kết quả */}
                                                {isSubmitted && isCorrectAnswer && <span className="text-green-600 text-xl font-black ml-auto">✅</span>}
                                                {isSubmitted && isUserSelected && !isCorrectAnswer && <span className="text-red-600 text-xl font-black ml-auto">❌</span>}
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
                        }}
                        className="mt-12 px-10 py-4 bg-cyan-600 text-white rounded-full font-bold text-xl shadow-lg hover:bg-cyan-700 transition-all duration-300 transform hover:scale-[1.01] active:scale-95 w-full md:w-auto mx-auto block"
                    >
                        Nộp bài và xem kết quả
                    </button>
                )}
            </div>
        );
    };

    // --- Render nội dung chính ---
    const renderMainContent = () => {
        if (loading) {
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

        // 1. Hiển thị chi tiết
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

        // 2. Hiển thị danh sách
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
        
        // Định nghĩa màu sắc cho thẻ bài tập
        const cardBg = currentPartType === "SPEAKING" ? "bg-cyan-50" : "bg-indigo-50";
        const titleColor = currentPartType === "SPEAKING" ? "text-cyan-800" : "text-indigo-800";
        const statTextColor = currentPartType === "SPEAKING" ? "text-cyan-600" : "text-indigo-600";


        return (
            <div className="space-y-8 animate-fade-in-up">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 border-b-2 border-gray-200 pb-5 mb-6">
                    {partTitle}
                </h2>
                <p className="text-xl text-gray-700 font-light leading-relaxed">
                    Chọn một mục dưới đây để bắt đầu ôn luyện. Mỗi phần được thiết kế để giúp bạn nắm vững kiến thức một cách hiệu quả.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contentGroups.map((item) => (
                        <div
                            key={item.id}
                            // Áp dụng màu nền, loại bỏ border, thêm hiệu ứng hover mượt
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
        );
    };

    // --- JSX return (Layout chính) ---
    return (
        // 1. Loại bỏ font-sans: Xóa class 'font-sans' khỏi div chính
        <div className="min-h-screen bg-gray-50 antialiased"> 
            {/* Notification */}
            {error && !loading && (
                <NotificationModal 
                    message={error} 
                    onClose={() => setError(null)} 
                />
            )}

            {/* Header */}
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
                        {/* 2. Bỏ viền màu bên trái: Xóa class 'border-l-4 border-cyan-500' */}
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
                                                block w-full text-left px-5 py-2.5 rounded-xl transition-all duration-300 text-lg font-medium
                                                ${
                                                    isActive
                                                        ? "bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] text-white shadow-lg transform scale-[1.03] hover:bg-cyan-600" // 3. Tạo hiệu ứng sáng/nổi khi active
                                                        : "text-gray-800 hover:bg-cyan-50 hover:text-cyan-700"
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
                    <main className="w-full md:flex-1">
                        {renderMainContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default OverviewContentPage;