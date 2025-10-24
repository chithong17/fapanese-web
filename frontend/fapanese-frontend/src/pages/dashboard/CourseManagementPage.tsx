import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineEdit, AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api/course"; // Đường dẫn tùy theo cấu trúc thư mục của bạn

interface CourseResponse {
  id: number;
  courseName: string;
  description: string;
  imgUrl: string;
  price: string;
  level: string;
  title: string;
  duration: string;
}

const CourseManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [formData, setFormData] = useState<CourseResponse>({
    id: 0,
    courseName: "",
    description: "",
    imgUrl: "",
    price: "",
    level: "",
    title: "",
    duration: "",
  });

  // Lấy token từ localStorage
  const token = localStorage.getItem("token") || "";

  // Animation
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const result = await getAllCourses(token);
      setCourses(result || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách khóa học:", err);
      setError("Không thể tải danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Mở modal (thêm hoặc sửa)
  const openModal = (course?: CourseResponse) => {
    if (course) {
      setEditingCourse(course);
      setFormData(course);
    } else {
      setEditingCourse(null);
      setFormData({
        id: 0,
        courseName: "",
        description: "",
        imgUrl: "",
        price: "",
        level: "",
        title: "",
        duration: "",
      });
    }
    setShowModal(true);
  };

  // Lưu khóa học
  const handleSave = async () => {
    try {
      if (editingCourse) {
        await updateCourse(formData.id, formData, token);
        alert("✅ Cập nhật khóa học thành công!");
      } else {
        await createCourse(formData, token);
        alert("✅ Thêm khóa học mới thành công!");
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      console.error("❌ Không thể lưu khóa học:", err);
      alert("Không thể lưu khóa học.");
    }
  };

  // Xóa khóa học
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này không?")) return;
    try {
      await deleteCourse(id, token);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      alert("🗑️ Xóa khóa học thành công!");
    } catch (err) {
      console.error("❌ Không thể xóa khóa học:", err);
      alert("Không thể xóa khóa học.");
    }
  };

  const handleChange = (field: keyof CourseResponse, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // UI Loading/Error
  if (loading)
    return <p className="text-gray-500 text-center mt-8">Đang tải...</p>;
  if (error)
    return <p className="text-red-500 text-center mt-8">{error}</p>;

  return (
    <div className="p-6 bg-gray-50 rounded-2xl shadow-inner min-h-[85vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Quản lý khóa học
        </h2>
        <motion.button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AiOutlinePlus /> Thêm khóa học
        </motion.button>
      </div>

      {/* Bảng danh sách */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold">Tên khóa học</th>
              <th className="p-3 text-left font-semibold">Mức độ</th>
              <th className="p-3 text-left font-semibold">Giá</th>
              <th className="p-3 text-left font-semibold">Thời lượng</th>
              <th className="p-3 text-center font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <motion.tr
                key={c.id}
                className="border-b hover:bg-gray-50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <td className="p-3">{c.courseName}</td>
                <td className="p-3">{c.level}</td>
                <td className="p-3">{c.price}</td>
                <td className="p-3">{c.duration}</td>
                <td className="p-3 flex justify-center gap-3">
                  <motion.button
                    onClick={() => openModal(c)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AiOutlineEdit />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(c.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AiOutlineDelete />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-[500px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
              </h3>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Tên khóa học"
                  value={formData.courseName}
                  onChange={(e) => handleChange("courseName", e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Mức độ"
                  value={formData.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Thời lượng"
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Giá"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Ảnh URL"
                  value={formData.imgUrl}
                  onChange={(e) => handleChange("imgUrl", e.target.value)}
                  className="border p-2 rounded"
                />
                <textarea
                  placeholder="Mô tả khóa học"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="border p-2 rounded min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Hủy
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Lưu
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseManagementPage;
