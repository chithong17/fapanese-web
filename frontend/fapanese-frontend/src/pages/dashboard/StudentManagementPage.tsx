import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- Import Framer Motion
import { IoIosAddCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";

// Giả định API của bạn
import {
    getAllStudents,
    registerStudent,
    updateStudent,
    deleteStudent,
} from "../../api/student";

// --- CẤU HÌNH MÀU SẮC & ANIMATION ---
const PRIMARY_CYAN = "bg-cyan-600";
const HOVER_CYAN = "hover:bg-cyan-700";
const TABLE_HEADER_BG = "bg-gray-100";
const TEXT_CYAN = "text-cyan-600";
const BORDER_COLOR = "border-gray-200";

// Biến thể Form (Slide down)
const formVariants = {
    hidden: { opacity: 0, height: 0, y: -20 },
    visible: { 
        opacity: 1, 
        height: "auto", 
        y: 0, 
        transition: { duration: 0.3, ease: "easeInOut" } 
    },
    exit: { 
        opacity: 0, 
        height: 0, 
        y: -20, 
        transition: { duration: 0.2, ease: "easeOut" } 
    }
};

// Biến thể cho từng dòng trong bảng (Staggered list)
const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.4,
        },
    }),
};

// --- Kiểu dữ liệu Form (Giữ nguyên logic) ---
interface StudentForm {
    firstName: string;
    lastName: string;
    email: string;
    campus: string;
    dateOfBirth: string;
}


