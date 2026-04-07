import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete, AiOutlineUpload, AiOutlinePaperClip, AiOutlineUsergroupAdd } from "react-icons/ai";
import axios, { AxiosError } from "axios"; // Import AxiosError
import NotificationModal from "../../components/NotificationModal";
import CircularProgress from "@mui/material/CircularProgress";


// --- Interface ---
interface Material {
    id: number;
    title: string;
    description?: string | null;
    fileUrl: string; // Renamed from file_url to match expected API response convention
    fileType?: string | null;
    fileSize?: number | null;
    createdAt: string; // Renamed from created_at
    updatedAt: string; // Renamed from updated_at
    lecturerId: string; // Renamed from lecturer_id
    type: "RESOURCE" | "ASSIGNMENT" | "EXERCISE" | string;
}

interface ClassCourse {
    id: number;           // Khớp với cột 'id' trong bảng class_course
    className: string;    // Khớp với cột 'class_name' trong bảng class_course (Giả sử API trả về là 'className')
    // Tùy chọn: Thêm các trường khác nếu API trả về và bạn cần hiển thị
    // semester?: string;    // Khớp với cột 'semester'
    // courseCode?: string; // Có thể lấy từ join với bảng course nếu API trả về
}

interface MaterialAssignment {
    id: { // Object chứa composite key
        classCourseId: number;
        materialId: number;
    };
    classCourse: { // Object chứa thông tin lớp
        id: number;
        className: string; // Tên lớp nằm ở đây
        // Thêm các trường khác của classCourse nếu cần
    };
    material?: Material; // Tùy chọn: nếu cần truy cập thông tin material lồng nhau
    assignedAt?: string;
    deadline: string | null; // Deadline vẫn ở cấp cao nhất
}

// Type for form data, making optional fields potentially null
type MaterialFormData = Partial<Omit<Material, 'id' | 'createdAt' | 'updatedAt'>> & {
    // We don't send id/timestamps when creating/updating directly like this
};


// --- Styles ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "8px 8px 15px #c6c9cc, -4px -4px 15px #ffffff";
const insetShadow = "inset 4px 4px 8px #c6c9cc, inset -4px -4px 8px #ffffff";
const fadeIn = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };


// --- ✅ DEFINE FILE SIZE LIMITS (in bytes) ---
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_RAW_SIZE = 10 * 1024 * 1024; // 10 MB (for PDF, DOCX, etc.)

