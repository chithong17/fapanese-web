import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom"; 
import { IoMdArrowBack } from "react-icons/io";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete, AiOutlineSearch, AiOutlineUpload, AiOutlineSave } from "react-icons/ai";
import axios from "axios";
import NotificationModal from "../../components/NotificationModal";
import CircularProgress from "@mui/material/CircularProgress";

// --- Interface (Giữ nguyên) ---
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

// --- Initial State for New Question (Giữ nguyên) ---
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

// --- Tailwind CSS Custom Styles (TINH CHỈNH CUỐI CÙNG & FIX LỖI) ---
const BACKGROUND_COLOR = "bg-gray-50"; 
const CARD_BASE_STYLE = "bg-white rounded-2xl shadow-xl border border-gray-100";
const ACCENT_COLOR = "text-indigo-600";
const BUTTON_PRIMARY_BG = "bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700";
const BUTTON_SECONDARY_BG = "bg-green-500 hover:bg-green-600 active:bg-green-700";
const BUTTON_SUCCESS_BG = "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700";
const BUTTON_LIGHT_BG = "bg-gray-200 hover:bg-gray-300 active:bg-gray-400";

// FIXED: Sử dụng lớp Tailwind hoàn toàn
const INPUT_BASE_STYLE = "w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200 shadow-sm";
const INPUT_SEARCH_STYLE = "w-full border border-gray-300 p-3 pl-12 rounded-lg focus:ring-2 focus:ring-cyan-300 focus:border-cyan-500 transition shadow-sm bg-gray-50";
const TABLE_HEADER_STYLE = "bg-gray-100 sticky top-0 z-10 shadow-sm border-b border-gray-200";

// Framer Motion Variants (Giữ nguyên)
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };


