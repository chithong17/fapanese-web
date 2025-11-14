import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    AiOutlinePlus,
    AiOutlineEdit,
    AiOutlineDelete,
    AiOutlineArrowLeft,
} from "react-icons/ai";
import { IoMdArrowBack } from "react-icons/io";
import { BiBookContent } from "react-icons/bi";
import axios from "axios";
import NotificationModal from "../../components/NotificationModal";

// --- Định nghĩa Interface ---
interface OverviewPart {
    id: number;
    title: string;
    type: "SPEAKING" | "MIDDLE_EXAM" | "FINAL_EXAM" | string;
    overviewId: number;
}

interface SpeakingExam {
    id: number;
    overviewPartId: number;
    title: string;
    type: "PASSAGE" | "PICTURE" | "QUESTION" | string;
    speakings: any[]; // Mảng các bài tập speaking con
}

interface Exam {
    id: number;
    overviewPartId: number;
    examTitle: string;
    semester: string;
    type: string; // "FE", "ME", "B3_FE"...
    year: number;
    questions: any[]; // Mảng các câu hỏi
}

// --- Cấu hình style ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "20px 20px 40px #c6c9cc, -10px -10px 40px #ffffff";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// --- Component Chính ---
const TeacherManageOverviewContentPage: React.FC = () => {
    const { courseCode, overviewId, partId } = useParams();
    const navigate = useNavigate();

    const [currentPart, setCurrentPart] = useState<OverviewPart | null>(null);
    const [contentItems, setContentItems] = useState<any[]>([]); // Sẽ chứa SpeakingExam[] hoặc Exam[]
    const [loading, setLoading] = useState(true);
    const [notifMessage, setNotifMessage] = useState<string | null>(null);

    // State cho Modal
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({}); // Form data động

    const token = localStorage.getItem("token") || "";
    const API_URL = "https://fapanese-backend-production.up.railway.app/fapanese/api";

    // --- Step 1: Lấy thông tin của Part (để biết type) ---
    const fetchPartInfo = async () => {
        if (!partId) return;
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/overview-parts/${partId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const partData = res.data.result || res.data;
            setCurrentPart(partData);
            // Dựa vào type, gọi hàm fetch nội dung tương ứng
            fetchContent(partData.type);
        } catch (err) {
            console.error("❌ Lỗi tải thông tin part:", err);
            setNotifMessage("Không thể tải thông tin mục này.");
            setLoading(false);
        }
    };

    // --- Step 2: Lấy danh sách nội dung (Exam/Speaking) ---
    const fetchContent = async (partType: string) => {
        let url = "";
        switch (partType) {
            case "SPEAKING":
                url = `${API_URL}/speaking-exams/by-overview-part/${partId}`;
                break;
            case "MIDDLE_EXAM":
                url = `${API_URL}/middle-exams/by-overview-part/${partId}`;
                break;
            case "FINAL_EXAM":
                url = `${API_URL}/final-exams/by-overview-part/${partId}`;
                break;
            default:
                setLoading(false);
                return;
        }

        try {
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setContentItems(res.data.result || res.data || []);
        } catch (err) {
            console.error(`❌ Lỗi tải nội dung cho ${partType}:`, err);
            setNotifMessage("Không thể tải danh sách nội dung.");
        } finally {
            setLoading(false);
        }
    };

    // Chạy khi component mount
    useEffect(() => {
        fetchPartInfo();
    }, [partId]);

    // --- Mở Modal (Thêm mới hoặc Chỉnh sửa) ---
    const openModal = (item?: any) => {
        setEditingItem(item || null);
        // Dựa vào type của part để khởi tạo form
        switch (currentPart?.type) {
            case "SPEAKING":
                setFormData({
                    title: item?.title || "",
                    type: item?.type || "PASSAGE", // Loại của SpeakingExam
                });
                break;
            case "MIDDLE_EXAM":
            case "FINAL_EXAM":
                setFormData({
                    examTitle: item?.examTitle || "",
                    semester: item?.semester || "HK1",
                    type: item?.type || "FE", // Loại của kỳ thi (FE, ME, RE...)
                    year: item?.year || new Date().getFullYear(),
                    // Chuyển mảng questions (nếu có) thành chuỗi ID "1, 2, 3"
                });
                break;
        }
        setShowModal(true);
    };

    // --- Xử lý thay đổi Form ---
    const handleChange = (key: string, value: string | number) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    // --- Xử lý Lưu (Thêm/Sửa) ---
    const handleSave = async () => {
        if (!currentPart) return;

        let payload: any;
        let url = "";
        let method: "post" | "put" = "post";

        try {
            // Build payload và URL dựa trên loại part
            switch (currentPart.type) {
                case "SPEAKING":
                    payload = {
                        overviewPartId: Number(partId),
                        title: formData.title,
                        type: formData.type, // 'PASSAGE', 'PICTURE', 'QUESTION'
                    };
                    url = editingItem
                        ? `${API_URL}/speaking-exams/${editingItem.id}`
                        : `${API_URL}/speaking-exams`;
                    method = editingItem ? "put" : "post";
                    break;

                case "MIDDLE_EXAM":
                case "FINAL_EXAM":
                    payload = {
                        overviewPartId: Number(partId),
                        examTitle: formData.examTitle,
                        semester: formData.semester,
                        type: formData.type,
                        year: Number(formData.year),
                        // Chuyển chuỗi "1, 2, 3" thành mảng số [1, 2, 3]
                        questionIds: formData.questionIds
                            .split(",")
                            .map((s: string) => Number(s.trim()))
                            .filter(Number), // Lọc ra các số 0 hoặc NaN
                    };

                    if (currentPart.type === "MIDDLE_EXAM") {
                        url = editingItem
                            ? `${API_URL}/middle-exams/${editingItem.id}`
                            : `${API_URL}/middle-exams`;
                    } else {
                        url = editingItem
                            ? `${API_URL}/final-exams/${editingItem.id}`
                            : `${API_URL}/final-exams`;
                    }
                    method = editingItem ? "put" : "post";
                    break;

                default:
                    throw new Error("Loại part không xác định");
            }

            // Gọi API
            await axios[method](url, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setNotifMessage("Lưu nội dung thành công!");
            setShowModal(false);
            fetchContent(currentPart.type); // Tải lại danh sách
        } catch (err) {
            console.error("❌ Lỗi khi lưu nội dung:", err);
            setNotifMessage("❌ Không thể lưu nội dung.");
        }
    };

    // --- Xử lý Xóa ---
    const handleDelete = async (item: any) => {
        if (!currentPart || !item) return;
        if (!window.confirm("Bạn chắc chắn muốn xóa nội dung này?")) return;

        let url = "";
        switch (currentPart.type) {
            case "SPEAKING":
                url = `${API_URL}/speaking-exams/${item.id}`;
                break;
            case "MIDDLE_EXAM":
                url = `${API_URL}/middle-exams/${item.id}`;
                break;
            case "FINAL_EXAM":
                url = `${API_URL}/final-exams/${item.id}`;
                break;
            default:
                return;
        }

        try {
            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifMessage("Xóa nội dung thành công!");
            fetchContent(currentPart.type); // Tải lại danh sách
        } catch (err) {
            console.error("❌ Lỗi khi xóa nội dung:", err);
            setNotifMessage("❌ Không thể xóa nội dung!");
        }
    };

    const handleManageDetails = (item: any) => {
        // Xác định xem item hiện tại là Speaking Exam hay Exam (Middle/Final)
        const isSpeaking = currentPart?.type === "SPEAKING";

        if (isSpeaking) {
            // Nếu là Speaking, điều hướng đến trang quản lý các Speaking Item con
            // item.id ở đây chính là speakingExamId
            navigate(
                `/teacher/courses/${courseCode}/overviews/${overviewId}/parts/${partId}/manage-content/speaking/${item.id}/items`
            );
        } else {
            // ✅ ĐIỀU HƯỚNG ĐẾN TRANG QUẢN LÝ CÂU HỎI EXAM
            // item.id ở đây là examId (MiddleExam hoặc FinalExam ID)
            navigate(
                `/teacher/courses/${courseCode}/overviews/${overviewId}/parts/${partId}/manage-content/exam/${item.id}/questions`
            );
        }
    };

    // --- Render Form động trong Modal ---
    const renderModalForm = () => {
        if (!currentPart) return null;

        switch (currentPart.type) {
            case "SPEAKING":
                return (
                    <>
                        <input
                            type="text"
                            placeholder="Tiêu đề (VD: Chủ đề Gia đình)"
                            value={formData.title || ""}
                            onChange={(e) => handleChange("title", e.target.value)}
                            className="border p-3 rounded-lg"
                        />
                        <select
                            value={formData.type || "PASSAGE"}
                            onChange={(e) => handleChange("type", e.target.value)}
                            className="border p-3 rounded-lg bg-white"
                        >
                            <option value="PASSAGE">Dạng Văn bản (Passage)</option>
                            <option value="PICTURE">Dạng Hình ảnh (Picture)</option>
                            <option value="QUESTION">Dạng Câu hỏi (Question)</option>
                        </select>
                    </>
                );

            case "MIDDLE_EXAM":
            case "FINAL_EXAM":
                return (
                    <>
                        <input
                            type="text"
                            placeholder="Tiêu đề kỳ thi (VD: Đề thi cuối kỳ B3)"
                            value={formData.examTitle || ""}
                            onChange={(e) => handleChange("examTitle", e.target.value)}
                            className="border p-3 rounded-lg"
                        />
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="Học kỳ (VD: HK1)"
                                value={formData.semester || ""}
                                onChange={(e) => handleChange("semester", e.target.value)}
                                className="border p-3 rounded-lg"
                            />
                            <select
                                value={formData.type || "FE"}
                                onChange={(e) => handleChange("type", e.target.value)}
                                className="border p-3 rounded-lg bg-white"
                            >
                                <option value="FE">Final Exam (FE)</option>
                                <option value="ME">Middle Exam (ME)</option>
                                <option value="RE">Re-test (RE)</option>
                                <option value="B3_FE">B3 Final Exam</option>
                                <option value="B3_RE">B3 Re-test</option>
                                <option value="B5_FE">B5 Final Exam</option>
                                <option value="B5_RE">B5 Re-test</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Năm"
                                value={formData.year || ""}
                                onChange={(e) => handleChange("year", Number(e.target.value))}
                                className="border p-3 rounded-lg"
                            />
                        </div>
                    </>
                );
            default:
                return <p>Loại nội dung không được hỗ trợ.</p>;
        }
    };

    // --- Render 1 Card nội dung ---
    const renderItemCard = (item: any) => {
        const isSpeaking = currentPart?.type === "SPEAKING";
        const title = isSpeaking ? item.title : item.examTitle;
        const stats = isSpeaking
            ? `${item.speakings?.length || 0} bài tập con`
            : `${item.questions?.length || 0} câu hỏi`;

        return (
            <motion.div
                key={item.id}
                variants={fadeIn}
                className="group bg-white rounded-[30px] p-6 flex flex-col justify-between 
                        transition-all duration-300 hover:shadow-2xl hover:bg-white relative"
                style={{ boxShadow: neumorphicShadow, minHeight: "220px" }}
            >
                {/* CRUD Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                        onClick={() => openModal(item)}
                        className="p-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500"
                    >
                        <AiOutlineEdit />
                    </button>
                    <button
                        onClick={() => handleDelete(item)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                        <AiOutlineDelete />
                    </button>
                </div>

                {/* Content */}
                <div>
                    <BiBookContent className="h-12 w-12 mb-3 text-cyan-600 opacity-80" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">
                        {title || "Chưa đặt tiêu đề"}
                    </h3>
                    <p className="text-sm font-semibold uppercase text-gray-500 tracking-wider">
                        {isSpeaking ? `Loại: ${item.type}` : `Kỳ: ${item.semester} - ${item.year}`}
                    </p>
                    <p className="text-sm font-medium text-cyan-700 mt-1">
                        {stats}
                    </p>
                </div>

                {/* Manage Button */}
                <motion.button
                    onClick={() => handleManageDetails(item)}
                    className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform text-lg tracking-wider"
                    whileHover={{ scale: 1.05, y: -2 }}
                >
                    {isSpeaking ? "Quản lý Bài tập con" : "Quản lý Câu hỏi"}
                </motion.button>
            </motion.div>
        );
    };

    // --- Main Render ---
    if (loading)
        return (
            <div className="flex justify-center items-center h-screen">
                Đang tải...
            </div>
        );

    return (
        <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* --- Header và Nút Back --- */}
                <div className="flex justify-between items-center mb-10">
                    <Link
                        to={`/teacher/courses/${courseCode}/overviews/${overviewId}/manage-parts`}
                        className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
                    >
                        <IoMdArrowBack className="h-6 w-6" />
                        <span className="text-lg font-medium">Quay lại Mục ôn tập</span>
                    </Link>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-full hover:bg-cyan-700 shadow font-semibold"
                    >
                        <AiOutlinePlus /> Thêm Nội dung
                    </button>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Quản lý Nội dung cho:
                </h1>
                <p className="text-xl text-cyan-700 font-semibold mb-8">
                    {currentPart?.title}
                </p>

                {/* --- Danh sách các Part --- */}
                {contentItems.length === 0 ? (
                    <p className="text-center italic text-gray-500">
                        Chưa có nội dung nào. Bấm "Thêm Nội dung" để bắt đầu.
                    </p>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {contentItems.map((item) => renderItemCard(item))}
                    </motion.div>
                )}
            </div>

            {/* --- Modal Thêm/Sửa Nội dung --- */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-6 w-[600px] shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ y: -40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -40, opacity: 0 }}
                        >
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                {editingItem ? "Chỉnh sửa nội dung" : "Thêm nội dung mới"}
                            </h3>

                            <div className="flex flex-col gap-4">
                                {/* Form động sẽ được render ở đây */}
                                {renderModalForm()}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-5 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700"
                                >
                                    Lưu
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification */}
            {notifMessage && (
                <NotificationModal
                    message={notifMessage}
                    onClose={() => setNotifMessage(null)}
                />
            )}
        </div>
    );
};

export default TeacherManageOverviewContentPage;