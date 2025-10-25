import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosAddCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import { FaEdit, FaTrashAlt, FaSave, FaUpload } from "react-icons/fa";

// Giả định API của bạn đã có các hàm này
import {
    getAllStudents,
    registerStudent, // Dùng cho thêm thủ công
    updateStudent,
    deleteStudent,
    uploadStudentExcel, // API mới để upload file
} from "../../api/student"; // Đường dẫn tới file API của bạn

// --- CẤU HÌNH MÀU SẮC & ANIMATION ---
const PRIMARY_CYAN = "bg-cyan-600";
const HOVER_CYAN = "hover:bg-cyan-700";
const TABLE_HEADER_BG = "bg-gray-100";
const TEXT_CYAN = "text-cyan-600";
const BORDER_COLOR = "border-gray-200";

// Biến thể Form (Slide down)
const formVariants = {
    hidden: { opacity: 0, height: 0, y: -20, marginBottom: 0 }, // Thêm marginBottom
    visible: {
        opacity: 1,
        height: "auto",
        y: 0,
        marginBottom: "2rem", // Thêm marginBottom khi hiện
        transition: { duration: 0.4, ease: "easeInOut" }
    },
    exit: {
        opacity: 0,
        height: 0,
        y: -20,
        marginBottom: 0, // Bỏ marginBottom khi ẩn
        transition: { duration: 0.3, ease: "easeOut" }
    }
};

// Biến thể cho từng dòng trong bảng (Staggered list)
const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.04, // Giảm delay
            duration: 0.4,
            ease: "easeOut" // Thay đổi ease
        },
    }),
};

// --- Kiểu dữ liệu Form ---
interface StudentForm {
    firstName: string;
    lastName: string;
    email: string;
    campus?: string; // Cho phép campus là optional
    dateOfBirth?: string; // Cho phép dateOfBirth là optional
}

