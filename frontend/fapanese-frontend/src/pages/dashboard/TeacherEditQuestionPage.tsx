import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { AiOutlineSave } from "react-icons/ai";
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
  fillAnswer?: string | null; // Dùng cho loại FILL
}

// --- Styles ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "8px 8px 15px #c6c9cc, -4px -4px 15px #ffffff";
const insetShadow = "inset 4px 4px 8px #c6c9cc, inset -4px -4px 8px #ffffff";
const fadeIn = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// --- Component ---
const TeacherEditQuestionPage: React.FC = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [questionData, setQuestionData] = useState<Partial<ExamQuestion>>({}); // Dùng Partial để khởi tạo rỗng
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [originalQuestionData, setOriginalQuestionData] = useState<Partial<ExamQuestion>>({}); // Lưu trữ dữ liệu gốc để so sánh

  const token = localStorage.getItem("token") || "";
  const API_URL = "http://localhost:8080/fapanese/api";

  // --- Fetch Question Data ---
  const fetchQuestion = useCallback(async () => {
    if (!questionId) {
      setNotifMessage("Lỗi: Không tìm thấy ID câu hỏi.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.result || res.data;
      setQuestionData(data);
      setOriginalQuestionData(data); // Lưu bản gốc
    } catch (err) {
      console.error("❌ Lỗi tải dữ liệu câu hỏi:", err);
      setNotifMessage("Không thể tải dữ liệu câu hỏi này.");
      setQuestionData({}); // Reset data on error
      setOriginalQuestionData({});
    } finally {
      setLoading(false);
    }
  }, [questionId, token]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  // --- Handle Form Change ---
  const handleChange = (key: keyof ExamQuestion, value: string | null) => {
    setQuestionData((prev) => ({
        ...prev,
        // Nếu value là chuỗi rỗng, gán null (trừ correctAnswer và content là bắt buộc)
        [key]: (value === '' && key !== 'correctAnswer' && key !== 'content') ? null : value
    }));
  };

  // --- Handle Save ---
  const handleSave = async () => {
    if (!questionId || !questionData.content || !questionData.correctAnswer) {
      setNotifMessage("Lỗi: Nội dung câu hỏi và đáp án đúng không được để trống.");
      return;
    }
    setSaving(true);
    setNotifMessage(null);

    // Chuẩn bị payload, chỉ gửi những trường có trong form
    const payload: Partial<ExamQuestion> = {
        content: questionData.content,
        category: questionData.category,
        questionType: questionData.questionType,
        optionA: questionData.optionA || null,
        optionB: questionData.optionB || null,
        optionC: questionData.optionC || null,
        optionD: questionData.optionD || null,
        correctAnswer: questionData.correctAnswer,
        fillAnswer: questionData.questionType === 'FILL' ? (questionData.fillAnswer || null) : null, // Chỉ gửi fillAnswer nếu type là FILL
    };

     // Chỉ gửi các option nếu là MULTIPLE_CHOICE
     if (questionData.questionType !== 'MULTIPLE_CHOICE') {
         delete payload.optionA;
         delete payload.optionB;
         delete payload.optionC;
         delete payload.optionD;
     }


    try {
      await axios.put(`${API_URL}/questions/${questionId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifMessage("Cập nhật câu hỏi thành công!");
      setOriginalQuestionData(questionData); // Cập nhật bản gốc sau khi lưu thành công
      // Cân nhắc: có nên navigate(-1) sau khi lưu thành công?
      // navigate(-1); // Quay lại trang trước đó
    } catch (err: any) {
      console.error("❌ Lỗi khi cập nhật câu hỏi:", err);
      setNotifMessage(`❌ Không thể cập nhật: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

   // Kiểm tra xem form đã thay đổi chưa
   const hasChanges = JSON.stringify(questionData) !== JSON.stringify(originalQuestionData);

  // --- Render Form Fields based on Type ---
  const renderFormFields = () => {
    if (!questionData || Object.keys(questionData).length === 0) return null;

    const { questionType } = questionData;

    return (
      <>
        {/* Content (Required) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Nội dung câu hỏi (*)</label>
          <textarea
            placeholder="Nhập nội dung câu hỏi..."
            value={questionData.content || ""}
            onChange={(e) => handleChange("content", e.target.value)}
            className="w-full border p-3 rounded-lg min-h-[100px] focus:ring-cyan-500 focus:border-cyan-500"
            style={{ boxShadow: insetShadow }}
            required
          />
        </div>

        {/* Category & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
             <label className="block text-sm font-medium text-gray-600 mb-1">Thể loại (*)</label>
             <select
                value={questionData.category || "VOCABULARY"}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full border p-3 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500"
                style={{ boxShadow: insetShadow }}
              >
                <option value="VOCABULARY">Từ vựng (Vocabulary)</option>
                <option value="GRAMMAR">Ngữ pháp (Grammar)</option>
                <option value="READING">Đọc hiểu (Reading)</option>
              </select>
          </div>
           <div>
             <label className="block text-sm font-medium text-gray-600 mb-1">Loại câu hỏi (*)</label>
             <select
                value={questionData.questionType || "MULTIPLE_CHOICE"}
                onChange={(e) => handleChange("questionType", e.target.value)}
                className="w-full border p-3 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500"
                style={{ boxShadow: insetShadow }}
              >
                <option value="MULTIPLE_CHOICE">Trắc nghiệm (Multiple Choice)</option>
                <option value="FILL">Điền vào chỗ trống (Fill)</option>
                <option value="TRUE_FALSE">Đúng/Sai (True/False)</option>
              </select>
          </div>
        </div>

        {/* Options (for Multiple Choice) */}
        {questionType === 'MULTIPLE_CHOICE' && (
          <motion.div variants={fadeIn} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             {['A', 'B', 'C', 'D'].map(opt => (
                 <div key={opt}>
                     <label className="block text-sm font-medium text-gray-600 mb-1">Đáp án {opt}</label>
                     <input
                        type="text"
                        placeholder={`Nội dung đáp án ${opt}...`}
                        value={questionData[`option${opt}` as keyof ExamQuestion] as string || ""}
                        onChange={(e) => handleChange(`option${opt}` as keyof ExamQuestion, e.target.value)}
                        className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                        style={{ boxShadow: insetShadow }}
                      />
                 </div>
             ))}
          </motion.div>
        )}

        {/* Correct Answer (Required) */}
         <div className="mb-4">
             <label className="block text-sm font-medium text-gray-600 mb-1">Đáp án đúng (*)</label>
             <input
                type="text"
                placeholder={questionType === 'MULTIPLE_CHOICE' ? "Nhập nội dung đáp án đúng (giống hệt một trong các options)" : (questionType === 'TRUE_FALSE' ? "Nhập 'True' hoặc 'False'" : "Nhập đáp án đúng...")}
                value={questionData.correctAnswer || ""}
                onChange={(e) => handleChange("correctAnswer", e.target.value)}
                className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                style={{ boxShadow: insetShadow }}
                required
              />
               {questionType === 'TRUE_FALSE' && <p className="text-xs text-gray-500 mt-1">Vui lòng nhập chính xác "True" hoặc "False" (phân biệt hoa thường).</p>}
         </div>


        {/* Fill Answer (for Fill type) */}
        {questionType === 'FILL' && (
          <motion.div variants={fadeIn} initial="hidden" animate="show" className="mb-4">
             <label className="block text-sm font-medium text-gray-600 mb-1">Đáp án điền từ (Fill Answer)</label>
             <input
                type="text"
                placeholder="Nhập đáp án cho loại điền từ (nếu cần)..."
                value={questionData.fillAnswer || ""}
                onChange={(e) => handleChange("fillAnswer", e.target.value)}
                className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                style={{ boxShadow: insetShadow }}
              />
             <p className="text-xs text-gray-500 mt-1">Trường này thường dùng khi đáp án đúng (`correctAnswer`) là câu hoàn chỉnh, còn `fillAnswer` chỉ chứa từ cần điền.</p>
          </motion.div>
        )}
      </>
    );
  };

  // --- Main Render ---
  return (
    <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header & Back Button */}
        <div className="flex justify-between items-center mb-6">
          {/* Nút Back - Sử dụng navigate(-1) để quay lại trang trước đó */}
          <button
            onClick={() => navigate(-1)} // Quay lại trang trước đó
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
          >
            <IoMdArrowBack className="h-6 w-6" />
            <span className="text-lg font-medium">Quay lại</span>
          </button>
          {/* Save Button */}
           <button
              onClick={handleSave}
              disabled={saving || !hasChanges} // Disable nếu đang lưu hoặc không có thay đổi
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full shadow font-semibold transition-all duration-300 ${
                  saving
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : !hasChanges
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
           >
              {saving ? <CircularProgress size={20} color="inherit"/> : <AiOutlineSave/>}
              Lưu thay đổi
           </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Chỉnh sửa Câu hỏi (ID: {questionId})
        </h1>

        {/* Form Area */}
        {loading ? (
            <div className="flex justify-center items-center h-60"><CircularProgress /></div>
        ) : !questionData || Object.keys(questionData).length === 0 ? (
             <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg">Không thể tải dữ liệu câu hỏi.</p>
        ) : (
            <motion.div
                variants={fadeIn} initial="hidden" animate="show"
                className="bg-white rounded-lg shadow-md p-6"
                style={{ boxShadow: neumorphicShadow }}
            >
                {renderFormFields()}
            </motion.div>
        )}
      </div>

       {/* Notification */}
      {notifMessage && ( <NotificationModal message={notifMessage} onClose={() => setNotifMessage(null)} /> )}
    </div>
  );
};

export default TeacherEditQuestionPage;