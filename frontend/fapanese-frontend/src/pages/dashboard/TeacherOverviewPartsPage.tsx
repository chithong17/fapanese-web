import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import { IoMdArrowBack, IoIosApps } from "react-icons/io";
import axios from "axios";
import NotificationModal from "../../components/NotificationModal";

// Import các icon/assets của bạn
import spk from "../../assets/spk.svg";
import mid from "../../assets/mid.svg";
import final from "../../assets/final.svg";

// Map để liên kết Part Type với Icon
const PART_ICONS: Record<string, string> = {
  SPEAKING: spk,
  MIDDLE_EXAM: mid,
  FINAL_EXAM: final,
};

// Định nghĩa kiểu dữ liệu cho OverviewPart
interface OverviewPart {
  id: number;
  title: string;
  type: "SPEAKING" | "MIDDLE_EXAM" | "FINAL_EXAM" | string;
  overviewId: number; // Đổi tên từ overview_id để khớp với response API (nếu cần)
}

// --- Cấu hình style ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "20px 20px 40px #c6c9cc, -10px -10px 40px #ffffff";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const TeacherOverviewPartsPage: React.FC = () => {
  // Lấy courseCode và overviewId từ URL
  const { courseCode, overviewId } = useParams();
  const navigate = useNavigate();

  const [parts, setParts] = useState<OverviewPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  // State cho Modal
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<OverviewPart | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    type: "SPEAKING", // Giá trị mặc định
  });

  const token = localStorage.getItem("token") || "";
  const API_URL = "https://fapanese-backend-production.up.railway.app/fapanese/api";

  // --- Lấy danh sách các Part (Hàm này đã đúng) ---
  const fetchParts = async () => {
    if (!overviewId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/overview-parts/by-overview/${overviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParts(res.data.result || res.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải overview parts:", err);
      setNotifMessage("Không thể tải danh sách mục ôn tập!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [overviewId]);

  // --- Mở Modal (Thêm mới hoặc Chỉnh sửa) ---
  const openModal = (part?: OverviewPart) => {
    setEditingPart(part || null);
    setFormData(
      part
        ? { id: part.id, title: part.title, type: part.type }
        : { id: 0, title: "", type: "SPEAKING" }
    );
    setShowModal(true);
  };

  // --- Xử lý thay đổi Form ---
  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --- ✅ HÀM ĐÃ ĐƯỢC SỬA ---
  // --- Xử lý Lưu (Thêm/Sửa) ---
  const handleSave = async () => {
    try {
      // 1. Tạo payload đúng theo yêu cầu API
      const payload = {
        overviewId: Number(overviewId), // Thêm overviewId vào payload
        title: formData.title,
        type: formData.type,
      };

      // 2. Kiểm tra overviewId
      if (!payload.overviewId) {
        setNotifMessage("❌ Lỗi: Không tìm thấy Overview ID.");
        return;
      }

      if (editingPart) {
        // --- Chế độ Sửa (PUT) ---
        // Gửi payload (đã bao gồm overviewId)
        await axios.put(`${API_URL}/overview-parts/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifMessage("Cập nhật mục thành công!");
      } else {
        // --- Chế độ Thêm mới (POST) ---
        // Sửa lại URL thành /api/overview-parts
        await axios.post(
          `${API_URL}/overview-parts`, // URL đã sửa
          payload, // Gửi payload (đã bao gồm overviewId)
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifMessage("Thêm mục mới thành công!");
      }

      setShowModal(false);
      fetchParts(); // Tải lại danh sách
    } catch (err) {
      console.error("❌ Lỗi khi lưu overview part:", err);
      setNotifMessage("❌ Không thể lưu mục ôn tập.");
    }
  };

  // --- Xử lý Xóa (Hàm này đã đúng) ---
  const handleDelete = async (partId: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa mục này?")) return;
    try {
      await axios.delete(`${API_URL}/overview-parts/${partId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifMessage("Xóa mục thành công!");
      fetchParts(); // Tải lại danh sách
    } catch (err) {
      console.error("❌ Lỗi khi xóa overview part:", err);
      setNotifMessage("❌ Không thể xóa mục ôn tập!");
    }
  };

  // --- Xử lý Điều hướng sang trang Quản lý Nội dung ---
  const handleManageContent = (part: OverviewPart) => {
    // Điều hướng đến trang chi tiết để quản lý (speaking_exam, final_exam, ...)
    // Đây sẽ là trang tiếp theo bạn cần tạo
    navigate(
      `/teacher/courses/${courseCode}/overviews/${overviewId}/parts/${part.id}/manage-content`
    );
  };

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
            to={`/teacher/courses/${courseCode}`}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
          >
            <IoMdArrowBack className="h-6 w-6" />
            <span className="text-lg font-medium">Quay lại Khóa học</span>
          </Link>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-full hover:bg-cyan-700 shadow font-semibold"
          >
            <AiOutlinePlus /> Thêm Mục
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Quản lý Mục Tổng ôn (Overview ID: {overviewId})
        </h1>

        {/* --- Danh sách các Part --- */}
        {parts.length === 0 ? (
          <p className="text-center italic text-gray-500">
            Chưa có mục ôn tập nào. Bấm "Thêm Mục" để bắt đầu.
          </p>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {parts.map((part) => (
              <motion.div
                key={part.id}
                variants={fadeIn}
                className="group bg-white rounded-[30px] p-6 flex flex-col justify-between 
                                transition-all duration-300 hover:shadow-2xl hover:bg-[#FFFBEF] relative"
                style={{ boxShadow: neumorphicShadow, minHeight: "200px" }}
              >
                {/* CRUD Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openModal(part)}
                    className="p-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500"
                  >
                    <AiOutlineEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(part.id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <AiOutlineDelete />
                  </button>
                </div>

                {/* Content */}
                <div>
                  <img
                    src={PART_ICONS[part.type]}
                    alt={part.type}
                    className="h-16 w-16 mb-3 opacity-80"
                  />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {part.title || "Chưa đặt tiêu đề"}
                  </h3>
                  <p className="text-sm font-semibold uppercase text-orange-600 tracking-wider opacity-75">
                    {part.type.replace("_", " ")}
                  </p>
                </div>

                {/* Manage Button */}
                <motion.button
                  onClick={() => handleManageContent(part)}
                  className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-[#FDEB71] to-[#F8D800] text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 transform text-lg tracking-wider"
                  style={{
                    boxShadow:
                      "4px 4px 10px rgba(248, 216, 0, 0.4), -4px -4px 10px rgba(253, 235, 113, 0.3)",
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  Quản lý Nội dung
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* --- Modal Thêm/Sửa Part --- */}
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
              className="bg-white rounded-2xl p-6 w-[480px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {editingPart ? "Chỉnh sửa mục" : "Thêm mục mới"}
              </h3>

              <div className="flex flex-col gap-4">
                {/* Trường Tiêu đề */}
                <input
                  type="text"
                  placeholder="Tiêu đề mục (VD: Luyện nói chủ đề 1)"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="border p-3 rounded-lg"
                />

                {/* Trường Loại (Type) */}
                <select
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="border p-3 rounded-lg bg-white"
                >
                  <option value="SPEAKING">Luyện Nói (Speaking)</option>
                  <option value="MIDDLE_EXAM">Thi Giữa Kỳ (Middle Exam)</option>
                  <option value="FINAL_EXAM">Thi Cuối Kỳ (Final Exam)</option>
                </select>
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

export default TeacherOverviewPartsPage;