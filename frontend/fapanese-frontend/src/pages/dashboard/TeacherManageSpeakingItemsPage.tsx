import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import { IoMdArrowBack } from "react-icons/io";
import axios from "axios";
import NotificationModal from "../../components/NotificationModal";

// --- Interfaces ---
// (Copy interfaces SpeakingQuestion, SpeakingItem, SpeakingExam from previous code)
interface SpeakingQuestion { id: number; speakingId?: number; question: string; questionRomaji?: string; questionMeaning?: string; answer?: string; answerRomaji?: string; answerMeaning?: string; }
interface SpeakingItem { id: number; speakingExamId?: number; topic: string; speakingType: "PASSAGE" | "PICTURE" | "QUESTION" | string; passage?: string; passageRomaji?: string; passageMeaning?: string; description?: string; imgUrl?: string; speakingQuestions?: SpeakingQuestion[]; }
interface SpeakingExam { id: number; overviewPartId: number; title: string; type: string; speakings: SpeakingItem[]; }


// --- Styles ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "10px 10px 20px #c6c9cc, -5px -5px 20px #ffffff";
const fadeIn = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// --- Component ---
const TeacherManageSpeakingItemsPage: React.FC = () => {
  // speakingExamId is the ID of the parent SpeakingExam container
  const { courseCode, overviewId, partId, speakingExamId } = useParams();
  const navigate = useNavigate();

  const [speakingExam, setSpeakingExam] = useState<SpeakingExam | null>(null); // Info of parent Exam
  const [speakingItems, setSpeakingItems] = useState<SpeakingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  // Modal State for SpeakingItem CRUD
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SpeakingItem | null>(null);
  const [itemFormData, setItemFormData] = useState<Partial<SpeakingItem>>({});

  const token = localStorage.getItem("token") || "";
  const API_URL = "https://fapanese-backend-production.up.railway.app/fapanese/api";

  // --- Fetch Speaking Exam and its Speaking Items ---
  const fetchSpeakingExamDetails = async () => {
    if (!speakingExamId) {
      setLoading(false);
      setNotifMessage("Lỗi: Không tìm thấy ID của Speaking Exam.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/speaking-exams/${speakingExamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const examData = res.data.result || res.data;
      setSpeakingExam(examData);
      setSpeakingItems(examData.speakings || []);
    } catch (err) {
      console.error("❌ Lỗi tải chi tiết Speaking Exam:", err);
      setNotifMessage("Không thể tải dữ liệu bài tập Speaking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakingExamDetails();
  }, [speakingExamId]);

  // --- Modal Handlers for SpeakingItem ---
  const openItemModal = (item?: SpeakingItem) => {
    setEditingItem(item || null);
    setItemFormData(
      item
        ? { id: item.id, topic: item.topic, speakingType: item.speakingType, passage: item.passage, passageRomaji: item.passageRomaji, passageMeaning: item.passageMeaning, description: item.description, imgUrl: item.imgUrl }
        : { topic: "", speakingType: speakingExam?.type || "PASSAGE", passage: "", passageRomaji: "", passageMeaning: "", description: "", imgUrl: "" } // Default type from parent?
    );
    setShowItemModal(true);
  };

  const handleItemChange = (key: keyof SpeakingItem, value: string) => {
    setItemFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --- Save SpeakingItem (Add/Edit) ---
  const handleSaveItem = async () => {
    if (!speakingExamId) return;

    let payload: any = { ...itemFormData };
    let url = "";
    let method: "post" | "put" = "post";

     // Clean up empty optional fields
    Object.keys(payload).forEach(key => {
        // Keep 'topic' and 'speakingType' even if empty initially? Depends on backend validation
        if (payload[key] === '' && !['topic', 'speakingType'].includes(key)) {
             payload[key] = null; // Send null for empty optional fields
        }
    });


    if (editingItem) {
      url = `${API_URL}/speakings/${editingItem.id}`;
      method = "put";
      payload.id = editingItem.id; // PUT requires ID in payload
      // No need to send speakingExamId for PUT
    } else {
      delete payload.id;
      payload.speakingExamId = Number(speakingExamId); // Link to parent Exam for POST
      url = `${API_URL}/speakings`;
      method = "post";
    }


    try {
      await axios[method](url, payload, { headers: { Authorization: `Bearer ${token}` } });
      setNotifMessage("Lưu bài tập Speaking thành công!");
      setShowItemModal(false);
      fetchSpeakingExamDetails(); // Refresh list
    } catch (err) {
      console.error("❌ Lỗi khi lưu speaking item:", err);
      setNotifMessage(`❌ Không thể lưu bài tập Speaking: ${err.response?.data?.message || err.message}`);
    }
  };

  // --- Delete SpeakingItem ---
   const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bài tập Speaking này (bao gồm cả câu hỏi con)?")) return;
    try {
      await axios.delete(`${API_URL}/speakings/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
      setNotifMessage("Xóa bài tập Speaking thành công!");
      fetchSpeakingExamDetails(); // Refresh list
    } catch (err) {
      console.error("❌ Lỗi khi xóa speaking item:", err);
      setNotifMessage("❌ Không thể xóa bài tập Speaking!");
    }
  };

  // --- Navigate to Manage Speaking Questions ---
  const handleManageQuestions = (speakingItem: SpeakingItem) => {
     navigate(`/teacher/courses/${courseCode}/overviews/${overviewId}/parts/${partId}/manage-content/speaking/${speakingExamId}/item/${speakingItem.id}/questions`);
  };


  // --- Render SpeakingItem Form ---
  const renderSpeakingItemModalForm = () => (
     <div className="flex flex-col gap-4">
        <input type="text" placeholder="Chủ đề (Topic) (*)" value={itemFormData.topic || ""} onChange={(e) => handleItemChange("topic", e.target.value)} className="border p-3 rounded-lg" required/>
        <select value={itemFormData.speakingType || "PASSAGE"} onChange={(e) => handleItemChange("speakingType", e.target.value)} className="border p-3 rounded-lg bg-white">
            <option value="PASSAGE">Dạng Văn bản (Passage)</option>
            <option value="PICTURE">Dạng Hình ảnh (Picture)</option>
            <option value="QUESTION">Dạng Câu hỏi (Question)</option>
        </select>
        {itemFormData.speakingType === 'PASSAGE' && (<>
            <textarea placeholder="Nội dung Passage" value={itemFormData.passage || ""} onChange={(e) => handleItemChange("passage", e.target.value)} className="border p-3 rounded-lg min-h-[100px]"/>
            <input type="text" placeholder="Passage Romaji" value={itemFormData.passageRomaji || ""} onChange={(e) => handleItemChange("passageRomaji", e.target.value)} className="border p-3 rounded-lg"/>
            <input type="text" placeholder="Passage Meaning" value={itemFormData.passageMeaning || ""} onChange={(e) => handleItemChange("passageMeaning", e.target.value)} className="border p-3 rounded-lg"/>
        </>)}
        {itemFormData.speakingType === 'PICTURE' && ( <input type="text" placeholder="URL Hình ảnh" value={itemFormData.imgUrl || ""} onChange={(e) => handleItemChange("imgUrl", e.target.value)} className="border p-3 rounded-lg"/> )}
        <textarea placeholder="Mô tả / Gợi ý" value={itemFormData.description || ""} onChange={(e) => handleItemChange("description", e.target.value)} className="border p-3 rounded-lg min-h-[60px]"/>
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
            to={`/teacher/courses/${courseCode}/overviews/${overviewId}/parts/${partId}/manage-content`}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
          >
            <IoMdArrowBack className="h-6 w-6" />
            <span className="text-lg font-medium">Quay lại Quản lý Nội dung</span>
          </Link>
          <button
            onClick={() => openItemModal()}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full hover:bg-green-700 shadow font-semibold"
          >
            <AiOutlinePlus /> Thêm Bài tập
          </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Bài tập con</h1>
        {speakingExam && (
            <p className="text-lg text-gray-600 mb-8">
                Cho: <span className="font-semibold text-cyan-700">{speakingExam.title}</span>
            </p>
        )}

        {/* Speaking Items Table */}
         {speakingItems.length === 0 ? (
          <p className="text-center italic text-gray-500 mt-10">
            Chưa có bài tập nào. Bấm "Thêm Bài tập" để bắt đầu.
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ đề</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung chính</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số câu hỏi</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {speakingItems.map((item) => (
                  <motion.tr key={item.id} variants={fadeIn} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.topic}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.speakingType}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs align-top">
                      {item.speakingType === 'PICTURE' && item.imgUrl ? (
                        // Nếu là PICTURE và có imgUrl, hiển thị ảnh thumbnail
                        <img
                          src={item.imgUrl}
                          alt={`Hình ảnh cho ${item.topic}`}
                          className="h-16 w-auto object-contain rounded border border-gray-200 shadow-sm" // Style cho ảnh
                          loading="lazy" // Lazy load ảnh
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x64/eee/ccc?text=Error')} // Ảnh lỗi
                        />
                      ) : (
                        // Nếu không phải ảnh, hiển thị text (passage/description)
                        <div className="line-clamp-3" title={item.passage || item.description}> {/* Line clamp + tooltip */}
                          {item.passage || item.description || '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.speakingQuestions?.length || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                       <button onClick={() => handleManageQuestions(item)} className="text-purple-600 hover:text-purple-900" title={`Quản lý ${item.speakingQuestions?.length || 0} câu hỏi`}> <AiOutlineQuestionCircle className="h-5 w-5 inline" /> </button>
                       <button onClick={() => openItemModal(item)} className="text-indigo-600 hover:text-indigo-900" title="Chỉnh sửa"> <AiOutlineEdit className="h-5 w-5 inline" /> </button>
                       <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-900" title="Xóa"> <AiOutlineDelete className="h-5 w-5 inline"/> </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

       {/* --- Modal Thêm/Sửa Speaking Item --- */}
      <AnimatePresence>
        {showItemModal && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[51] p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowItemModal(false)}>
            <motion.div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>
              <h3 className="text-xl font-semibold text-gray-800 mb-5">{editingItem ? "Chỉnh sửa Bài tập Speaking" : "Thêm Bài tập Speaking mới"}</h3>
              {renderSpeakingItemModalForm()}
              <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button onClick={() => setShowItemModal(false)} className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Hủy</button>
                <button onClick={handleSaveItem} className="px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700">Lưu Bài tập</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

       {/* Notification */}
      {notifMessage && ( <NotificationModal message={notifMessage} onClose={() => setNotifMessage(null)} /> )}
    </div>
  );
};

export default TeacherManageSpeakingItemsPage;