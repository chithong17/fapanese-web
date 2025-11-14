import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { AiOutlineCheckCircle, AiOutlinePlusCircle, AiOutlineSearch, AiOutlineEdit } from "react-icons/ai";
import axios from "axios";
import NotificationModal from "../../components/NotificationModal";
import CircularProgress from "@mui/material/CircularProgress"; // For loading indicator

// --- Interfaces ---
interface ExamQuestion { // From question-controller
  id: number;
  content: string;
  category: string;
  questionType: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  fillAnswer?: string;
}

interface Exam { // From middle/final-exam-controller
  id: number;
  overviewPartId: number;
  examTitle: string;
  semester: string;
  type: string;
  year: number;
  questions: ExamQuestion[]; // List of questions currently in the exam
}

interface OverviewPart { // For context
    id: number;
    title: string;
    type: "MIDDLE_EXAM" | "FINAL_EXAM"; // Type context
}


// --- Styles ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "8px 8px 15px #c6c9cc, -4px -4px 15px #ffffff";
const insetShadow = "inset 4px 4px 8px #c6c9cc, inset -4px -4px 8px #ffffff";
const fadeIn = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };


// --- Component ---
const TeacherManageExamQuestionsPage: React.FC = () => {
  // examId is the ID of the MiddleExam or FinalExam
  const { courseCode, overviewId, partId, examId } = useParams();
  const navigate = useNavigate();

  const [currentPart, setCurrentPart] = useState<OverviewPart | null>(null); // Parent Part info (for type)
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);         // Current Exam info
  const [allQuestions, setAllQuestions] = useState<ExamQuestion[]>([]);      // All questions from /api/questions
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set()); // IDs of questions selected for this exam
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Loading state for save button
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // Search filter for available questions

  const token = localStorage.getItem("token") || "";
  const API_URL = "https://fapanese-backend-production.up.railway.app/fapanese/api";

  // --- Determine Exam Type ---
  // We need to know the part type to call the correct API endpoint
  useEffect(() => {
    const fetchPartType = async () => {
        if (!partId) return;
        try {
            const res = await axios.get(`${API_URL}/overview-parts/${partId}`, { headers: { Authorization: `Bearer ${token}` } });
            setCurrentPart(res.data.result);
        } catch (err) {
            console.error("❌ Error fetching part info:", err);
            setNotifMessage("Không thể xác định loại đề thi.");
            setLoading(false);
        }
    };
    fetchPartType();
  }, [partId]);


  // --- Fetch Exam Details & All Questions ---
  const fetchData = useCallback(async () => {
    if (!examId || !currentPart) {
      // If part type isn't loaded yet, wait. If no examId, show error.
       if (!examId) setNotifMessage("Lỗi: Không tìm thấy ID của đề thi.");
       setLoading(false);
       return;
    }
    setLoading(true);
    setSelectedQuestionIds(new Set()); // Reset selections

    const examApiUrl = currentPart.type === "MIDDLE_EXAM"
        ? `${API_URL}/middle-exams/${examId}`
        : `${API_URL}/final-exams/${examId}`;
    const allQuestionsUrl = `${API_URL}/questions`;

    try {
      const [examRes, allQuestionsRes] = await Promise.all([
        axios.get(examApiUrl, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(allQuestionsUrl, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const examData = examRes.data.result || examRes.data;
      const allQuestionsData = allQuestionsRes.data.result || allQuestionsRes.data || [];

      setCurrentExam(examData);
      setAllQuestions(allQuestionsData);

      // Initialize selected IDs based on current exam questions
      const initialSelectedIds = new Set(examData.questions?.map((q: ExamQuestion) => q.id) || []);
      setSelectedQuestionIds(initialSelectedIds);

    } catch (err) {
      console.error("❌ Lỗi tải dữ liệu câu hỏi:", err);
      setNotifMessage("Không thể tải dữ liệu câu hỏi cho đề thi này.");
    } finally {
      setLoading(false);
    }
  }, [examId, token, currentPart]); // Depend on currentPart to ensure type is known

   // Fetch data when currentPart is loaded or examId changes
   useEffect(() => {
     if(currentPart) { // Only fetch when part info (and thus type) is available
       fetchData();
     }
   }, [currentPart, examId, fetchData]);


  // --- Toggle Question Selection ---
  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestionIds((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // --- Handle Save ---
  const handleSave = async () => {
     if (!currentExam || !currentPart) return;
     setSaving(true);
     setNotifMessage(null); // Clear previous messages

     const updatedQuestionIds = Array.from(selectedQuestionIds);

     const payload = {
         overviewPartId: currentPart.id,
         examTitle: currentExam.examTitle,
         semester: currentExam.semester,
         type: currentExam.type,
         year: currentExam.year,
         questionIds: updatedQuestionIds, // The updated list of IDs
     };

     const url = currentPart.type === "MIDDLE_EXAM"
        ? `${API_URL}/middle-exams/${currentExam.id}`
        : `${API_URL}/final-exams/${currentExam.id}`;

     try {
         await axios.put(url, payload, { headers: { Authorization: `Bearer ${token}` } });
         setNotifMessage("Cập nhật danh sách câu hỏi thành công!");
         // Optionally refetch data to confirm, though not strictly necessary if PUT returns updated data
         // fetchData();
     } catch (err: any) {
         console.error("❌ Lỗi khi cập nhật đề thi:", err);
         setNotifMessage(`❌ Không thể cập nhật: ${err.response?.data?.message || err.message}`);
     } finally {
         setSaving(false);
     }
  };

   // --- Handle Edit Question Content (Placeholder/Link) ---
   const handleEditQuestionContent = (questionId: number) => {
       // alert(`(Dev) Chức năng sửa câu hỏi chung (ID: ${questionId}) cần được tạo ở trang riêng.\nViệc sửa câu hỏi này sẽ ảnh hưởng đến mọi nơi nó được sử dụng.`);
       // ✅ THAY THẾ ALERT BẰNG NAVIGATE:
       navigate(`/teacher/questions/${questionId}/edit`);
   };

  // --- Filtered Available Questions ---
  const availableQuestions = useMemo(() => {
    return allQuestions
      .filter(q => !selectedQuestionIds.has(q.id)) // Filter out already selected
      .filter(q => { // Filter by search term (content or ID)
          if (!searchTerm) return true;
          const lowerSearch = searchTerm.toLowerCase();
          return (
              q.id.toString().includes(lowerSearch) ||
              q.content.toLowerCase().includes(lowerSearch) ||
              q.category.toLowerCase().includes(lowerSearch) ||
              q.questionType.toLowerCase().includes(lowerSearch)
          );
      });
  }, [allQuestions, selectedQuestionIds, searchTerm]);

  // --- Selected Questions List ---
   const selectedQuestionsList = useMemo(() => {
     // Create a map for quick lookup
     const allQuestionsMap = new Map(allQuestions.map(q => [q.id, q]));
     // Filter based on selected IDs and map back to full question objects
     return Array.from(selectedQuestionIds)
            .map(id => allQuestionsMap.get(id))
            .filter((q): q is ExamQuestion => q !== undefined); // Type guard to filter out undefined
   }, [allQuestions, selectedQuestionIds]);


  // --- Render Question Row ---
  const renderQuestionRow = (q: ExamQuestion, isSelected: boolean) => (
    <motion.tr
        key={q.id}
        variants={fadeIn}
        className={`hover:bg-gray-50 ${isSelected ? 'bg-green-50' : ''}`}
    >
      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-500 w-16">{q.id}</td>
      <td className="px-4 py-3 text-sm text-gray-800 max-w-sm" title={q.content}>
        <div className="line-clamp-2">{q.content}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{q.questionType}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{q.category}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">
        {/* Checkbox for selection */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleQuestionSelection(q.id)}
          className="h-5 w-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
        />
      </td>
       {/* Edit Button */}
        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">
             <button
                onClick={() => handleEditQuestionContent(q.id)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Sửa nội dung câu hỏi gốc"
             >
                <AiOutlineEdit className="h-5 w-5 inline" />
             </button>
        </td>
    </motion.tr>
  );


  // --- Main Render ---
  if (loading) return (<div className="flex justify-center items-center h-screen"><CircularProgress /></div>);
  if (!currentExam || !currentPart) return (<div className="flex justify-center items-center h-screen text-red-600">Không thể tải thông tin đề thi hoặc loại đề thi.</div>);


  return (
    <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header & Back Button */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to={`/teacher/courses/${courseCode}/overviews/${overviewId}/parts/${partId}/manage-content`}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
          >
            <IoMdArrowBack className="h-6 w-6" />
            <span className="text-lg font-medium">Quản lý Nội dung ({currentPart.title})</span>
          </Link>
           {/* Save Button */}
           <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full shadow font-semibold transition-colors ${
                  saving
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
              }`}
           >
              {saving ? <CircularProgress size={20} color="inherit"/> : <AiOutlineCheckCircle/>}
              Lưu thay đổi ({selectedQuestionIds.size} câu)
           </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Câu hỏi cho Đề thi</h1>
        <p className="text-lg text-gray-600 mb-8">
            <span className="font-semibold text-cyan-700">{currentExam.examTitle}</span> ({currentExam.semester} - {currentExam.year})
        </p>

         {/* Layout with Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Column 1: Selected Questions */}
            <motion.div initial="hidden" animate="show" variants={fadeIn}>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Câu hỏi đã chọn ({selectedQuestionsList.length})</h2>
                 <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ boxShadow: neumorphicShadow }}>
                    {selectedQuestionsList.length === 0 ? (
                        <p className="p-6 text-center text-gray-500 italic">Chưa có câu hỏi nào được chọn. Chọn từ danh sách bên phải.</p>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="w-16 px-3 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nội dung</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Loại</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Bỏ chọn</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Sửa</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedQuestionsList.map(q => renderQuestionRow(q, true))}
                                </tbody>
                            </table>
                        </div>
                    )}
                 </div>
            </motion.div>

             {/* Column 2: Available Questions */}
             <motion.div initial="hidden" animate="show" variants={fadeIn} transition={{delay: 0.1}}>
                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Câu hỏi có sẵn ({availableQuestions.length} / {allQuestions.length})</h2>
                 {/* Search Input */}
                 <div className="mb-4 relative">
                    <input
                        type="text"
                        placeholder="Tìm theo ID, nội dung, loại, thể loại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border p-3 pl-10 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                        style={{ boxShadow: insetShadow }}
                    />
                    <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                 </div>

                  <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ boxShadow: neumorphicShadow }}>
                     {availableQuestions.length === 0 && searchTerm ? (
                         <p className="p-6 text-center text-gray-500 italic">Không tìm thấy câu hỏi phù hợp.</p>
                     ) : availableQuestions.length === 0 && !searchTerm ? (
                         <p className="p-6 text-center text-gray-500 italic">Tất cả câu hỏi đã được chọn hoặc không có câu hỏi nào.</p>
                     ) : (
                        <div className="max-h-[60vh] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="w-16 px-3 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nội dung</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Loại</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">TL</th> {/* Thể loại */}
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Chọn</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Sửa</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {availableQuestions.map(q => renderQuestionRow(q, false))}
                                </tbody>
                            </table>
                        </div>
                     )}
                 </div>
            </motion.div>

        </div>

      </div>

      {/* Notification */}
      {notifMessage && ( <NotificationModal message={notifMessage} onClose={() => setNotifMessage(null)} /> )}
    </div>
  );
};

export default TeacherManageExamQuestionsPage;