// --- Component ---
const TeacherMaterialsPage: React.FC = () => {
    const navigate = useNavigate();

    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifMessage, setNotifMessage] = useState<string | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [formData, setFormData] = useState<MaterialFormData>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lecturerId, setLecturerId] = useState<string | null>(null); // State for lecturer ID
    const [loadingLecturer, setLoadingLecturer] = useState(true); // State for loading lecturer info

    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedMaterialForAssign, setSelectedMaterialForAssign] = useState<Material | null>(null);
    const [availableClasses, setAvailableClasses] = useState<ClassCourse[]>([]); // Tất cả lớp có thể gán
    const [currentAssignments, setCurrentAssignments] = useState<MaterialAssignment[]>([]); // Các lớp đã gán cho material đang chọn
    const [selectedClassIdsToAssign, setSelectedClassIdsToAssign] = useState<Set<number>>(new Set()); // ID các lớp mới được chọn để gán
    const [deadlineInput, setDeadlineInput] = useState<string>(""); // Input deadline dạng YYYY-MM-DDTHH:mm
    const [loadingAssignData, setLoadingAssignData] = useState(false); // Loading trong modal gán
    const [savingAssignment, setSavingAssignment] = useState(false); // Trạng thái đang lưu assignment



    const token = localStorage.getItem("token") || ""; // Assuming token is stored
    const API_URL = "https://fapanese-backend-production.up.railway.app/fapanese/api"; // Adjust if your base URL is different

    useEffect(() => {
        const fetchLecturerInfo = async () => {
            if (!token) {
                console.error("Token not found. Please login.");
                setNotifMessage("Lỗi: Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.");
                setLoadingLecturer(false);
                // navigate('/login'); // Optional redirect
                return;
            }

            setLoadingLecturer(true);
            try {
                // --- GIẢ ĐỊNH ENDPOINT LÀ /api/lecturers/me ---
                // --- THAY THẾ NẾU ENDPOINT CỦA BẠN KHÁC ---
                const response = await axios.get(`${API_URL}/users/profile`, { // Hoặc /api/users/profile, etc.
                    headers: { Authorization: `Bearer ${token}` },
                });

                const lecturerData = response.data.result || response.data; // Adjust based on your API response structure

                if (lecturerData && lecturerData.id) {
                    setLecturerId(lecturerData.id); // Lưu ID giảng viên vào state
                } else {
                    throw new Error("API response does not contain lecturer ID.");
                }
            } catch (err) {
                console.error("❌ Error fetching lecturer info:", err);
                setNotifMessage("Lỗi: Không thể lấy thông tin giảng viên từ server.");
                setLecturerId(null); // Reset ID on error
            } finally {
                setLoadingLecturer(false);
            }
        };

        fetchLecturerInfo();
    }, [token]); // Re-fetch if token changes


    // --- Fetch Materials ---
    const fetchMaterials = async () => {
        // Only fetch if lecturerId is available (if API requires it for filtering, otherwise remove this check)
        // Based on your API doc image, GET /api/materials seems to get all, maybe needs filtering later?
        // Let's assume for now GET /api/materials gets all or filters implicitly by token
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/materials`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Assuming API returns camelCase keys matching the Material interface
            setMaterials(res.data.result || res.data || []);
        } catch (err) {
            console.error("❌ Lỗi tải tài liệu:", err);
            setNotifMessage("Không thể tải danh sách tài liệu.");
            setMaterials([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch materials when lecturerId is set
    useEffect(() => {
        // We fetch materials regardless of lecturerId for now based on GET /api/materials
        // If your API needs filtering like GET /api/materials/by-lecturer/{id}, adjust here
        fetchMaterials();
    }, [token]); // Re-fetch if token changes (e.g., login/logout)

    // --- Modal Handlers ---
    const openModal = (material?: Material) => {
        setEditingMaterial(material || null);
        setFormData(
            material
                ? { // Populate form with existing data for editing
                    title: material.title,
                    description: material.description,
                    fileUrl: material.fileUrl,
                    type: material.type,
                    lecturerId: material.lecturerId, // Keep existing lecturerId
                    // We don't directly edit fileType/Size, they come from upload
                }
                : { // Default values for adding new
                    title: "",
                    description: null,
                    fileUrl: "", // Start empty, will be filled by upload
                    type: "RESOURCE", // Default type
                    lecturerId: lecturerId || "", // Set current lecturer ID
                }
        );
        setSelectedFile(null); // Reset selected file
        setUploading(false);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingMaterial(null);
        setFormData({});
        setSelectedFile(null);
        setUploading(false);
        // Clear the file input visually
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    const handleChange = (key: keyof MaterialFormData, value: string | null) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value === '' ? null : value, // Store empty strings as null for optional fields
        }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        // Reset state first
        setSelectedFile(null); // Clear previous selection
        // Keep formData.fileUrl as is for now, it will be cleared if validation passes

        if (file) {
            const fileSize = file.size;
            const fileType = file.type;
            let maxSize = MAX_RAW_SIZE; // Default limit for "raw" types (pdf, docx, etc.)
            let typeCategory = "tài liệu";

            if (fileType.startsWith("image/")) {
                maxSize = MAX_IMAGE_SIZE;
                typeCategory = "hình ảnh";
            } else if (fileType.startsWith("video/")) {
                maxSize = MAX_VIDEO_SIZE;
                typeCategory = "video";
            }

            // Check file size
            if (fileSize > maxSize) {
                setNotifMessage(
                    `Lỗi: Kích thước file ${typeCategory} (${formatFileSize(fileSize)}) vượt quá giới hạn cho phép (${formatFileSize(maxSize)}).`
                );
                // Clear the file input visually
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return; // Stop processing this file
            }

            // If size is OK, set the file and clear URL in form
            setSelectedFile(file);
            setFormData(prev => ({ ...prev, fileUrl: "" })); // Clear URL only if validation passes
            setNotifMessage(null); // Clear any previous error message

        }
        // If no file selected, selectedFile remains null
    };

    // --- Handle File Upload to Cloudinary via Backend ---
    const handleFileUpload = async () => {
        if (!selectedFile) {
            setNotifMessage("Vui lòng chọn một file để tải lên.");
            return;
        }
        setUploading(true);

        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        uploadFormData.append("folder", "fapanese/materials"); // Specify the Cloudinary folder

        try {
            const res = await axios.post(`${API_URL}/files/upload`, uploadFormData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const fileUrl = res.data.result; // Assuming API returns URL directly in result
            if (fileUrl) {
                setFormData(prev => ({
                    ...prev,
                    fileUrl: fileUrl,
                    // Optional: Try to get file type and size from the selectedFile
                    fileType: selectedFile.type || null,
                    fileSize: selectedFile.size || null,
                }));
                setNotifMessage("Tải file lên thành công!");
                setSelectedFile(null); // Clear selected file after successful upload
                // Clear the file input visually
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } else {
                throw new Error("API không trả về URL của file.");
            }
        } catch (err: any) {
            console.error("❌ Lỗi upload file:", err);
            const errorMsg = err.response?.data?.message || err.message || "Không thể tải file lên.";
            setNotifMessage(`❌ Lỗi Upload: ${errorMsg}`);
        } finally {
            setUploading(false);
        }
    };


    // --- Handle Save Material (Add/Edit) ---
    const handleSave = async () => {
        if (!formData.title || !formData.fileUrl || !formData.lecturerId) {
            setNotifMessage("Lỗi: Vui lòng nhập Tiêu đề và tải lên File đính kèm.");
            return;
        }
        setSaving(true); // Indicate saving process
        setNotifMessage(null);

        const payload: MaterialFormData = {
            title: formData.title,
            description: formData.description || null,
            fileUrl: formData.fileUrl,
            type: formData.type || "RESOURCE",
            lecturerId: formData.lecturerId,
            // Include fileType and fileSize if available in formData
            fileType: formData.fileType || null,
            fileSize: formData.fileSize || null,
        };

        let url = "";
        let method: "post" | "put" = "post";

        if (editingMaterial) {
            url = `${API_URL}/materials/${editingMaterial.id}`;
            method = "put";
        } else {
            url = `${API_URL}/materials`;
            method = "post";
        }

        try {
            await axios[method](url, payload, { headers: { Authorization: `Bearer ${token}` } });
            setNotifMessage(editingMaterial ? "Cập nhật tài liệu thành công!" : "Thêm tài liệu mới thành công!");
            closeModal();
            fetchMaterials(); // Refresh list
        } catch (err: any) {
            console.error("❌ Lỗi khi lưu tài liệu:", err);
            setNotifMessage(`❌ Không thể lưu tài liệu: ${err.response?.data?.message || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // --- Delete Material Handler ---
    const handleDelete = async (materialId: number) => {
        if (!window.confirm(`Bạn chắc chắn muốn XÓA tài liệu ID: ${materialId}?\nFile đính kèm trên Cloudinary sẽ KHÔNG bị xóa.`)) return;
        try {
            await axios.delete(`${API_URL}/materials/${materialId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifMessage(`Xóa tài liệu ID: ${materialId} thành công!`);
            fetchMaterials(); // Refresh the list
        } catch (err) {
            console.error("❌ Lỗi khi xóa tài liệu:", err);
            setNotifMessage("❌ Không thể xóa tài liệu!");
        }
    };

    // --- Helper to format file size ---
    const formatFileSize = (bytes?: number | null): string => {
        if (bytes === null || bytes === undefined || bytes === 0) return '-';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // --- Helper to format date ---
    const formatDate = (dateString?: string): string => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        } catch (e) {
            return dateString; // Return original if parsing fails
        }
    };


    // --- Render Add/Edit Form in Modal ---
    const renderForm = () => (
        <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề (*)</label>
                <input id="title" type="text" value={formData.title || ""} onChange={(e) => handleChange("title", e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} required />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea id="description" value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} className="w-full border p-3 rounded-lg min-h-[100px] focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} />
            </div>

            {/* Type */}
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Loại tài liệu (*)</label>
                <select id="type" value={formData.type || "RESOURCE"} onChange={(e) => handleChange("type", e.target.value)} className="w-full border p-3 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }}>
                    <option value="RESOURCE">Tài nguyên học tập (Resource)</option>
                    <option value="ASSIGNMENT">Bài tập lớn (Assignment)</option>
                    <option value="EXERCISE">Bài tập thực hành (Exercise)</option>
                </select>
            </div>

            {/* File Upload Section */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File đính kèm (*)</label>
                <div className="flex items-center gap-3">
                    <input
                        id="file"
                        type="file"
                        ref={fileInputRef} // Assign ref
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 disabled:opacity-50 disabled:pointer-events-none"
                        disabled={uploading}
                    />
                    <button
                        onClick={handleFileUpload}
                        disabled={!selectedFile || uploading}
                        className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow ${!selectedFile || uploading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        {uploading ? <CircularProgress size={16} color="inherit" /> : <AiOutlineUpload />}
                        {uploading ? 'Đang tải...' : 'Tải lên'}
                    </button>
                </div>
                {/* Display uploaded file URL or selected file name */}
                {formData.fileUrl && !selectedFile && (
                    <div className="mt-2 text-sm text-green-700 flex items-center gap-1">
                        <AiOutlinePaperClip />
                        <span>Đã tải lên: <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 break-all">{formData.fileUrl.split('/').pop()}</a></span>
                    </div>
                )}
                {selectedFile && !formData.fileUrl && (
                    <div className="mt-2 text-sm text-blue-700">
                        Đã chọn: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                )}
            </div>
        </div>
    );


    // --- ✅ ASSIGNMENT FUNCTIONS ---

    // Fetch all classes the lecturer can assign to
    const fetchAvailableClasses = useCallback(async () => {
        // --- !!! THAY THẾ ENDPOINT NÀY BẰNG API LẤY DANH SÁCH LỚP CỦA BẠN !!! ---
        try {
            const res = await axios.get(`${API_URL}/classes/by-lecturer/${lecturerId}`, { // Ví dụ: GET /api/class-courses
                headers: { Authorization: `Bearer ${token}` }
            });
            // Giả sử API trả về mảng [{ id: number, className: string, ... }]
            setAvailableClasses(res.data.result || res.data || []);
        } catch (err) {
            console.error("❌ Lỗi tải danh sách lớp:", err);
            setNotifMessage("Không thể tải danh sách lớp học.");
            setAvailableClasses([]);
        }
    }, [token, lecturerId]);

    // Fetch current assignments for a specific material
    const fetchCurrentAssignments = useCallback(async (materialId: number) => {
        setLoadingAssignData(true);
        setCurrentAssignments([]);
        try {
            // Endpoint này được giả định là đúng
            const res = await axios.get(`${API_URL}/materials/${materialId}/assignments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Dữ liệu trả về giờ sẽ khớp với interface MaterialAssignment đã sửa
            const assignmentData: MaterialAssignment[] = res.data.result || res.data || [];
            console.log("Fetched Current Assignments (raw):", assignmentData); // Log dữ liệu thô
            setCurrentAssignments(assignmentData);
        } catch (err: any) {
            // ... (xử lý lỗi 404 như cũ) ...
            if (axios.isAxiosError(err) && err.response?.status === 404) { setCurrentAssignments([]); }
            else { console.error(`❌ Lỗi tải assignments cho material ${materialId}:`, err); setNotifMessage("Không thể tải danh sách lớp đã gán."); }
        } finally {
            setLoadingAssignData(false);
        }
    }, [token]);

    // Open the assignment modal
    const openAssignModal = useCallback((material: Material) => {
        if (loadingLecturer) {
            setNotifMessage("Đang tải thông tin giảng viên, vui lòng đợi...");
            return;
        }

        if (!lecturerId) {
            setNotifMessage("Lỗi: Không thể xác định giảng viên để gán lớp.");
            return;
        }

        setSelectedMaterialForAssign(material);
        setSelectedClassIdsToAssign(new Set());
        setDeadlineInput("");
        setSavingAssignment(false);
        setShowAssignModal(true);
        fetchAvailableClasses(); // Fetch khi mở modal
        fetchCurrentAssignments(material.id); // Fetch khi mở modal
    }, [fetchAvailableClasses, fetchCurrentAssignments]);

    // Close assignment modal
    const closeAssignModal = () => {
        setShowAssignModal(false);
        setSelectedMaterialForAssign(null);
        setCurrentAssignments([]);
        // Giữ lại availableClasses để không fetch lại nếu không cần
    };

    // Toggle selection of a class to be assigned
    const toggleClassSelection = (classId: number) => {
        setSelectedClassIdsToAssign(prev => {
            const newSet = new Set(prev);
            if (newSet.has(classId)) { newSet.delete(classId); }
            else { newSet.add(classId); }
            return newSet;
        });
    };

    // Handle submitting assignments for selected classes
    const handleAssignSubmit = async () => {
        if (!selectedMaterialForAssign || selectedClassIdsToAssign.size === 0) {
            setNotifMessage("Vui lòng chọn ít nhất một lớp để gán.");
            return;
        }
        setSavingAssignment(true);
        setNotifMessage(null);

        const materialId = selectedMaterialForAssign.id;
        const assignmentPromises = [];
        // Format deadline YYYY-MM-DDTHH:mm:ss (nếu backend yêu cầu) hoặc để nguyên
        const deadlineParam = deadlineInput ? new Date(deadlineInput).toISOString() : undefined; // Chuyển sang ISO string nếu cần

        for (const classCourseId of selectedClassIdsToAssign) {
            assignmentPromises.push(
                axios.post(`${API_URL}/materials/${materialId}/assign`, null, { // POST với null body
                    headers: { Authorization: `Bearer ${token}` },
                    params: { // Gửi data qua query params
                        classCourseId: classCourseId,
                        deadline: deadlineParam // Gửi deadline nếu có
                    }
                })
            );
        }

        try {
            const results = await Promise.allSettled(assignmentPromises);
            let successCount = 0; let failCount = 0;
            results.forEach(result => {
                if (result.status === 'fulfilled') { successCount++; }
                else { failCount++; console.error("Assign error:", result.reason); }
            });
            let message = `Gán hoàn tất. Thành công: ${successCount}. Thất bại: ${failCount}.`;
            if (failCount > 0) message += " Kiểm tra console log.";
            setNotifMessage(message);
            fetchCurrentAssignments(materialId); // Tải lại danh sách đã gán
            setSelectedClassIdsToAssign(new Set()); // Reset lựa chọn
        } catch (err) {
            console.error("❌ Lỗi không xác định khi gán:", err);
            setNotifMessage("❌ Lỗi không mong muốn khi gán.");
        } finally {
            setSavingAssignment(false);
        }
    };

    // Handle unassigning (Placeholder - requires DELETE API)
    const handleUnassign = async (classCourseId: number) => {
        if (!selectedMaterialForAssign || !window.confirm(`GỠ GÁN khỏi lớp ID ${classCourseId}?`)) return;
        const materialId = selectedMaterialForAssign.id;

        // --- !!! THÊM API CALL DELETE Ở ĐÂY KHI CÓ !!! ---
        await axios.delete(`${API_URL}/materials/${materialId}/assign`,
            {
                params: { classCourseId },
                headers: { Authorization: `Bearer ${token}` }
            });

        setNotifMessage(`Đã gỡ gán khỏi lớp ${classCourseId}`);
        setCurrentAssignments(prev => prev.filter(a => a.classCourse.id !== classCourseId)); // Cập nhật UI tạm thời
    };

    const classesAvailableToAssign = useMemo(() => {
        console.log("Recalculating classesAvailableToAssign...");
        console.log("Input availableClasses:", availableClasses);
        console.log("Input currentAssignments (before map):", currentAssignments);

        // ✅ SỬA CÁCH LẤY ID: Truy cập vào object lồng nhau 'id'
        const assignedIds = new Set(currentAssignments.map(a => {
            const id = a.id?.classCourseId; // Lấy ID từ nested object
            console.log("Mapping assigned ID:", id, typeof id);
            return id;
        }).filter(id => typeof id === 'number')); // Lọc ra các ID không hợp lệ (phòng trường hợp)
        console.log("Set of assignedIds:", assignedIds);
        // --- KẾT THÚC SỬA ---


        const filteredList = availableClasses.filter(c => {
            const isAssigned = assignedIds.has(c.id);
            console.log(`Checking class ID: ${c.id} (type: ${typeof c.id}). Is assigned?`, isAssigned);
            return !isAssigned;
        });
        console.log("Result filtered classesAvailableToAssign:", filteredList);

        return filteredList;

    }, [availableClasses, currentAssignments]);

    // --- ✅ Render Assign Modal Form ---
    const renderAssignForm = () => {
        if (loadingAssignData) return <div className="flex justify-center p-4"><CircularProgress size={30} /></div>;

        console.log("Rendering Assign Form. Current Assignments:", currentAssignments);

        return (
            <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Currently Assigned */}
                <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">Đã gán cho các lớp:</h4>
                    {currentAssignments.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Chưa gán cho lớp nào.</p>
                    ) : (
                        <ul className="space-y-2">
                            {currentAssignments.map((assign, index) => {
                                // ✅ SỬA CÁCH LẤY DỮ LIỆU
                                const currentClassCourseId = assign.id?.classCourseId;
                                const currentClassName = assign.classCourse?.className;
                                // --- KẾT THÚC SỬA ---

                                // Log để debug
                                console.log(`Rendering assigned item. ID: ${currentClassCourseId}, Name: ${currentClassName}`);

                                // Bỏ qua nếu không lấy được ID
                                if (currentClassCourseId === undefined || currentClassCourseId === null) {
                                    console.warn("Skipping rendering assignment item due to missing ID:", assign);
                                    return null;
                                }

                                return (
                                    <li
                                        // Key vẫn dùng ID lớp học
                                        key={currentClassCourseId}
                                        className="flex justify-between items-center text-sm p-2 bg-gray-100 rounded"
                                    >
                                        <span>
                                            {/* Hiển thị className, fallback về ID */}
                                            <span className="font-medium">{currentClassName || `Lớp ID ${currentClassCourseId}`}</span>
                                            {assign.deadline && (
                                                <span className="text-xs text-orange-600 ml-2">(Deadline: {formatDate(assign.deadline)})</span>
                                            )}
                                        </span>
                                        <button
                                            // Truyền ID lớp học vào handleUnassign
                                            onClick={() => handleUnassign(currentClassCourseId)}
                                            disabled={savingAssignment}
                                            className="text-red-500 hover:text-red-700 disabled:text-gray-400 text-xs font-medium"
                                        >
                                            Gỡ gán
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                {/* ... (Phần Assign to New Classes và Deadline giữ nguyên) ... */}
                {/* Assign to New Classes */}
                <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">Gán cho lớp mới:</h4>
                    {classesAvailableToAssign.length === 0 ? (<p className="text-sm text-gray-500 italic">Không có lớp mới hoặc tất cả đã được gán.</p>)
                        : (<div className="space-y-1 max-h-48 overflow-y-auto border rounded p-2 bg-gray-50"> {classesAvailableToAssign.map(cls => (<label key={cls.id} className="flex items-center gap-2 p-1.5 hover:bg-cyan-50 rounded cursor-pointer"> <input type="checkbox" checked={selectedClassIdsToAssign.has(cls.id)} onChange={() => toggleClassSelection(cls.id)} className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500" /> <span className="text-sm text-gray-800">{cls.className || `Lớp ID ${cls.id}`}</span> </label>))} </div>)}
                </div>
                {/* Deadline Input (Optional) */}
                <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">Deadline (Tùy chọn)</label>
                    <input id="deadline" type="datetime-local" value={deadlineInput} onChange={(e) => setDeadlineInput(e.target.value)} className="w-full border p-2 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-sm" style={{ boxShadow: insetShadow }} min={new Date().toISOString().slice(0, 16)} />
                    <p className="text-xs text-gray-500 mt-1">Để trống nếu không có deadline.</p>
                </div>
            </div>
        );
    };


    // --- Main Render ---
    return (
        <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header & Back Button */}
                <div className="flex justify-between items-center mb-6">
                    <Link
                        to={`/teacher`} // Link back to teacher dashboard
                        className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
                    >
                        <IoMdArrowBack className="h-6 w-6" />
                        <span className="text-lg font-medium">Dashboard</span>
                    </Link>
                    <button
                        onClick={() => openModal()}
                        disabled={!lecturerId} // Disable if lecturerId is not loaded
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow font-semibold transition-colors ${!lecturerId
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        title={!lecturerId ? "Không thể thêm khi chưa có ID giảng viên" : "Thêm tài liệu mới"}
                    >
                        <AiOutlinePlus /> Thêm Tài liệu
                    </button>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý Tài liệu Giảng viên</h1>

                {/* Materials Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-60"><CircularProgress /></div>
                ) : materials.length === 0 ? (
                    <p className="text-center italic text-gray-500 mt-10">
                        Chưa có tài liệu nào. Bấm "Thêm Tài liệu" để bắt đầu.
                    </p>
                ) : (
                    <motion.div
                        initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                        style={{ boxShadow: neumorphicShadow }}
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {materials.map((mat) => (
                                        <motion.tr key={mat.id} variants={fadeIn} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate" title={mat.title}>{mat.title}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${mat.type === 'RESOURCE' ? 'bg-blue-100 text-blue-800' :
                                                    mat.type === 'ASSIGNMENT' ? 'bg-yellow-100 text-yellow-800' :
                                                        mat.type === 'EXERCISE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {mat.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-sm" title={mat.description || ''}><div className="line-clamp-2">{mat.description || '-'}</div></td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">
                                                <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1" title={mat.fileUrl}>
                                                    <AiOutlinePaperClip />
                                                    ({formatFileSize(mat.fileSize)})
                                                </a>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(mat.createdAt)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                                                <button
                                                    onClick={() => openAssignModal(mat)} // Gọi hàm mở modal gán
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Gán cho lớp"
                                                >
                                                    <AiOutlineUsergroupAdd className="h-5 w-5 inline" />
                                                </button>
                                                <button onClick={() => openModal(mat)} className="text-indigo-600 hover:text-indigo-900" title="Chỉnh sửa"> <AiOutlineEdit className="h-5 w-5 inline" /> </button>
                                                <button onClick={() => handleDelete(mat.id)} className="text-red-600 hover:text-red-900" title="Xóa"> <AiOutlineDelete className="h-5 w-5 inline" /> </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* --- Modal Thêm/Sửa Material --- */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[52] p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
                        <motion.div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>
                            <h3 className="text-xl font-semibold text-gray-800 mb-5">{editingMaterial ? "Chỉnh sửa Tài liệu" : "Thêm Tài liệu mới"}</h3>
                            {renderForm()}
                            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                                <button onClick={closeModal} className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Hủy</button>
                                <button onClick={handleSave} disabled={saving || uploading} className={`px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 ${(saving || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {saving ? <CircularProgress size={20} color="inherit" /> : <AiOutlinePlus />}
                                    {saving ? 'Đang lưu...' : (editingMaterial ? 'Lưu thay đổi' : 'Thêm Tài liệu')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- ✅ THÊM MODAL GÁN TÀI LIỆU --- */}
            <AnimatePresence>
                {showAssignModal && selectedMaterialForAssign && (
                    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[53] p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeAssignModal}>
                        <motion.div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">Gán Tài liệu</h3>
                            <p className="text-sm text-gray-600 mb-5 border-b pb-3">"{selectedMaterialForAssign.title}"</p>

                            {renderAssignForm()} {/* Render form gán */}

                            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                                <button onClick={closeAssignModal} className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Đóng</button>
                                <button
                                    onClick={handleAssignSubmit}
                                    disabled={savingAssignment || selectedClassIdsToAssign.size === 0} // Disable khi đang lưu hoặc chưa chọn lớp
                                    className={`px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 ${(savingAssignment || selectedClassIdsToAssign.size === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {savingAssignment ? <CircularProgress size={20} color="inherit" /> : <AiOutlineUsergroupAdd />}
                                    {savingAssignment ? 'Đang gán...' : `Gán cho ${selectedClassIdsToAssign.size} lớp`}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* --- HẾT PHẦN THÊM --- */}


            {/* Notification */}
            {notifMessage && (<NotificationModal message={notifMessage} onClose={() => setNotifMessage(null)} />)}
        </div>
    );
};

export default TeacherMaterialsPage;