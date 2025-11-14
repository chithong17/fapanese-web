import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai"; // Added icons
import axios from "axios";
import NotificationModal from "../../components/NotificationModal";
import CircularProgress from "@mui/material/CircularProgress";

// --- Interfaces ---
interface Course { // Simplified for dropdown
    id: number;
    code: string;
    courseName: string; // Assuming API returns this field name
}

interface ClassCourse {
    id: number;           // ID của lớp học (class_course.id)
    className: string;
    semester: string;

    course?: { 
        id: number;       
        code: string;
        courseName: string;
    };

    lecturer?: {
        id: string;      
    };

}

// Request payload for Add/Edit
interface ClassCourseRequest {
    id?: number; // Only for PUT
    className: string;
    semester: string;
    courseId: number;
    lecturerId: string;
}

// --- Styles ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "8px 8px 15px #c6c9cc, -4px -4px 15px #ffffff";
const insetShadow = "inset 4px 4px 8px #c6c9cc, inset -4px -4px 8px #ffffff";
const fadeIn = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// --- Component ---
const TeacherClassesPage: React.FC = () => {
    const navigate = useNavigate();

    const [classes, setClasses] = useState<ClassCourse[]>([]);
    const [courses, setCourses] = useState<Course[]>([]); // For dropdown
    const [loading, setLoading] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [notifMessage, setNotifMessage] = useState<string | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassCourse | null>(null);
    const [formData, setFormData] = useState<Partial<ClassCourseRequest>>({});
    const [saving, setSaving] = useState(false);
    const [lecturerId, setLecturerId] = useState<string | null>(null);
    const [loadingLecturer, setLoadingLecturer] = useState(true);

    const token = localStorage.getItem("token") || "";
    const API_URL = "https://85e7dd680e50.ngrok-free.app/fapanese/api";

    // --- Get Lecturer ID (Reuse from Materials page) ---
    useEffect(() => {
        const fetchLecturerInfo = async () => { /* ... (same as before) ... */
            if (!token) { console.error("Token not found."); setNotifMessage("Lỗi: Không tìm thấy thông tin đăng nhập."); setLoadingLecturer(false); return; } setLoadingLecturer(true); try { const response = await axios.get(`${API_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } }); const lecturerData = response.data.result || response.data; if (lecturerData && lecturerData.id) { setLecturerId(String(lecturerData.id)); } else { throw new Error("API response does not contain lecturer ID."); } } catch (err) { console.error("❌ Error fetching lecturer info:", err); setNotifMessage("Lỗi: Không thể lấy thông tin giảng viên."); setLecturerId(null); } finally { setLoadingLecturer(false); }
        }; fetchLecturerInfo();
    }, [token]);

    // --- Fetch Available Courses (for dropdown) ---
    const fetchCourses = useCallback(async () => {
        setLoadingCourses(true);
        // --- !!! ADJUST ENDPOINT IF NEEDED !!! ---
        try {
            const res = await axios.get(`${API_URL}/courses`, { // Assuming GET /api/courses exists
                headers: { Authorization: `Bearer ${token}` }
            });
            // Assuming API returns [{ id, code, courseName }]
            setCourses(res.data.result || res.data || []);
        } catch (err) {
            console.error("❌ Lỗi tải danh sách khóa học:", err);
            setNotifMessage("Không thể tải danh sách khóa học để chọn.");
            setCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    }, [token]);

    // --- Fetch Classes for Lecturer ---
    const fetchClasses = useCallback(async () => {
        if (loadingLecturer || !lecturerId) return; // Wait for lecturer ID
        setLoading(true);
        // --- !!! CHOOSE/ADJUST ENDPOINT !!! ---
        // Option 1: Use by-lecturer if it returns a LIST
        // const url = `${API_URL}/classes/by-lecturer/${lecturerId}`;
        // Option 2: Use base /classes assuming it filters by token
        const url = `${API_URL}/classes`;

        try {
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const classData = res.data.result || res.data || [];
            if (Array.isArray(classData)) {
                setClasses(classData);
            } else {
                console.error("API did not return an array for classes:", classData);
                setClasses([]);
                setNotifMessage("Lỗi: Dữ liệu danh sách lớp không hợp lệ.");
            }
        } catch (err) {
            console.error("❌ Lỗi tải danh sách lớp:", err);
            setNotifMessage("Không thể tải danh sách lớp học.");
            setClasses([]);
        } finally {
            setLoading(false);
        }
    }, [token, lecturerId, loadingLecturer]);

    // Fetch courses and classes when lecturerId is available
    useEffect(() => {
        if (lecturerId) {
            fetchCourses();
            fetchClasses();
        }
    }, [lecturerId, fetchCourses, fetchClasses]);

    // --- Modal Handlers ---
    const openModal = (cls?: ClassCourse) => {
        if (!lecturerId) {
            setNotifMessage("Lỗi: Chưa có thông tin giảng viên.");
            return;
        }

        // Dữ liệu ban đầu cho form
        const initialFormData = cls
            ? { // Khi sửa: Lấy dữ liệu từ object 'cls'
                id: cls.id,
                className: cls.className,
                semester: cls.semester,
                courseId: cls.course?.id,
                lecturerId: cls.lecturer?.id // Đảm bảo lecturerId được copy từ cls
            }
            : { // Khi thêm mới: Dùng giá trị mặc định và lecturerId từ state
                className: "",
                semester: "",
                courseId: courses[0]?.id || undefined, // Lấy course đầu tiên nếu có
                lecturerId: lecturerId // Lấy từ state lecturerId
            };

        // --- ✅ THÊM CONSOLE LOG Ở ĐÂY ---
        console.log("Opening modal. Initial FormData:", initialFormData);
        // Kiểm tra xem tất cả các trường cần thiết (đặc biệt là courseId, lecturerId) có giá trị đúng không 

        setEditingClass(cls || null);
        setFormData(initialFormData);
        setSaving(false);
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingClass(null); setFormData({}); setSaving(false); };

    const handleChange = (key: keyof ClassCourseRequest, value: string | number) => {
        // Ensure courseId is stored as number
        const val = key === 'courseId' ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [key]: val }));
    };

    // --- Handle Save Class (Add/Edit) ---
    const handleSave = async () => {
        console.log("Attempting to save. Current formData:", formData);

        // Kiểm tra validation và log cụ thể nếu lỗi
        if (!formData.className || !formData.semester || !formData.courseId || !formData.lecturerId) {
            // --- ✅ LOG CHI TIẾT LỖI VALIDATION ---
            console.error("Validation failed! Checking values:", {
                className: formData.className,
                semester: formData.semester,
                courseId: formData.courseId,
                lecturerId: formData.lecturerId
            });
            setNotifMessage("Lỗi: Vui lòng điền đầy đủ Tên lớp, Học kỳ và chọn Khóa học.");
            return; // Dừng lại nếu validation thất bại
        }
        setSaving(true); setNotifMessage(null);

        const payload: ClassCourseRequest = {
            className: formData.className,
            semester: formData.semester,
            courseId: formData.courseId,
            lecturerId: formData.lecturerId,
        };

        let url = "";
        let method: "post" | "put" = "post";

        if (editingClass) {
            payload.id = editingClass.id; // Add ID for PUT
            url = `${API_URL}/classes/${editingClass.id}`;
            method = "put";
        } else {
            url = `${API_URL}/classes`;
            method = "post";
        }

        try {
            await axios[method](url, payload, { headers: { Authorization: `Bearer ${token}` } });
            setNotifMessage(editingClass ? "Cập nhật lớp thành công!" : "Thêm lớp mới thành công!");
            closeModal();
            fetchClasses(); // Refresh list
        } catch (err: any) {
            console.error("❌ Lỗi khi lưu lớp:", err);
            setNotifMessage(`❌ Không thể lưu lớp: ${err.response?.data?.message || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // --- Delete Class Handler ---
    const handleDelete = async (classId: number) => {
        if (!window.confirm(`Bạn chắc chắn muốn XÓA lớp ID: ${classId}?`)) return;
        try {
            await axios.delete(`${API_URL}/classes/${classId}`, { headers: { Authorization: `Bearer ${token}` } });
            setNotifMessage(`Xóa lớp ID: ${classId} thành công!`);
            fetchClasses(); // Refresh list
        } catch (err: any) {
            console.error("❌ Lỗi khi xóa lớp:", err);
            // Check for specific backend error if deletion is restricted
            if (axios.isAxiosError(err) && err.response?.status === 400 /* or another specific code */) {
                setNotifMessage(`❌ Không thể xóa lớp: ${err.response?.data?.message || 'Lớp có thể đang chứa dữ liệu liên quan.'}`);
            } else {
                setNotifMessage("❌ Không thể xóa lớp!");
            }
        }
    };

    // --- Navigate to Class Detail Page (Future Implementation) ---
    const navigateToClassDetail = (classId: number) => {
        // This is where you'll navigate to the page for managing students/materials
        console.log(`Navigating to detail page for class ID: ${classId}`);
        navigate(`/teacher/classes/${classId}/details`);
    };


    // --- Render Add/Edit Form ---
    const renderForm = () => (
        <div className="flex flex-col gap-4">
            <div>
                <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">Tên lớp (*)</label>
                <input id="className" type="text" value={formData.className || ""} onChange={(e) => handleChange("className", e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} required />
            </div>
            <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Học kỳ (*)</label>
                <input id="semester" type="text" value={formData.semester || ""} onChange={(e) => handleChange("semester", e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} required />
            </div>
            <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">Khóa học (*)</label>
                <select
                    id="courseId"
                    value={formData.courseId || ""}
                    onChange={(e) => handleChange("courseId", e.target.value)}
                    className="w-full border p-3 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500"
                    style={{ boxShadow: insetShadow }}
                    required
                    disabled={loadingCourses}
                >
                    <option value="" disabled>-- {loadingCourses ? 'Đang tải...' : 'Chọn khóa học'} --</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.courseName} ({course.code})
                        </option>
                    ))}
                </select>
                {courses.length === 0 && !loadingCourses && <p className="text-xs text-red-500 mt-1">Không tìm thấy khóa học nào để chọn.</p>}
            </div>
        </div>
    );

    // --- Main Render ---
    if (loadingLecturer) { return (<div className="flex justify-center items-center h-screen"><CircularProgress /> Đang tải thông tin giảng viên...</div>); }
    if (!lecturerId) { return (<div className="flex justify-center items-center h-screen text-red-600">Lỗi: Không thể xác thực thông tin giảng viên.</div>); }


    return (
        <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header & Back Button */}
                <div className="flex justify-between items-center mb-6">
                    <Link to={`/teacher`} className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"> <IoMdArrowBack className="h-6 w-6" /> <span className="text-lg font-medium">Dashboard</span> </Link>
                    <button onClick={() => openModal()} disabled={loadingCourses || courses.length === 0} className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow font-semibold transition-colors ${(loadingCourses || courses.length === 0) ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`} title={loadingCourses ? "Đang tải khóa học..." : (courses.length === 0 ? "Cần có khóa học để tạo lớp" : "Thêm lớp mới")}> <AiOutlinePlus /> Thêm Lớp </button>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý Lớp học</h1>

                {/* Class Table/Grid */}
                {loading ? (<div className="flex justify-center items-center h-60"><CircularProgress /></div>)
                    : classes.length === 0 ? (<p className="text-center italic text-gray-500 mt-10">Bạn chưa quản lý lớp học nào.</p>)
                        : (
                            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((cls) => (
                                    <motion.div
                                        key={cls.id} variants={fadeIn}
                                        className="group bg-white rounded-lg shadow-md p-5 flex flex-col justify-between"
                                        style={{ boxShadow: neumorphicShadow, minHeight: '180px' }}
                                    >
                                        {/* Class Info */}
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h2 className="text-lg font-bold text-gray-800 truncate" title={cls.className}>{cls.className}</h2>
                                                {/* Edit/Delete Buttons */}
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                    <button onClick={() => openModal(cls)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-full" title="Sửa lớp"> <AiOutlineEdit className="h-4 w-4" /> </button>
                                                    <button onClick={() => handleDelete(cls.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full" title="Xóa lớp"> <AiOutlineDelete className="h-4 w-4" /> </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-1">Học kỳ: {cls.semester}</p>
                                            <p className="text-sm text-gray-600 font-medium truncate" title={cls.course?.courseName || "Course"}>
                                                Khóa học: {cls.course?.courseName || "Course"} {cls.course?.code ? `(${cls.course.code})` : ''}
                                            </p>
                                            {/* Placeholder for student count if API provides it */}
                                            {/* <p className="text-xs text-gray-400 mt-1">Số sinh viên: {cls.studentCount || 'N/A'}</p> */}
                                        </div>

                                        {/* Manage Button */}
                                        <button
                                            onClick={() => navigateToClassDetail(cls.id)}
                                            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-full shadow hover:shadow-md transition-shadow transform hover:scale-[1.02]"
                                        >
                                            Quản lý Lớp
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
            </div>

            {/* --- Modal Thêm/Sửa Class --- */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[52] p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
                        <motion.div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>
                            <h3 className="text-xl font-semibold text-gray-800 mb-5">{editingClass ? "Chỉnh sửa Lớp học" : "Thêm Lớp học mới"}</h3>
                            {renderForm()}
                            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                                <button onClick={closeModal} className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Hủy</button>
                                <button onClick={handleSave} disabled={saving} className={`px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {saving ? <CircularProgress size={20} color="inherit" /> : <AiOutlinePlus />}
                                    {saving ? 'Đang lưu...' : (editingClass ? 'Lưu thay đổi' : 'Thêm Lớp')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification */}
            {notifMessage && (<NotificationModal message={notifMessage} onClose={() => setNotifMessage(null)} />)}
        </div>
    );
};

export default TeacherClassesPage;