export default function StudentManagementPage() {
    const [students, setStudents] = useState<StudentForm[]>([]);
    const [form, setForm] = useState<StudentForm | null>(null);
    const token = localStorage.getItem("token") ?? ""; 

    // 🧩 Fetch danh sách sinh viên (Logic giữ nguyên)
    const fetchStudents = async () => {
        try {
            const data = await getAllStudents(token);
            setStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("❌ Lỗi khi tải danh sách sinh viên:", err);
            alert("Không thể tải danh sách sinh viên. Kiểm tra token hoặc quyền truy cập.");
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // 🗑 Xóa sinh viên (Logic giữ nguyên)
    const handleDelete = async (email: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh có Email: ${email}?`)) {
            try {
                await deleteStudent(email, token);
                setStudents(prev => prev.filter(s => s.email !== email));
            } catch (err) {
                console.error("❌ Lỗi khi xóa sinh viên:", err);
                alert("Không thể xóa. Có thể bạn không có quyền ADMIN.");
            }
        }
    };

    // 💾 Lưu sinh viên (Logic giữ nguyên)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form?.email || !form.firstName || !form.lastName) {
             alert("Vui lòng nhập đầy đủ Họ, Tên và Email.");
             return;
        }

        try {
            const isEditing = students.some((s) => s.email === form.email);
            
            if (isEditing) {
                await updateStudent(form.email, form, token);
            } else {
                await registerStudent(form, token);
            }
            
            setForm(null);
            fetchStudents(); 
        } catch (err) {
            console.error("❌ Lỗi khi lưu sinh viên:", err);
            alert("Không thể lưu sinh viên. Kiểm tra dữ liệu nhập hoặc quyền truy cập.");
        }
    };

    const handleAddStudent = () => {
        setForm({
            firstName: "",
            lastName: "",
            email: "",
            campus: "",
            dateOfBirth: "",
        });
    };
    
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "-";
        return dateString.split('-').reverse().join('/');
    };

    return (
        <div className="p-0 bg-white min-h-full">

            {/* Nút thêm học sinh */}
            <motion.button
                onClick={handleAddStudent}
                className={`flex items-center gap-2 ${PRIMARY_CYAN} text-white px-4 py-2 rounded-lg mb-6 shadow-md ${HOVER_CYAN} transition duration-200 font-semibold`}
                whileHover={{ scale: 1.02 }} // Hiệu ứng hover
                whileTap={{ scale: 0.98 }} // Hiệu ứng click
            >
                <IoIosAddCircleOutline className="text-xl" />
                Thêm học sinh mới
            </motion.button>

            {/* Form thêm / sửa (Thêm AnimatePresence để tạo hiệu ứng đóng/mở) */}
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
                            {students.some((s) => s.email === form.email) ? "Chỉnh sửa thông tin" : "Thêm học sinh"}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Input Fields */}
                            <input
                                type="text"
                                placeholder="Họ (First Name)*"
                                className={`border ${BORDER_COLOR} p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition`}
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Tên (Last Name)*"
                                className={`border ${BORDER_COLOR} p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition`}
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                required
                            />

                            <input
                                type="email"
                                placeholder="Email*"
                                className={`border ${BORDER_COLOR} p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition ${
                                    students.some((s) => s.email === form.email) ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                disabled={!!students.some((s) => s.email === form.email)} 
                            />
                            <input
                                type="text"
                                placeholder="Campus"
                                className={`border ${BORDER_COLOR} p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition`}
                                value={form.campus}
                                onChange={(e) => setForm({ ...form, campus: e.target.value })}
                            />
                        </div>

                        {/* Ngày sinh */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày sinh:
                            </label>
                            <input
                                type="date"
                                className={`border ${BORDER_COLOR} p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition`}
                                value={form.dateOfBirth?.split('T')[0] || ""}
                                onChange={(e) =>
                                    setForm({ ...form, dateOfBirth: e.target.value })
                                }
                            />
                        </div>

                        {/* Nút Hành động Form */}
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
                                {students.some((s) => s.email === form.email) ? "Cập nhật" : "Lưu"}
                            </motion.button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Bảng danh sách (Thêm animation container) */}
            <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-100">
                <table className="min-w-full bg-white text-sm">
                    <thead className={`${TABLE_HEADER_BG} text-left`}>
                        <tr>
                            <th className={`p-3 border-b ${BORDER_COLOR} font-bold text-gray-700`}>Email</th>
                            <th className={`p-3 border-b ${BORDER_COLOR} font-bold text-gray-700`}>Họ tên</th>
                            <th className={`p-3 border-b ${BORDER_COLOR} font-bold text-gray-700`}>Campus</th>
                            <th className={`p-3 border-b ${BORDER_COLOR} text-center font-bold text-gray-700`}>Ngày sinh</th>
                            <th className={`p-3 border-b ${BORDER_COLOR} text-center font-bold text-gray-700 w-32`}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((s, index) => (
                                <motion.tr // <-- Sử dụng motion.tr
                                    key={s.email} 
                                    className={`border-b ${BORDER_COLOR} hover:bg-gray-50 transition duration-150`}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={index} // Truyền index để tạo hiệu ứng staggered
                                >
                                    <td className="p-3 text-gray-700 font-medium">{s.email}</td>
                                    <td className="p-3 text-gray-700">
                                        {s.firstName} {s.lastName}
                                    </td>
                                    <td className="p-3 text-gray-500">{s.campus || "-"}</td>
                                    <td className="p-3 text-gray-500 text-center">
                                        {formatDate(s.dateOfBirth)}
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center space-x-2">
                                            {/* Nút Sửa (Thêm hiệu ứng motion) */}
                                            <motion.button
                                                onClick={() => setForm(s)}
                                                className={`text-cyan-500 p-2 rounded-full hover:bg-cyan-100 transition duration-150`}
                                                title="Sửa"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <FaEdit className="text-lg" />
                                            </motion.button>
                                            {/* Nút Xóa (Thêm hiệu ứng motion) */}
                                            <motion.button
                                                onClick={() => handleDelete(s.email)}
                                                className={`text-red-500 p-2 rounded-full hover:bg-red-100 transition duration-150`}
                                                title="Xóa"
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
                                    Không có học sinh nào trong hệ thống.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}