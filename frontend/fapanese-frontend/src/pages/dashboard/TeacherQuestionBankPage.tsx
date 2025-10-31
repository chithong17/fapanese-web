import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete, AiOutlineSearch, AiOutlineUpload } from "react-icons/ai";
import axios from "axios";
import NotificationModal from "../../components/NotificationModal";
import CircularProgress from "@mui/material/CircularProgress";

// --- Interface ---
interface ExamQuestion {
    id: number;
    content: string;
    category: "VOCABULARY" | "GRAMMAR" | "READING" | string;
    questionType: "MULTIPLE_CHOICE" | "FILL" | "TRUE_FALSE" | string;
    optionA?: string | null;
    optionB?: string | null;
    optionC?: string | null;
    optionD?: string | null;
    correctAnswer: string;
    fillAnswer?: string | null;
}

// --- Styles ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "8px 8px 15px #c6c9cc, -4px -4px 15px #ffffff";
const insetShadow = "inset 4px 4px 8px #c6c9cc, inset -4px -4px 8px #ffffff";
const fadeIn = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// --- Initial State for New Question ---
const initialNewQuestionState: Partial<ExamQuestion> = {
    content: "",
    category: "VOCABULARY",
    questionType: "MULTIPLE_CHOICE",
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctAnswer: "",
    fillAnswer: null,
};


