import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
    AiOutlinePlus,
    AiOutlineEdit,
    AiOutlineDelete,
} from "react-icons/ai";
import { IoMdArrowBack } from "react-icons/io";
import axios from "axios";
import NotificationModal from "../../components/NotificationModal";

// --- Interfaces ---
interface SpeakingQuestion {
    id: number;
    speakingId?: number;
    question: string;
    questionRomaji?: string;
    questionMeaning?: string;
    answer?: string;
    answerRomaji?: string;
    answerMeaning?: string;
}

interface SpeakingItem { // To display context
    id: number;
    topic: string;
    speakingType: string;
}

// --- Styles ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "10px 10px 20px #c6c9cc, -5px -5px 20px #ffffff";
const fadeIn = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// --- Component ---
const TeacherManageSpeakingQuestionsPage: React.FC = () => {
    // speakingId is the ID of the parent SpeakingItem
        const { courseCode, overviewId, partId, speakingExamId, speakingId } = useParams();

    const [speakingItem, setSpeakingItem] = useState<SpeakingItem | null>(null); // Parent Speaking Item info
    const [questions, setQuestions] = useState<SpeakingQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifMessage, setNotifMessage] = useState<string | null>(null);

    // Modal State
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<SpeakingQuestion | null>(null);
    const [questionFormData, setQuestionFormData] = useState<Partial<SpeakingQuestion>>({});

    const token = localStorage.getItem("token") || "";
    const API_URL = "https://85e7dd680e50.ngrok-free.app/fapanese/api";

    // --- Fetch Speaking Item Info (for context) ---
    const fetchSpeakingItemInfo = async () => {
        if (!speakingId) return;
        try {
            const res = await axios.get(`${API_URL}/speakings/${speakingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSpeakingItem(res.data.result || res.data);
        } catch (err) {
            console.error("❌ Error fetching Speaking Item info:", err);
            // Optional: set a notification if needed
        }
    };

    // --- Fetch Speaking Questions ---
    const fetchQuestions = async () => {
        if (!speakingId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // Use API GET /api/speaking-questions?speakingId={speakingId}
            const res = await axios.get(`${API_URL}/speaking-questions`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { speakingId: speakingId }, // Pass speakingId as query parameter
            });
            setQuestions(res.data.result || res.data || []);
        } catch (err) {
            console.error("❌ Error fetching Speaking Questions:", err);
            setNotifMessage("Không thể tải danh sách câu hỏi.");
        } finally {
            setLoading(false);
        }
    };

    // --- Fetch initial data ---
    useEffect(() => {
        fetchSpeakingItemInfo(); // Fetch parent item info
        fetchQuestions();       // Fetch child questions
    }, [speakingId]);

    // --- Modal Handlers ---
    const openQuestionModal = (question?: SpeakingQuestion) => {
        setEditingQuestion(question || null);
        setQuestionFormData(
            question
                ? { id: question.id, question: question.question, questionRomaji: question.questionRomaji, questionMeaning: question.questionMeaning, answer: question.answer, answerRomaji: question.answerRomaji, answerMeaning: question.answerMeaning }
                : { question: "", questionRomaji: "", questionMeaning: "", answer: "", answerRomaji: "", answerMeaning: "" }
        );
        setShowQuestionModal(true);
    };

    const handleQuestionChange = (key: keyof SpeakingQuestion, value: string) => {
        setQuestionFormData((prev) => ({ ...prev, [key]: value }));
    };

    // --- Save Question (Add/Edit) ---
    const handleSaveQuestion = async () => {
        if (!speakingId) return; // Ensure parent ID exists

        let payload: any = { ...questionFormData };
        let url = "";
        let method: "post" | "put" = "post";

        // Clean up empty optional fields before sending to API
        Object.keys(payload).forEach(key => {
            const typedKey = key as keyof SpeakingQuestion;
            // Don't nullify 'question' if it's empty, it's required
            if (payload[typedKey] === '' && typedKey !== 'question' && typedKey !== 'id' && typedKey !== 'speakingId') {
                payload[typedKey] = null; // Send null for empty optional fields
            }
        });


        if (editingQuestion) {
            payload.speakingId = Number(speakingId); // Ensure speakingId is in payload for PUT
            url = `${API_URL}/speaking-questions/${editingQuestion.id}`;
            method = "put";
        } else {
            delete payload.id; // Remove ID for POST
            payload.speakingId = Number(speakingId); // Add speakingId to link for POST
            url = `${API_URL}/speaking-questions`;
            method = "post";
        }

        // Basic validation: question field cannot be empty
        if (!payload.question || payload.question.trim() === '') {
            setNotifMessage("Lỗi: Nội dung câu hỏi không được để trống.");
            return; // Prevent API call
        }


        try {
            await axios[method](url, payload, { headers: { Authorization: `Bearer ${token}` } });
            setNotifMessage("Lưu câu hỏi thành công!");
            setShowQuestionModal(false);
            fetchQuestions(); // Refresh question list
        } catch (err: any) {
            console.error("❌ Lỗi khi lưu speaking question:", err);
            setNotifMessage(`❌ Không thể lưu câu hỏi: ${err.response?.data?.message || err.message}`);
        }
    };

    // --- Delete Question ---
    const handleDeleteQuestion = async (questionId: number) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa câu hỏi Speaking này?")) return;
        try {
            await axios.delete(`${API_URL}/speaking-questions/${questionId}`, { headers: { Authorization: `Bearer ${token}` } });
            setNotifMessage("Xóa câu hỏi thành công!");
            fetchQuestions(); // Refresh question list
        } catch (err) {
            console.error("❌ Lỗi khi xóa speaking question:", err);
            setNotifMessage("❌ Không thể xóa câu hỏi!");
        }
    };

    // --- Render Question Form in Modal ---
    const renderSpeakingQuestionModalForm = () => (
        <div className="flex flex-col gap-4">
            {/* Question */}
            <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">Câu hỏi (*)</label>
                <textarea id="question" value={questionFormData.question || ""} onChange={(e) => handleQuestionChange("question", e.target.value)} className="w-full border p-3 rounded-lg min-h-[80px] focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
            {/* Question Romaji */}
            <div>
                <label htmlFor="questionRomaji" className="block text-sm font-medium text-gray-700 mb-1">Romaji câu hỏi</label>
                <input id="questionRomaji" type="text" value={questionFormData.questionRomaji || ""} onChange={(e) => handleQuestionChange("questionRomaji", e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            {/* Question Meaning */}
            <div>
                <label htmlFor="questionMeaning" className="block text-sm font-medium text-gray-700 mb-1">Nghĩa câu hỏi</label>
                <input id="questionMeaning" type="text" value={questionFormData.questionMeaning || ""} onChange={(e) => handleQuestionChange("questionMeaning", e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            {/* Answer */}
            <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">Câu trả lời gợi ý</label>
                <textarea id="answer" value={questionFormData.answer || ""} onChange={(e) => handleQuestionChange("answer", e.target.value)} className="w-full border p-3 rounded-lg min-h-[80px] focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            {/* Answer Romaji */}
            <div>
                <label htmlFor="answerRomaji" className="block text-sm font-medium text-gray-700 mb-1">Romaji trả lời</label>
                <input id="answerRomaji" type="text" value={questionFormData.answerRomaji || ""} onChange={(e) => handleQuestionChange("answerRomaji", e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            {/* Answer Meaning */}
            <div>
                <label htmlFor="answerMeaning" className="block text-sm font-medium text-gray-700 mb-1">Nghĩa trả lời</label>
                <input id="answerMeaning" type="text" value={questionFormData.answerMeaning || ""} onChange={(e) => handleQuestionChange("answerMeaning", e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
        </div>
    );

    // --- Main Render ---
    if (loading) return (<div className="flex justify-center items-center h-screen">Đang tải...</div>);

    return (
        <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header & Back Button */}
                <div className="flex justify-between items-center mb-6">
                    <Link
                        // Link back to the Speaking Items page
                        to={`/teacher/courses/${courseCode}/overviews/${overviewId}/parts/${partId}/manage-content/speaking/${speakingExamId}/items`}
                        className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
                    >
                        <IoMdArrowBack className="h-6 w-6" />
                        <span className="text-lg font-medium">Quay lại Bài tập con</span>
                    </Link>
                    <button
                        onClick={() => openQuestionModal()}
                        className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-full hover:bg-purple-700 shadow font-semibold"
                    >
                        <AiOutlinePlus /> Thêm Câu hỏi
                    </button>
                </div>

                {/* Title Context */}
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Câu hỏi Speaking</h1>
                {speakingItem && (
                    <p className="text-lg text-gray-600 mb-8">
                        Cho bài tập: <span className="font-semibold text-cyan-700">{speakingItem.topic}</span> ({speakingItem.speakingType})
                    </p>
                )}

                {/* Question Table */}
                {questions.length === 0 ? (
                    <p className="text-center italic text-gray-500 mt-10">
                        Chưa có câu hỏi nào. Bấm "Thêm Câu hỏi" để bắt đầu.
                    </p>
                ) : (
                    <motion.div
                        initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                        style={{ boxShadow: neumorphicShadow }}
                    >
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Câu hỏi</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Câu trả lời gợi ý</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {questions.map((q) => (
                                    <motion.tr key={q.id} variants={fadeIn} className="hover:bg-gray-50">
                                        {/* Question Column */}
                                        <td className="px-6 py-4 text-sm text-gray-800 max-w-md align-top">
                                            <div className="font-medium mb-1">{q.question}</div>
                                            {q.questionRomaji && <div className="text-xs text-gray-500 italic">{q.questionRomaji}</div>}
                                            {q.questionMeaning && <div className="text-xs text-gray-500">({q.questionMeaning})</div>}
                                        </td>
                                        {/* Answer Column */}
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md align-top">
                                            <div className="mb-1">{q.answer || "-"}</div>
                                            {q.answerRomaji && <div className="text-xs text-gray-500 italic">{q.answerRomaji}</div>}
                                            {q.answerMeaning && <div className="text-xs text-gray-500">({q.answerMeaning})</div>}
                                        </td>
                                        {/* Actions Column */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3 align-top">
                                            <button onClick={() => openQuestionModal(q)} className="text-indigo-600 hover:text-indigo-900" title="Chỉnh sửa"> <AiOutlineEdit className="h-5 w-5 inline" /> </button>
                                            <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-600 hover:text-red-900" title="Xóa"> <AiOutlineDelete className="h-5 w-5 inline" /> </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </div>

            {/* --- Modal Thêm/Sửa Speaking Question --- */}
            <AnimatePresence>
                {showQuestionModal && (
                    <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[52] p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQuestionModal(false)}>
                        <motion.div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-xl font-semibold text-gray-800">{editingQuestion ? "Chỉnh sửa Câu hỏi Speaking" : "Thêm Câu hỏi Speaking mới"}</h3>
                                {editingQuestion && (<button onClick={() => handleDeleteQuestion(editingQuestion.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Xóa câu hỏi này"><AiOutlineDelete className="h-5 w-5" /></button>)}
                            </div>
                            {renderSpeakingQuestionModalForm()}
                            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                                <button onClick={() => setShowQuestionModal(false)} className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Hủy</button>
                                <button onClick={handleSaveQuestion} className="px-5 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700">Lưu Câu hỏi</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Notification */}
            {notifMessage && (<NotificationModal message={notifMessage} onClose={() => setNotifMessage(null)} />)}
        </div>
    );
};

export default TeacherManageSpeakingQuestionsPage;