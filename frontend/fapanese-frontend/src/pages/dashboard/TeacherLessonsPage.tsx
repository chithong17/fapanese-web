import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import CourseBanner from "../../assets/jpd113-coursebanner.svg";
import NotificationModal from "../../components/NotificationModal";

const mainBg = "#e8ebf0";
const neumorphicShadow = "20px 20px 40px #c6c9cc, -10px -10px 40px #ffffff";
const buttonShadow =
  "4px 4px 10px rgba(33, 147, 176, 0.4), -4px -4px 10px rgba(109, 213, 237, 0.3)";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const TeacherLessonsPage: React.FC = () => {
  const { courseCode } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    lessonTitle: "",
    description: "",
    orderIndex: 1,
  });

  const token = localStorage.getItem("token") || "";

  // ✅ Lấy danh sách bài học theo courseCode
  const fetchLessons = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/fapanese/api/lessons/by-course/${courseCode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLessons(res.data.result || res.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải lessons:", err);
      setNotifMessage("Không thể tải danh sách bài học!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseCode]);

  const openModal = (lesson?: any) => {
    setEditingLesson(lesson || null);
    setFormData(
      lesson || {
        id: 0,
        lessonTitle: "",
        description: "",
        orderIndex: lessons.length + 1,
      }
    );
    setShowModal(true);
  };

  const getLessonParts = async (lessonId: number) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/fapanese/api/lesson-parts/by-lesson/${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.result || res.data || [];
    } catch (err) {
      console.error("❌ Không thể tải lesson parts:", err);
      return [];
    }
  };

  const handleChange = (key: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ Lưu (Thêm / Sửa)
  const handleSave = async () => {
    try {
      if (editingLesson) {
        await axios.put(
          `http://localhost:8080/fapanese/api/lessons/by-course/${courseCode}/${formData.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifMessage("Cập nhật bài học thành công!");
      } else {
        await axios.post(
          `http://localhost:8080/fapanese/api/lessons/by-course/${courseCode}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifMessage("Thêm bài học mới thành công!");
      }

      setShowModal(false);
      fetchLessons();
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err);
      setNotifMessage("❌ Không thể lưu bài học.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bài học này?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/fapanese/api/lessons/by-course/${courseCode}/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifMessage("Xóa bài học thành công!");
      fetchLessons();
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      setNotifMessage("❌ Không thể xóa bài học!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );

  return (
    <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
      {/* Banner */}
      <motion.div
        className="w-full flex justify-center items-center overflow-hidden shadow-2xl bg-white min-h-[300px] sm:min-h-[400px] mb-16"
        initial="hidden"
        animate="show"
        variants={fadeIn}
      >
        <img
          src={CourseBanner}
          alt="Course Banner"
          className="w-full object-contain transform hover:scale-[1.03] transition duration-700"
        />
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý bài học – {courseCode}
          </h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 shadow"
          >
            <AiOutlinePlus /> Thêm Lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <p className="text-center italic text-gray-500">
            Chưa có bài học nào.
          </p>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.15 } } }}
            className="space-y-6"
          >
            {lessons.map((lesson) => (
              <motion.div
                key={lesson.id}
                variants={fadeIn}
                className="group bg-white rounded-[30px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center 
                           transition-all duration-300 hover:shadow-2xl hover:bg-[#F0F8FF] relative"
                style={{ boxShadow: neumorphicShadow }}
              >
                {/* CRUD Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openModal(lesson)}
                    className="p-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500"
                  >
                    <AiOutlineEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <AiOutlineDelete />
                  </button>
                </div>

                <div className="flex flex-col mb-4 md:mb-0">
                  <p className="text-1xl font-semibold uppercase text-cyan-600 tracking-widest mb-1 opacity-75">
                    BÀI HỌC {lesson.orderIndex}:
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {lesson.lessonTitle || "Chưa đặt tiêu đề"}
                  </h3>
                  <p className="text-md text-gray-600 max-w-2xl font-light opacity-75">
                    {lesson.description || "Chưa có mô tả cho bài học này."}
                  </p>
                </div>

                <motion.button
                  onClick={async () => {
                    const parts = await getLessonParts(lesson.id);
                    if (!parts.length) {
                      alert("Bài học này chưa có phần nào (LessonPart).");
                      return;
                    }

                    // 🔍 Tìm part đầu tiên hoặc part loại VOCAB/GRAMMAR (tùy bạn muốn vào đâu)
                    const targetPart =
                      parts.find((p: any) => p.type === "VOCABULARY") ||
                      parts[0];

                    navigate(
                      `/teacher/courses/${courseCode}/lessons/${lesson.id}/parts/${targetPart.id}/manage`
                    );
                  }}
                  className="flex-shrink-0 px-10 py-3 bg-gradient-to-r from-[#B2EBF2] to-[#80DEEA] text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform text-lg tracking-wider w-full md:w-auto"
                  style={{ boxShadow: buttonShadow }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  Quản lý bài học
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal thêm/sửa lesson */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-[480px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {editingLesson ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
              </h3>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={formData.lessonTitle}
                  onChange={(e) => handleChange("lessonTitle", e.target.value)}
                  className="border p-2 rounded"
                />
                <textarea
                  placeholder="Mô tả"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="border p-2 rounded min-h-[100px]"
                />
                <input
                  type="number"
                  placeholder="Thứ tự"
                  value={formData.orderIndex}
                  onChange={(e) =>
                    handleChange("orderIndex", Number(e.target.value))
                  }
                  className="border p-2 rounded"
                />
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

      {notifMessage && (
        <NotificationModal
          message={notifMessage}
          onClose={() => setNotifMessage(null)}
        />
      )}
    </div>
  );
};

export default TeacherLessonsPage;