// --- Component ---
const TeacherQuestionBankPage: React.FC = () => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifMessage, setNotifMessage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("ALL"); // ALL, MULTIPLE_CHOICE, FILL, TRUE_FALSE
    const [filterCategory, setFilterCategory] = useState<string>("ALL"); // ALL, VOCABULARY, GRAMMAR, READING

    // Add Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newQuestionData, setNewQuestionData] = useState<Partial<ExamQuestion>>(initialNewQuestionState);
    const [saving, setSaving] = useState(false); // Saving state for Add modal

    const [isUploadingExcel, setIsUploadingExcel] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const token = localStorage.getItem("token") || "";
    const API_URL = "http://localhost:8080/fapanese/api";

    // --- Fetch All Questions ---
    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/questions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setQuestions(res.data.result || res.data || []);
        } catch (err) {
            console.error("❌ Lỗi tải ngân hàng câu hỏi:", err);
            setNotifMessage("Không thể tải danh sách câu hỏi.");
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // --- Filtered Questions ---
    const filteredQuestions = useMemo(() => {
        return questions
            .filter(q => filterType === 'ALL' || q.questionType === filterType)
            .filter(q => filterCategory === 'ALL' || q.category === filterCategory)
            .filter(q => {
                if (!searchTerm) return true;
                const lowerSearch = searchTerm.toLowerCase();
                return (
                    q.id.toString().includes(lowerSearch) ||
                    q.content.toLowerCase().includes(lowerSearch) ||
                    q.correctAnswer.toLowerCase().includes(lowerSearch) ||
                    q.optionA?.toLowerCase().includes(lowerSearch) ||
                    q.optionB?.toLowerCase().includes(lowerSearch) ||
                    q.optionC?.toLowerCase().includes(lowerSearch) ||
                    q.optionD?.toLowerCase().includes(lowerSearch)
                );
            });
    }, [questions, searchTerm, filterType, filterCategory]);

    // --- Add Modal Handlers ---
    const openAddModal = () => {
        setNewQuestionData(initialNewQuestionState); // Reset form
        setShowAddModal(true);
    };

    const handleAddChange = (key: keyof ExamQuestion, value: string | null) => {
        setNewQuestionData((prev) => ({
            ...prev,
            // Handle null conversion for optional fields
            [key]: (value === '' && key !== 'content' && key !== 'correctAnswer') ? null : value
        }));
    };

    const handleAddNewQuestion = async () => {
        if (!newQuestionData.content || !newQuestionData.correctAnswer) {
            setNotifMessage("Lỗi: Nội dung câu hỏi và đáp án đúng không được để trống.");
            return;
        }
        setSaving(true);
        setNotifMessage(null);

        // Prepare payload
        const payload: Partial<ExamQuestion> = {
            content: newQuestionData.content,
            category: newQuestionData.category,
            questionType: newQuestionData.questionType,
            optionA: newQuestionData.optionA || null,
            optionB: newQuestionData.optionB || null,
            optionC: newQuestionData.optionC || null,
            optionD: newQuestionData.optionD || null,
            correctAnswer: newQuestionData.correctAnswer,
            fillAnswer: newQuestionData.questionType === 'FILL' ? (newQuestionData.fillAnswer || null) : null,
        };

        // Remove options if not MULTIPLE_CHOICE
        if (newQuestionData.questionType !== 'MULTIPLE_CHOICE') {
            delete payload.optionA; delete payload.optionB;
            delete payload.optionC; delete payload.optionD;
        }
        // Remove fillAnswer if not FILL
        if (newQuestionData.questionType !== 'FILL') {
            delete payload.fillAnswer;
        }

        try {
            await axios.post(`${API_URL}/questions`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifMessage("Thêm câu hỏi mới thành công!");
            setShowAddModal(false);
            fetchQuestions(); // Refresh the list
        } catch (err: any) {
            console.error("❌ Lỗi khi thêm câu hỏi:", err);
            setNotifMessage(`❌ Không thể thêm câu hỏi: ${err.response?.data?.message || err.message}`);
        } finally {
            setSaving(false);
        }
    };


    // --- Delete Question Handler ---
    const handleDeleteQuestion = async (questionId: number) => {
        if (!window.confirm(`Bạn chắc chắn muốn XÓA VĨNH VIỄN câu hỏi ID: ${questionId} khỏi hệ thống?\nHành động này không thể hoàn tác và sẽ ảnh hưởng đến mọi nơi câu hỏi này được sử dụng.`)) return;
        try {
            await axios.delete(`${API_URL}/questions/${questionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifMessage(`Xóa câu hỏi ID: ${questionId} thành công!`);
            fetchQuestions(); // Refresh the list
        } catch (err) {
            console.error("❌ Lỗi khi xóa câu hỏi:", err);
            setNotifMessage("❌ Không thể xóa câu hỏi!");
        }
    };

    // --- Navigate to Edit Page ---
    const handleEditQuestion = (questionId: number) => {
        navigate(`/teacher/questions/${questionId}/edit`);
    };

    // --- Render Add/Edit Form Fields (Similar to Edit Page) ---
    const renderQuestionFormFields = (data: Partial<ExamQuestion>, handleChangeFn: Function) => {
        const questionType = data.questionType;
        return (
            <>
                {/* Content (Required) */}
                <div className="mb-4"> <label className="block text-sm font-medium text-gray-600 mb-1">Nội dung câu hỏi (*)</label> <textarea placeholder="Nhập nội dung câu hỏi..." value={data.content || ""} onChange={(e) => handleChangeFn("content", e.target.value)} className="w-full border p-3 rounded-lg min-h-[100px] focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} required /> </div>
                {/* Category & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div> <label className="block text-sm font-medium text-gray-600 mb-1">Thể loại (*)</label> <select value={data.category || "VOCABULARY"} onChange={(e) => handleChangeFn("category", e.target.value)} className="w-full border p-3 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }}> <option value="VOCABULARY">Từ vựng</option> <option value="GRAMMAR">Ngữ pháp</option> <option value="READING">Đọc hiểu</option> </select> </div>
                    <div> <label className="block text-sm font-medium text-gray-600 mb-1">Loại câu hỏi (*)</label> <select value={data.questionType || "MULTIPLE_CHOICE"} onChange={(e) => handleChangeFn("questionType", e.target.value)} className="w-full border p-3 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }}> <option value="MULTIPLE_CHOICE">Trắc nghiệm</option> <option value="FILL">Điền từ</option> <option value="TRUE_FALSE">Đúng/Sai</option> </select> </div>
                </div>
                {/* Options (for Multiple Choice) */}
                {questionType === 'MULTIPLE_CHOICE' && (<motion.div variants={fadeIn} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"> {['A', 'B', 'C', 'D'].map(opt => (<div key={opt}> <label className="block text-sm font-medium text-gray-600 mb-1">Đáp án {opt}</label> <input type="text" placeholder={`Nội dung đáp án ${opt}...`} value={data[`option${opt}` as keyof ExamQuestion] as string || ""} onChange={(e) => handleChangeFn(`option${opt}` as keyof ExamQuestion, e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} /> </div>))} </motion.div>)}
                {/* Correct Answer (Required) */}
                <div className="mb-4"> <label className="block text-sm font-medium text-gray-600 mb-1">Đáp án đúng (*)</label> <input type="text" placeholder={questionType === 'MULTIPLE_CHOICE' ? "Nhập nội dung đáp án đúng..." : (questionType === 'TRUE_FALSE' ? "Nhập 'True' hoặc 'False'" : "Nhập đáp án đúng...")} value={data.correctAnswer || ""} onChange={(e) => handleChangeFn("correctAnswer", e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} required /> {questionType === 'TRUE_FALSE' && <p className="text-xs text-gray-500 mt-1">Nhập chính xác "True" hoặc "False".</p>} </div>
                {/* Fill Answer (for Fill type) */}
                {questionType === 'FILL' && (<motion.div variants={fadeIn} initial="hidden" animate="show" className="mb-4"> <label className="block text-sm font-medium text-gray-600 mb-1">Đáp án điền từ</label> <input type="text" placeholder="Nhập từ cần điền..." value={data.fillAnswer || ""} onChange={(e) => handleChangeFn("fillAnswer", e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} /> <p className="text-xs text-gray-500 mt-1">Dùng khi đáp án đúng là câu hoàn chỉnh.</p> </motion.div>)}
            </>
        );
    };

    // 4. Thêm hàm xử lý upload Excel
    // --- Upload Excel Handler ---
    const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // setUploading(true); // Nếu có state loading
        setNotifMessage("Đang tải lên và xử lý file Excel...");

        const formData = new FormData();
        formData.append("file", file); // Đảm bảo key là "file"

        try {
            const response = await axios.post(`${API_URL}/questions/upload-excel`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // --- ✅ XỬ LÝ RESPONSE THEO CẤU TRÚC MỚI ---
            const responseData = response?.data; // Lấy toàn bộ data

            // Kiểm tra xem responseData có tồn tại không
            if (responseData) {
                // Lấy trực tiếp các trường từ responseData, dùng ?? 0 nếu không có
                const successCount = responseData.successCount ?? 0;
                const failureCount = responseData.failureCount ?? 0; // Sửa thành failureCount
                const errorMessages = responseData.errorMessages ?? []; // Sửa thành errorMessages

                let message = `Tải lên hoàn tất. Thành công: ${successCount}. Thất bại: ${failureCount}.`;

                // Format và hiển thị lỗi nếu có
                if (failureCount > 0 && errorMessages.length > 0) {
                    const errorDetails = errorMessages.map((msg: string, index: number) =>
                        `\n Lỗi ${index + 1}: ${msg}` // msg đã chứa thông tin dòng và lỗi
                    ).join('');
                    message += `\nChi tiết lỗi:${errorDetails}`;
                    console.warn("Upload error details:", errorMessages);
                }

                setNotifMessage(message);
                fetchQuestions(); // Tải lại danh sách câu hỏi

            } else {
                // Trường hợp response.data không tồn tại (lỗi mạng hoặc server cấu hình sai)
                console.error("API response OK but data is missing:", response);
                setNotifMessage("Tải lên thành công nhưng không nhận được dữ liệu phản hồi từ server.");
                fetchQuestions(); // Vẫn thử tải lại list
            }
            // --- KẾT THÚC XỬ LÝ ---

        } catch (err: any) {
            console.error("❌ Lỗi khi tải lên Excel:", err);
            const errorMsg = err.response?.data?.message || err.message || "Không thể tải lên file Excel.";
            setNotifMessage(`❌ Lỗi Upload: ${errorMsg}`);
        } finally {
            // setUploading(false); // Tắt loading
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    // 5. Thêm hàm trigger click input file
    const triggerFileInput = () => {
        // Chỉ trigger khi không đang upload
        if (!isUploadingExcel) {
            fileInputRef.current?.click();
        }
    };


    // --- Main Render ---
    return (
        <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
            <input
                type="file"
                ref={fileInputRef}
                hidden
                accept=".xlsx, .xls, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleExcelUpload}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header & Back Button */}
                <div className="flex justify-between items-center mb-6">
                    {/* Nút Back có thể trỏ về trang dashboard chính của giáo viên */}
                    <Link
                        to={`/teacher`} // Hoặc link phù hợp khác
                        className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
                    >
                        <IoMdArrowBack className="h-6 w-6" />
                        <span className="text-lg font-medium">Quay lại Dashboard</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={triggerFileInput}
                            disabled={isUploadingExcel}
                            className={`flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 shadow font-semibold transition-opacity ${isUploadingExcel ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUploadingExcel ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                <AiOutlineUpload />
                            )}
                            {isUploadingExcel ? 'Đang tải lên...' : 'Upload Excel'}
                        </button>
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full hover:bg-green-700 shadow font-semibold"
                        >
                            <AiOutlinePlus /> Thêm Câu hỏi mới
                        </button>
                    </div>

                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Ngân hàng Câu hỏi chung</h1>

                {/* Filters and Search */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow" style={{ boxShadow: neumorphicShadow }}>
                    {/* Search Input */}
                    <div className="md:col-span-2 relative">
                        <input
                            type="text"
                            placeholder="Tìm theo ID, nội dung, đáp án..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border p-3 pl-10 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 bg-gray-50"
                            style={{ boxShadow: insetShadow }}
                        />
                        <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {/* Filter by Type */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Loại câu hỏi</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full border p-3 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500"
                            style={{ boxShadow: insetShadow }}
                        >
                            <option value="ALL">Tất cả loại</option>
                            <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                            <option value="FILL">Điền từ</option>
                            <option value="TRUE_FALSE">Đúng/Sai</option>
                        </select>
                    </div>
                    {/* Filter by Category */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Thể loại</label>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full border p-3 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500"
                            style={{ boxShadow: insetShadow }}
                        >
                            <option value="ALL">Tất cả thể loại</option>
                            <option value="VOCABULARY">Từ vựng</option>
                            <option value="GRAMMAR">Ngữ pháp</option>
                            <option value="READING">Đọc hiểu</option>
                        </select>
                    </div>
                </div>

                {/* Question Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-60"><CircularProgress /></div>
                ) : filteredQuestions.length === 0 ? (
                    <p className="text-center italic text-gray-500 mt-10">
                        {questions.length === 0 ? 'Chưa có câu hỏi nào trong ngân hàng.' : 'Không tìm thấy câu hỏi phù hợp với bộ lọc.'}
                    </p>
                ) : (
                    <motion.div
                        initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                        style={{ boxShadow: neumorphicShadow }}
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thể loại</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đáp án đúng</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredQuestions.map((q) => (
                                        <motion.tr key={q.id} variants={fadeIn} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{q.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800 max-w-sm" title={q.content}><div className="line-clamp-2">{q.content}</div></td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{q.questionType}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{q.category}</td>
                                            <td className="px-6 py-4 text-sm text-green-700 font-semibold max-w-xs" title={q.correctAnswer}><span className="line-clamp-2">{q.correctAnswer}</span></td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                                                <button onClick={() => handleEditQuestion(q.id)} className="text-indigo-600 hover:text-indigo-900" title="Chỉnh sửa"> <AiOutlineEdit className="h-5 w-5 inline" /> </button>
                                                <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-600 hover:text-red-900" title="Xóa vĩnh viễn"> <AiOutlineDelete className="h-5 w-5 inline" /> </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Optional: Add Pagination if needed */}
                        <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
                            Hiển thị {filteredQuestions.length} / {questions.length} câu hỏi.
                        </div>
                    </motion.div>
                )}
            </div>

            {/* --- Modal Thêm Câu hỏi mới --- */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[52] p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)}>
                        <motion.div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>
                            <h3 className="text-xl font-semibold text-gray-800 mb-5">Thêm Câu hỏi mới vào Ngân hàng</h3>
                            {renderQuestionFormFields(newQuestionData, handleAddChange)}
                            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                                <button onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Hủy</button>
                                <button onClick={handleAddNewQuestion} disabled={saving} className={`px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {saving ? <CircularProgress size={20} color="inherit" /> : <AiOutlinePlus />}
                                    {saving ? 'Đang lưu...' : 'Thêm Câu hỏi'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Notification */}
            {notifMessage && (<NotificationModal message={notifMessage} onClose={() => setNotifMessage(null)} />)}
        </div >
    );
};

export default TeacherQuestionBankPage;