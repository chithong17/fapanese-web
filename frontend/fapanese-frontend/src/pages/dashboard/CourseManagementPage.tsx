import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosAddCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { getAllCourses, createCourse, updateCourse, deleteCourse } from "../../api/course";

// --- CẤU HÌNH MÀU & ANIMATION (đồng bộ với StudentManagementPage) ---
const PRIMARY_CYAN = "bg-cyan-600";
const HOVER_CYAN = "hover:bg-cyan-700";
const TABLE_HEADER_BG = "bg-gray-100";
const BORDER_COLOR = "border-gray-200";

// Biến thể cho form (unused but kept for reference)
// const formVariants = {
//   hidden: { opacity: 0, height: 0, y: -20 },
//   visible: {
//     opacity: 1,
//     height: "auto",
//     y: 0,
//     transition: { duration: 0.3, ease: "easeInOut" },
//   },
//   exit: {
//     opacity: 0,
//     height: 0,
//     y: -20,
//     transition: { duration: 0.2, ease: "easeOut" },
//   },
// };

// Biến thể cho từng dòng bảng
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

// Interface
interface CourseForm {
  id: number;
  courseName: string;
  description: string;
  imgUrl: string;
  price: string;
  level: string;
  title: string;
  duration: string;
}

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<CourseForm[]>([]);
  const [form, setForm] = useState<CourseForm | null>(null);
  const token = localStorage.getItem("token") ?? "";

  // Fetch dữ liệu
  const fetchCourses = async () => {
    try {
      const data = await getAllCourses(token);
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách khóa học:", err);
      alert("Không thể tải danh sách khóa học. Kiểm tra quyền truy cập.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Thêm / sửa khóa học
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.courseName || !form.level || !form.price) {
      alert("Vui lòng nhập đầy đủ thông tin khóa học!");
      return;
    }

    try {
      if (form.id) {
        await updateCourse(form.id, form, token);
        alert("✅ Cập nhật khóa học thành công!");
      } else {
        await createCourse(form, token);
        alert("✅ Thêm khóa học mới thành công!");
      }
      setForm(null);
      fetchCourses();
    } catch (err) {
      console.error("❌ Lỗi khi lưu khóa học:", err);
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

  const handleAdd = () => {
    setForm({
      id: 0,
      courseName: "",
      description: "",
      imgUrl: "",
      price: "",
      level: "",
      title: "",
      duration: "",
    });
  };

  return (
    <div className="p-0 bg-white min-h-full">
      {/* Nút thêm khóa học */}
      <motion.button
        onClick={handleAdd}
        className={`flex items-center gap-2 ${PRIMARY_CYAN} text-white px-4 py-2 rounded-lg mb-6 shadow-md ${HOVER_CYAN} transition duration-200 font-semibold`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <IoIosAddCircleOutline className="text-xl" />
        Thêm khóa học mới
      </motion.button>

      {/* Form thêm/sửa khóa học */}
      <AnimatePresence>
        {form && (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-gray-50 p-6 mb-8 shadow-inner rounded-xl border border-gray-100 overflow-hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              {form.id ? "Chỉnh sửa khóa học" : "Thêm khóa học"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Tên khóa học*"
                className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                value={form.courseName}
                onChange={(e) => setForm({ ...form, courseName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Mức độ (N5, N4, ...)*"
                className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              />
              <input
                type="text"
                placeholder="Thời lượng"
                className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
              <input
                type="text"
                placeholder="Giá (VNĐ)*"
                className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <input
              type="text"
              placeholder="Ảnh URL"
              className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none mb-3"
              value={form.imgUrl}
              onChange={(e) => setForm({ ...form, imgUrl: e.target.value })}
            />

            <textarea
              placeholder="Mô tả khóa học"
              className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none min-h-[100px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="mt-4 flex justify-end gap-3">
              <motion.button
                type="button"
                onClick={() => setForm(null)}
                className="flex items-center gap-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <IoIosCloseCircleOutline className="text-lg" />
                Hủy
              </motion.button>
              <motion.button
                type="submit"
                className={`flex items-center gap-1 ${PRIMARY_CYAN} text-white px-4 py-2 rounded-lg shadow-md ${HOVER_CYAN} transition duration-200 font-medium`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSave className="text-sm" />
                {form.id ? "Cập nhật" : "Lưu"}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Bảng danh sách khóa học */}
      <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-100">
        <table className="min-w-full bg-white text-sm">
          <thead className={`${TABLE_HEADER_BG} text-left`}>
            <tr>
              <th className={`p-3 border-b ${BORDER_COLOR} font-bold text-gray-700`}>
                Tên khóa học
              </th>
              <th className={`p-3 border-b ${BORDER_COLOR} font-bold text-gray-700`}>
                Mức độ
              </th>
              <th className={`p-3 border-b ${BORDER_COLOR} font-bold text-gray-700`}>
                Giá
              </th>
              <th className={`p-3 border-b ${BORDER_COLOR} font-bold text-gray-700`}>
                Thời lượng
              </th>
              <th className={`p-3 border-b ${BORDER_COLOR} text-center font-bold text-gray-700`}>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((c, index) => (
                <motion.tr
                  key={c.id}
                  className={`border-b ${BORDER_COLOR} hover:bg-gray-50 transition duration-150`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <td className="p-3 text-gray-700 font-medium">{c.courseName}</td>
                  <td className="p-3 text-gray-700">{c.level}</td>
                  <td className="p-3 text-gray-700">{c.price}</td>
                  <td className="p-3 text-gray-700">{c.duration}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <motion.button
                        onClick={() => setForm(c)}
                        className="text-cyan-500 p-2 rounded-full hover:bg-cyan-100 transition duration-150"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaEdit className="text-lg" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-500 p-2 rounded-full hover:bg-red-100 transition duration-150"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTrashAlt className="text-base" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  Không có khóa học nào trong hệ thống.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
