import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ScrollReveal from "../../components/ScrollReveal";
import LogoJPD113 from "../../assets/jpd113.svg";
import LogoJPD123 from "../../assets/jpd123.svg";
import LogoJPD133 from "../../assets/jpd133.svg";

// Map ảnh khóa học
const logoMap: { [key: string]: string } = {
  LogoJPD113: LogoJPD113,
  LogoJPD123: LogoJPD123,
  LogoJPD133: LogoJPD133,
};

// Interface cho dữ liệu
interface ApiCourse {
  id: number;
  courseName: string;
  description: string;
  imgUrl: string;
  price: string;
  level: string;
  code: string;
  title: string;
  duration: string;
}

const TeacherCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ApiCourse | null>(null);

  const [formData, setFormData] = useState<ApiCourse>({
    id: 0,
    courseName: "",
    description: "",
    imgUrl: "",
    price: "",
    level: "",
    code: "",
    title: "",
    duration: "",
  });

  const token = localStorage.getItem("token") || "";

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:8080/fapanese/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data.result || []);
    } catch (err) {
      console.error("❌ Lỗi tải khóa học:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openModal = (course?: ApiCourse) => {
    setEditingCourse(course || null);
    setFormData(
      course || {
        id: 0,
        courseName: "",
        description: "",
        imgUrl: "",
        price: "",
        level: "",
        code: "",
        title: "",
        duration: "",
      }
    );
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingCourse) {
        await axios.put(
          `http://localhost:8080/fapanese/api/courses/${formData.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:8080/fapanese/api/courses",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      console.error("❌ Lỗi lưu:", err);
      alert("Không thể lưu khóa học.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này không?")) return;
    try {
      await axios.delete(`http://localhost:8080/fapanese/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
    } catch (err) {
      console.error("❌ Lỗi xóa:", err);
      alert("Không thể xóa khóa học.");
    }
  };

  const handleChange = (key: keyof ApiCourse, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );

  return (
    <ScrollReveal>
      <section className="w-full py-5 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý khóa học
          </h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 shadow"
          >
            <AiOutlinePlus /> Thêm khóa học
          </button>
        </div>

        <div className="max-w-7xl mx-auto grid gap-10">
          {courses.map((course, idx) => (
            <div
              key={idx}
              className="relative group bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2"
            >
              {/* Thanh công cụ CRUD */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => openModal(course)}
                  className="p-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500"
                >
                  <AiOutlineEdit />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <AiOutlineDelete />
                </button>
              </div>

              <div className="grid grid-cols-10 items-center p-6 sm:p-3 gap-6">
                {/* Bên phải: hình ảnh */}
                <div className="col-span-10 sm:col-span-6 flex flex-col items-center justify-center">
                  <img
                    src={logoMap[course.imgUrl] || ""}
                    alt={course.title}
                    className="h-[75%] object-cover rounded-2xl shadow-md transition duration-500"
                  />
                </div>

                {/* Bên trái: thông tin */}
                <div className="col-span-10 sm:col-span-4 text-right space-y-3 px-5 py-5 tracking-wider">
                  <div>
                    <span className="bg-red-700 rounded-2xl px-3 py-1 font-bold text-white">
                      {course.price}
                    </span>
                    <span className="text-green-950 font-semibold text-3xl">
                      {" "}
                      {course.courseName}
                    </span>
                  </div>

                  <h2 className="text-6xl font-bold text-[#023333]">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {course.description}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    ⏱ {course.duration}
                  </p>

                  <Link
                    to={`/teacher/courses/${course.code}`}
                    className="py-2 bg-gradient-to-r from-[#9bced5] to-[#9cdfe8] text-white rounded-3xl font-bold px-10 shadow-md hover:shadow-xl transition"
                  >
                    QUẢN LÝ LESSON
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Thêm/Sửa */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                  onChange={(e) =>
                    handleChange("courseName", e.target.value)
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Ảnh URL"
                  value={formData.imgUrl}
                  onChange={(e) => handleChange("imgUrl", e.target.value)}
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
                  placeholder="Cấp độ"
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
                <textarea
                  placeholder="Mô tả"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="border p-2 rounded min-h-[100px]"
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
    </ScrollReveal>
  );
};

export default TeacherCoursesPage;