// --- Component ---
const TeacherQuestionBankPage: React.FC = () => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifMessage, setNotifMessage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("ALL"); 
    const [filterCategory, setFilterCategory] = useState<string>("ALL"); 

    // Add Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newQuestionData, setNewQuestionData] = useState<Partial<ExamQuestion>>(initialNewQuestionState);
    const [saving, setSaving] = useState(false); 

    const [isUploadingExcel, setIsUploadingExcel] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const token = localStorage.getItem("token") || "";
    const API_URL = "http://localhost:8080/fapanese/api";

    // --- Fetch All Questions (Giữ nguyên logic) ---
    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/questions`, { headers: { Authorization: `Bearer ${token}` } });
            setQuestions(res.data.result || res.data || []);
        } catch (err) { console.error("❌ Lỗi tải ngân hàng câu hỏi:", err); setNotifMessage("Không thể tải danh sách câu hỏi."); setQuestions([]); } finally { setLoading(false); }
    }, [token]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    // --- Filtered Questions (Giữ nguyên logic) ---
    const filteredQuestions = useMemo(() => {
        return questions
            .filter(q => filterType === 'ALL' || q.questionType === filterType)
            .filter(q => filterCategory === 'ALL' || q.category === filterCategory)
            .filter(q => {
                if (!searchTerm) return true;
                const lowerSearch = searchTerm.toLowerCase();
                return ( q.id.toString().includes(lowerSearch) || q.content.toLowerCase().includes(lowerSearch) || q.correctAnswer.toLowerCase().includes(lowerSearch) || q.optionA?.toLowerCase().includes(lowerSearch) || q.optionB?.toLowerCase().includes(lowerSearch) || q.optionC?.toLowerCase().includes(lowerSearch) || q.optionD?.toLowerCase().includes(lowerSearch) );
            });
    }, [questions, searchTerm, filterType, filterCategory]);

    // --- Modal Handlers (Giữ nguyên logic) ---
    const openAddModal = () => { setNewQuestionData(initialNewQuestionState); setShowAddModal(true); };
    const handleAddChange = (key: keyof ExamQuestion, value: string | null) => {
        setNewQuestionData((prev) => ({ ...prev, [key]: (value === '' && key !== 'content' && key !== 'correctAnswer') ? null : value }));
    };
    const handleAddNewQuestion = async () => { 
        /* ... logic post ... */ 
    }; 
    const handleDeleteQuestion = async (questionId: number) => { /* ... logic delete ... */ };
    const handleEditQuestion = (questionId: number) => { navigate(`/teacher/questions/${questionId}/edit`); };
    const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { /* ... logic upload ... */ };
    const triggerFileInput = () => { if (!isUploadingExcel) { fileInputRef.current?.click(); } };

    // --- Render Add/Edit Form Fields (Đồng bộ style) ---
    const renderQuestionFormFields = (data: Partial<ExamQuestion>, handleChangeFn: Function) => {
        const questionType = data.questionType;
        return (
            <>
                {/* Content (Required) */}
                <div className="mb-4"> <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung câu hỏi <span className="text-red-500">*</span></label> <textarea placeholder="Nhập nội dung câu hỏi..." value={data.content || ""} onChange={(e) => handleChangeFn("content", e.target.value)} className={`${INPUT_BASE_STYLE} min-h-[120px]`} required /> </div>
                {/* Category & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div> <label className="block text-sm font-semibold text-gray-700 mb-2">Thể loại <span className="text-red-500">*</span></label> <select value={data.category || "VOCABULARY"} onChange={(e) => handleChangeFn("category", e.target.value)} className={`${INPUT_BASE_STYLE} bg-white`}> <option value="VOCABULARY">Từ vựng</option> <option value="GRAMMAR">Ngữ pháp</option> <option value="READING">Đọc hiểu</option> </select> </div>
                    <div> <label className="block text-sm font-semibold text-gray-700 mb-2">Loại câu hỏi <span className="text-red-500">*</span></label> <select value={data.questionType || "MULTIPLE_CHOICE"} onChange={(e) => handleChangeFn("questionType", e.target.value)} className={`${INPUT_BASE_STYLE} bg-white`}> <option value="MULTIPLE_CHOICE">Trắc nghiệm</option> <option value="FILL">Điền từ</option> <option value="TRUE_FALSE">Đúng/Sai</option> </select> </div>
                </div>
                {/* Options (for Multiple Choice) */}
                {questionType === 'MULTIPLE_CHOICE' && (<motion.div variants={itemVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"> {['A', 'B', 'C', 'D'].map(opt => (<motion.div key={opt} variants={itemVariants}> <label className="block text-sm font-medium text-gray-600 mb-1">Đáp án {opt}</label> <input type="text" placeholder={`Nội dung đáp án ${opt}...`} value={data[`option${opt}` as keyof ExamQuestion] as string || ""} onChange={(e) => handleChangeFn(`option${opt}` as keyof ExamQuestion, e.target.value)} className={INPUT_BASE_STYLE} /> </motion.div>))} </motion.div>)}
                {/* Correct Answer (Required) */}
                <div className="mb-4"> <label className="block text-sm font-semibold text-gray-700 mb-2">Đáp án đúng <span className="text-red-500">*</span></label> <input type="text" placeholder={questionType === 'MULTIPLE_CHOICE' ? "Nhập chữ cái (A, B, C, D) của đáp án đúng" : (questionType === 'TRUE_FALSE' ? "Nhập 'True' hoặc 'False'" : "Nhập đáp án đúng...")} value={data.correctAnswer || ""} onChange={(e) => handleChangeFn("correctAnswer", e.target.value)} className={INPUT_BASE_STYLE} required /> {questionType === 'TRUE_FALSE' && <p className="text-xs text-gray-500 mt-1">Nhập chính xác "True" hoặc "False".</p>} {questionType === 'MULTIPLE_CHOICE' && <p className="text-xs text-gray-500 mt-1">Đối với trắc nghiệm, nhập chữ cái của đáp án đúng (ví dụ: "A").</p>} </div>
                {/* Fill Answer (for Fill type) */}
                {questionType === 'FILL' && (<motion.div variants={itemVariants} initial="hidden" animate="show" className="mb-4"> <label className="block text-sm font-semibold text-gray-700 mb-2">Từ/cụm từ điền vào chỗ trống</label> <input type="text" placeholder="Nhập từ cần điền..." value={data.fillAnswer || ""} onChange={(e) => handleChangeFn("fillAnswer", e.target.value)} className={INPUT_BASE_STYLE} /> <p className="text-xs text-gray-500 mt-1">Chỉ dùng khi câu hỏi yêu cầu điền một từ hoặc cụm từ cụ thể.</p> </motion.div>)}
            </>
        );
    };

    // --- Main Render ---
    return (
        <div className={`min-h-screen ${BACKGROUND_COLOR}`}>
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                hidden
                accept=".xlsx, .xls, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleExcelUpload}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* --- 1. HEADER VÀ NÚT HÀNH ĐỘNG --- */}
                <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-300">
                    {/* Tiêu đề & Back Button */}
                    <div className="flex items-center gap-6">
                        <Link
                            to={`/teacher`}
                            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
                        >
                            <IoMdArrowBack className="h-6 w-6" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ngân hàng Câu hỏi</h1>
                    </div>
                    
                    {/* Nút Hành động */}
                    <div className="flex items-center gap-4">
                        {/* Upload Excel Button */}
                        <motion.button
                            onClick={triggerFileInput}
                            disabled={isUploadingExcel}
                            className={`flex items-center gap-2 ${BUTTON_SECONDARY_BG} text-white px-6 py-3 rounded-full shadow-md font-semibold transition-all duration-200 ${isUploadingExcel ? 'opacity-60 cursor-not-allowed' : ''}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isUploadingExcel ? <CircularProgress size={20} color="inherit" /> : <AiOutlineUpload className="h-5 w-5" />}
                            {isUploadingExcel ? 'Đang tải lên...' : 'Upload Excel'}
                        </motion.button>
                        {/* Add New Question Button */}
                        <motion.button
                            onClick={openAddModal}
                            className={`flex items-center gap-2 ${BUTTON_PRIMARY_BG} text-white px-6 py-3 rounded-full shadow-md font-semibold transition-all duration-200`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <AiOutlinePlus className="h-5 w-5" /> Thêm mới
                        </motion.button>
                    </div>
                </div>

                {/* --- 2. FILTERS VÀ SEARCH BAR --- */}
                <motion.div
                    className={`mb-8 p-6 ${CARD_BASE_STYLE} grid grid-cols-1 md:grid-cols-4 gap-5`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
                    {/* Search Input */}
                    <div className="md:col-span-2 relative">
    <label className="block text-sm font-medium text-gray-600 mb-2">Tìm kiếm</label>
                        <AiOutlineSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 mt-3 ${ACCENT_COLOR}`} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm câu hỏi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={INPUT_SEARCH_STYLE}
                        />
                    </div>
                    {/* Filter by Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Loại câu hỏi</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className={`${INPUT_BASE_STYLE} bg-white`}
                        >
                            <option value="ALL">Tất cả loại</option>
                            <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                            <option value="FILL">Điền từ</option>
                            <option value="TRUE_FALSE">Đúng/Sai</option>
                        </select>
                    </div>
                    {/* Filter by Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Thể loại</label>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className={`${INPUT_BASE_STYLE} bg-white`}
                        >
                            <option value="ALL">Tất cả thể loại</option>
                            <option value="VOCABULARY">Từ vựng</option>
                            <option value="GRAMMAR">Ngữ pháp</option>
                            <option value="READING">Đọc hiểu</option>
                        </select>
                    </div>
                </motion.div>

                {/* --- 3. BẢNG CÂU HỎI --- */}
                {loading ? (
                    <div className="flex justify-center items-center h-60">
                        <CircularProgress className={ACCENT_COLOR} />
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <p className={`text-center italic text-gray-600 mt-10 p-8 ${CARD_BASE_STYLE}`}>
                        {questions.length === 0 ? 'Chưa có câu hỏi nào trong ngân hàng.' : 'Không tìm thấy câu hỏi phù hợp với bộ lọc.'}
                    </p>
                ) : (
                    <motion.div
                        variants={containerVariants} initial="hidden" animate="show"
                        className={`${CARD_BASE_STYLE} overflow-hidden`}
                    >
                        <div className="overflow-x-auto ">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className={TABLE_HEADER_STYLE}>
                                    <tr>
                                        <th scope="col" className="w-16 px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nội dung</th>
                                        <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Loại</th>
                                        <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thể loại</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Đáp án đúng</th>
                                        <th scope="col" className="w-32 px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredQuestions.map((q) => (
                                        <motion.tr
                                            key={q.id}
                                            variants={itemVariants}
                                            className="hover:bg-indigo-50/20 transition-all duration-150"
                                        >
                                            <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-gray-600">{q.id}</td>
                                            <td className="px-6 py-3.5 text-sm text-gray-800 max-w-sm" title={q.content}>
                                                <div className="line-clamp-2">{q.content}</div>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                                ${q.questionType === 'MULTIPLE_CHOICE' ? 'bg-purple-100 text-purple-800' :
                                                q.questionType === 'FILL' ? 'bg-orange-100 text-orange-800' :
                                                'bg-teal-100 text-teal-800'}`}>
                                                    {q.questionType.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-600">{q.category}</td>
                                            <td className="px-6 py-3.5 text-sm font-semibold text-emerald-700 max-w-xs">
                                                <span className="line-clamp-2" title={q.correctAnswer}>{q.correctAnswer}</span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-center space-x-2">
                                                <motion.button
                                                    onClick={(e) => { e.stopPropagation(); handleEditQuestion(q.id); }}
                                                    className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full transition-colors"
                                                    title="Chỉnh sửa"
                                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <AiOutlineEdit className="h-5 w-5" />
                                                </motion.button>
                                                <motion.button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-full transition-colors"
                                                    title="Xóa vĩnh viễn"
                                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <AiOutlineDelete className="h-5 w-5" />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Table Footer */}
                        <div className="p-4 border-t border-gray-200 text-sm text-gray-600 bg-gray-50/50 rounded-b-xl">
                            Hiển thị {filteredQuestions.length} / {questions.length} câu hỏi.
                        </div>
                    </motion.div>
                )}
            </div>

            {/* --- Add New Question Modal --- */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[52] p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)}>
                        <motion.div
                            className={`p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto ${CARD_BASE_STYLE} rounded-2xl`}
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Thêm Câu hỏi mới</h3>
                            {renderQuestionFormFields(newQuestionData, handleAddChange)}
                            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                                <motion.button
                                    onClick={() => setShowAddModal(false)}
                                    className={`px-6 py-2.5 rounded-full ${BUTTON_LIGHT_BG} text-gray-700 font-medium transition-all duration-200`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Hủy
                                </motion.button>
                                <motion.button
                                    onClick={handleAddNewQuestion}
                                    disabled={saving}
                                    className={`px-6 py-2.5 rounded-full ${BUTTON_SUCCESS_BG} text-white flex items-center gap-2 font-semibold transition-all duration-200 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {saving ? <CircularProgress size={20} color="inherit" /> : <AiOutlinePlus className="h-5 w-5" />}
                                    {saving ? 'Đang lưu...' : 'Thêm Câu hỏi'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Modal */}
            {notifMessage && (<NotificationModal message={notifMessage} onClose={() => setNotifMessage(null)} />)}
        </div >
    );
};

export default TeacherQuestionBankPage;