export default function StudentManagementPage() {
    const [students, setStudents] = useState<StudentForm[]>([]);
    const [form, setForm] = useState<StudentForm | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const token = localStorage.getItem("token") ?? "";

    // --- Fetch danh sách sinh viên ---
    const fetchStudents = async () => {
        try {
            const data = await getAllStudents(token);
            // Sắp xếp theo email hoặc tên nếu muốn
            setStudents(Array.isArray(data) ? data.sort((a, b) => a.email.localeCompare(b.email)) : []);
        } catch (err) {
            console.error("❌ Lỗi khi tải danh sách sinh viên:", err);
            alert("Không thể tải danh sách sinh viên. Vui lòng thử lại.");
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []); // Chỉ chạy 1 lần khi component mount

    // --- Xóa sinh viên ---
    const handleDelete = async (email: string) => {
        if (window.confirm(`Xác nhận xóa học sinh có Email: ${email}?`)) {
            try {
                await deleteStudent(email, token);
                setStudents(prev => prev.filter(s => s.email !== email));
                alert("Xóa thành công!");
            } catch (err: any) {
                console.error("❌ Lỗi khi xóa sinh viên:", err);
                alert(`Không thể xóa: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    // --- Lưu sinh viên (Thêm/Sửa thủ công) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form?.email || !form.firstName || !form.lastName) {
            alert("Vui lòng nhập đầy đủ Họ, Tên và Email.");
            return;
        }

        try {
            const isEditing = students.some((s) => s.email === form.email && form !== s); // Kiểm tra xem có đang edit không
            let result;
            if (isEditing) {
                result = await updateStudent(form.email, form, token);
                alert("Cập nhật thành công!");
            } else {
                // Kiểm tra email tồn tại trước khi thêm mới (nếu API update không cho phép tạo mới)
                if (students.some(s => s.email === form.email)) {
                    alert(`Email "${form.email}" đã tồn tại.`);
                    return; // Dừng lại nếu email đã có
                }
                result = await registerStudent(form, token);
                alert("Thêm mới thành công!");
            }
            console.log("API response:", result); // Log response để debug
            setForm(null); // Đóng form
            fetchStudents(); // Tải lại danh sách
        } catch (err: any) {
            console.error("❌ Lỗi khi lưu sinh viên:", err);
            alert(`Lỗi khi lưu: ${err.response?.data?.message || err.message}`);
        }
    };

    // --- Mở form thêm mới ---
    const handleAddStudent = () => {
        setUploadError(null); // Xóa lỗi upload cũ nếu có
        setUploadSuccessMessage(null);
        setForm({ firstName: "", lastName: "", email: "", campus: "", dateOfBirth: "" });
    };

    // --- Format ngày hiển thị ---
    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return "-";
        try {
            // Input là YYYY-MM-DD
            const parts = dateString.split('-');
            if (parts.length === 3) {
                // Output là DD/MM/YYYY
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return dateString; // Trả về nguyên gốc nếu không đúng định dạng
        } catch (e) {
            console.warn("Invalid date format for display:", dateString);
            return dateString; // Trả về nguyên gốc nếu lỗi
        }
    };

    // --- Xử lý click nút Upload ---
    const handleUploadClick = () => {
        setUploadError(null);
        setUploadSuccessMessage(null);
        fileInputRef.current?.click();
    };

    // --- Xử lý khi file được chọn và gửi lên BE ---
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Kiểm tra loại file cơ bản (có thể bỏ qua nếu BE xử lý)
        const allowedTypes = [
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
        ];
        if (!allowedTypes.includes(file.type)) {
            alert('Định dạng file không hợp lệ. Vui lòng chọn file Excel (.xls hoặc .xlsx).');
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        setUploadSuccessMessage(null);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file); // 'file' là key backend mong đợi

        try {
            const response = await uploadStudentExcel(
                formData,
                token,
                (progress) => { // Hàm callback được truyền vào
                    setUploadProgress(progress);
                    if (progress === 100) {
                        // Có thể thêm trạng thái "Đang xử lý sau upload" ở đây
                        console.log("Upload completed, backend processing...");
                    }
                }
            );
            setUploadSuccessMessage(response?.message || "Upload và xử lý thành công!");
            // alert(response?.message || "Upload thành công!"); // Có thể dùng alert hoặc state message
            fetchStudents(); // Tải lại danh sách

        } catch (err: any) {
            console.error("❌ Lỗi khi upload file:", err);
            const backendError = err.response?.data?.message || err.message || "Upload file thất bại.";
            setUploadError(`Lỗi: ${backendError}`);
            // alert(`Lỗi Upload: ${backendError}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        // Sử dụng padding và background color cho toàn trang
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">

            {/* Thanh tiêu đề và các nút */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý Học sinh</h1>
                <div className="flex flex-wrap items-center gap-3"> {/* Nhóm các nút lại */}
                    <motion.button
                        onClick={handleAddStudent}
                        disabled={isUploading || !!form}
                        className={`flex items-center gap-2 ${PRIMARY_CYAN} text-white px-4 py-2 rounded-lg shadow-md ${HOVER_CYAN} transition duration-200 font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <IoIosAddCircleOutline className="text-lg" />
                        Thêm thủ công
                    </motion.button>

                    <motion.button
                        onClick={handleUploadClick}
                        disabled={isUploading || !!form}
                        className={`flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-200 font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {isUploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" /* SVG spinner */ ></svg>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <FaUpload className="text-base" />
                                Upload Excel
                            </>
                        )}
                    </motion.button>
                </div>
                {/* Input file ẩn */}
                <input
                    type="file" ref={fileInputRef} onChange={handleFileChange}
                    accept=".xlsx, .xls, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                />
            </div>

            {/* --- Hiển thị Tiến trình Upload --- */}
            {isUploading && (
                <div className="mb-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <motion.div
                        className="bg-blue-600 h-2.5 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${uploadProgress}%` }} // Animate width theo %
                        transition={{ duration: 0.3, ease: "linear" }} // Hiệu ứng mượt
                    >
                    </motion.div>
                    <p className="text-xs text-center text-gray-600 mt-1">{uploadProgress}% uploaded</p>
                </div>
            )}



            {/* Thông báo Upload */}
            <AnimatePresence>
                {(uploadError || uploadSuccessMessage) && !isUploading && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`w-full mb-4 text-sm p-3 rounded border ${uploadError
                            ? 'text-red-700 bg-red-100 border-red-200'
                            : 'text-green-700 bg-green-100 border-green-200'
                            }`}
                    >
                        {uploadError || uploadSuccessMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form thêm / sửa */}
            <AnimatePresence>
                {form && (
                    <motion.form
                        onSubmit={handleSubmit}
                        className="bg-white p-5 sm:p-6 shadow-md rounded-xl border border-gray-200 overflow-hidden" // Nền trắng, shadow rõ hơn
                    >
                        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            {students.some((s) => s.email === form.email && form !== s) ? "Chỉnh sửa thông tin" : "Thêm học sinh mới"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm"> {/* Giảm gap, text-sm */}
                            <input
                                type="text" placeholder="Họ (First Name)*" required
                                className={`border ${BORDER_COLOR} p-2.5 rounded-md w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition`}
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form!, firstName: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Tên (Last Name)*" required
                                className={`border ${BORDER_COLOR} p-2.5 rounded-md w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition`}
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form!, lastName: e.target.value })}
                            />
                            <input
                                type="email" placeholder="Email*" required
                                className={`border ${BORDER_COLOR} p-2.5 rounded-md w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition ${students.some((s) => s.email === form.email && form !== s) ? 'bg-gray-100 cursor-not-allowed' : '' // Disable nếu đang edit
                                    }`}
                                value={form.email}
                                onChange={(e) => setForm({ ...form!, email: e.target.value })}
                                disabled={students.some((s) => s.email === form.email && form !== s)} // Disable khi edit
                            />
                            <input
                                type="text" placeholder="Campus"
                                className={`border ${BORDER_COLOR} p-2.5 rounded-md w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition`}
                                value={form.campus || ""}
                                onChange={(e) => setForm({ ...form!, campus: e.target.value })}
                            />
                        </div>

                        <div className="mb-5 text-sm"> {/* Giảm mb */}
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ngày sinh:</label>
                            <input
                                type="date"
                                className={`border ${BORDER_COLOR} p-2.5 rounded-md w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition`}
                                value={form.dateOfBirth || ""} // Hiển thị rỗng nếu không có
                                onChange={(e) => setForm({ ...form!, dateOfBirth: e.target.value || undefined })} // Gán undefined nếu rỗng
                            />
                        </div>

                        <div className="mt-4 flex justify-end gap-3 text-sm">
                            <motion.button
                                type="button" onClick={() => setForm(null)}
                                className="flex items-center gap-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition duration-200 font-medium"
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            >
                                <IoIosCloseCircleOutline className="text-base" /> Hủy
                            </motion.button>
                            <motion.button
                                type="submit"
                                className={`flex items-center gap-1 ${PRIMARY_CYAN} text-white px-4 py-2 rounded-md shadow ${HOVER_CYAN} transition duration-200 font-medium`}
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            >
                                <FaSave className="text-xs" />
                                {students.some((s) => s.email === form.email && form !== s) ? "Cập nhật" : "Lưu"}
                            </motion.button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Bảng danh sách */}
            <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                    <thead className={`${TABLE_HEADER_BG} text-left text-xs uppercase tracking-wider`}>{/* Style header */}
                        <tr>
                            <th className={`p-3 border-b ${BORDER_COLOR} font-semibold text-gray-600`}>Email</th>
                            <th className={`p-3 border-b ${BORDER_COLOR} font-semibold text-gray-600`}>Họ tên</th>
                            <th className={`p-3 border-b ${BORDER_COLOR} font-semibold text-gray-600`}>Campus</th>
                            <th className={`p-3 border-b ${BORDER_COLOR} text-center font-semibold text-gray-600`}>Ngày sinh</th>
                            <th className={`p-3 border-b ${BORDER_COLOR} text-center font-semibold text-gray-600 w-28`}> {/* Giảm width */}
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <motion.tbody layout>{/* Thêm layout prop cho tbody */}
                        {students.length > 0 ? (
                            students.map((s, index) => (
                                <motion.tr
                                    key={s.email} // Key rất quan trọng cho AnimatePresence và layout animation
                                    layout // Thêm layout prop
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden" // Sử dụng lại hidden variant cho exit
                                    custom={index}
                                    className={`border-b ${BORDER_COLOR} hover:bg-gray-50 transition duration-150`}
                                >
                                    <td className="p-3 text-gray-800 font-medium whitespace-nowrap">{s.email}</td>
                                    <td className="p-3 text-gray-700 whitespace-nowrap">{s.firstName} {s.lastName}</td>
                                    <td className="p-3 text-gray-500 whitespace-nowrap">{s.campus || "-"}</td>
                                    <td className="p-3 text-gray-500 text-center whitespace-nowrap">{formatDate(s.dateOfBirth)}</td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center items-center space-x-1.5"> {/* Giảm space */}
                                            <motion.button
                                                onClick={() => setForm(s)}
                                                className={`text-blue-600 p-1.5 rounded hover:bg-blue-100 transition duration-150`}
                                                title="Sửa"
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                            >
                                                <FaEdit className="text-base" /> {/* Tăng size */}
                                            </motion.button>
                                            <motion.button
                                                onClick={() => handleDelete(s.email)}
                                                className={`text-red-600 p-1.5 rounded hover:bg-red-100 transition duration-150`}
                                                title="Xóa"
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                            >
                                                <FaTrashAlt className="text-sm" /> {/* Giảm size */}
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center p-6 text-gray-500 italic">
                                    Không có học sinh nào.
                                </td>
                            </tr>
                        )}
                    </motion.tbody>
                </table>
            </div>
        </div>
    );
}