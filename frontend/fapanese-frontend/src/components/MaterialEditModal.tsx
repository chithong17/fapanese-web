import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AiOutlineUpload, AiOutlinePaperClip, AiOutlineSave } from 'react-icons/ai';
import CircularProgress from '@mui/material/CircularProgress';
import NotificationModal from './NotificationModal'; // Assuming path

// --- Interfaces (Copy from TeacherMaterialsPage) ---
interface Material { /* ... */
    id: number; title: string; description?: string | null; fileUrl: string; fileType?: string | null; fileSize?: number | null; createdAt: string; updatedAt: string; lecturerId: string; type: "RESOURCE" | "ASSIGNMENT" | "EXERCISE" | string;
}
type MaterialFormData = Partial<Omit<Material, 'id' | 'createdAt' | 'updatedAt'>>;

// --- Props Interface ---
interface MaterialEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Material | null; // Material data if editing, null/undefined if adding
    lecturerId: string | null;    // Needed for creating new material
    onSaveSuccess: (updatedMaterial?: Material) => void; // Callback after successful save
}

// --- Styles (Copy relevant styles) ---
const insetShadow = "inset 4px 4px 8px #c6c9cc, inset -4px -4px 8px #ffffff";


// --- ✅ THÊM HÀM HELPER NÀY VÀO ĐÂY (NGOÀI COMPONENT) ---
const formatFileSize = (bytes?: number | null): string => {
    if (bytes === null || bytes === undefined || bytes === 0) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    // Handle potential log(0) or negative bytes
    if (bytes < 1) return `0 ${sizes[0]}`;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // Ensure index is within bounds
    const index = Math.min(i, sizes.length - 1);
    return parseFloat((bytes / Math.pow(k, index)).toFixed(2)) + ' ' + sizes[index];
};
// --- KẾT THÚC THÊM HÀM ---


const MaterialEditModal: React.FC<MaterialEditModalProps> = ({
    isOpen,
    onClose,
    initialData,
    lecturerId,
    onSaveSuccess,
}) => {
    const [formData, setFormData] = useState<MaterialFormData>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notifMessage, setNotifMessage] = useState<string | null>(null);
    const [fileInputMethod, setFileInputMethod] = useState<'upload' | 'url'>('upload');
    const [oldFileUrlToDelete, setOldFileUrlToDelete] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const token = localStorage.getItem("token") || "";
    const API_URL = "http://localhost:8080/fapanese/api";

    // --- Initialize form data when modal opens or initialData changes ---
    useEffect(() => {
        if (isOpen) {
            setSaving(false);
            setUploading(false);
            setSelectedFile(null);
            setOldFileUrlToDelete(initialData ? initialData.fileUrl : null); // Store old URL if editing
            setFileInputMethod(initialData?.fileUrl ? 'url' : 'upload'); // Default to URL if editing with URL, else upload

            setFormData(
                initialData
                    ? { // Editing: Populate form
                        title: initialData.title,
                        description: initialData.description,
                        fileUrl: initialData.fileUrl,
                        type: initialData.type,
                        lecturerId: initialData.lecturerId,
                        fileType: initialData.fileType, // Keep existing type/size
                        fileSize: initialData.fileSize,
                    }
                    : { // Adding new: Default values + lecturerId
                        title: "",
                        description: null,
                        fileUrl: "",
                        type: "RESOURCE",
                        lecturerId: lecturerId || "",
                        fileType: null,
                        fileSize: null,
                    }
            );
             // Clear file input visually when opening
             if (fileInputRef.current) {
                 fileInputRef.current.value = "";
             }
        }
    }, [isOpen, initialData, lecturerId]);

    // --- Handlers (Copy and adjust from TeacherMaterialsPage) ---
    const handleChange = (key: keyof MaterialFormData, value: string | null) => { setFormData((prev) => ({ ...prev, [key]: value === '' ? null : value })); };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... Copy file size check logic ... */
        const file = event.target.files?.[0];
        setSelectedFile(null);
        if (file) {
            const fileSize = file.size; const fileType = file.type;
            let maxSize = 10 * 1024 * 1024; let typeCategory = "tài liệu"; // Default raw
            if (fileType.startsWith("image/")) { maxSize = 10 * 1024 * 1024; typeCategory = "hình ảnh"; }
            else if (fileType.startsWith("video/")) { maxSize = 100 * 1024 * 1024; typeCategory = "video"; }
            if (fileSize > maxSize) { setNotifMessage(`❌ Lỗi: File ${typeCategory} (${formatFileSize(fileSize)}) vượt quá giới hạn (${formatFileSize(maxSize)}).`); if (fileInputRef.current) { fileInputRef.current.value = ""; } return; }
            setSelectedFile(file); setFileInputMethod('upload'); setFormData(prev => ({ ...prev, fileUrl: "" })); setNotifMessage(null);
        }
     };

    const deleteCloudinaryFile = async (urlToDelete: string) => { /* ... Copy deleteCloudinaryFile logic ... */
        if (!urlToDelete) return; console.log("Requesting deletion of old file:", urlToDelete); setNotifMessage("Đang yêu cầu xóa file cũ..."); try { await axios.delete(`${API_URL}/files/delete-by-url`, { headers: { Authorization: `Bearer ${token}` }, params: { fileUrl: urlToDelete } }); console.log("Success delete request:", urlToDelete); } catch (err: any) { console.error("❌ Lỗi yêu cầu xóa file cũ:", urlToDelete, err); setNotifMessage(`⚠️ Cảnh báo: Không thể tự động xóa file cũ. Vui lòng xóa thủ công.`); }
    };

    const handleFileUpload = async () => { /* ... Copy handleFileUpload logic ... */
        if (!selectedFile) { setNotifMessage("Vui lòng chọn file."); return; }
        setUploading(true); setNotifMessage("Đang tải file mới...");
        const uploadFormData = new FormData(); uploadFormData.append("file", selectedFile); uploadFormData.append("folder", "materials");
        try {
            const res = await axios.post(`${API_URL}/files/upload`, uploadFormData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
            const newFileUrl = res.data.result;
            if (newFileUrl) {
                setNotifMessage("Tải file mới thành công! Đang xử lý...");
                // Call delete old file if editing and URL changed
                if (initialData && oldFileUrlToDelete && oldFileUrlToDelete !== newFileUrl) {
                    await deleteCloudinaryFile(oldFileUrlToDelete);
                    setOldFileUrlToDelete(null); // Clear after requesting deletion
                }
                setFormData(prev => ({ ...prev, fileUrl: newFileUrl, fileType: selectedFile.type || null, fileSize: selectedFile.size || null }));
                setSelectedFile(null); if (fileInputRef.current) { fileInputRef.current.value = ""; }
                setNotifMessage("Cập nhật thông tin file thành công.");
            } else { throw new Error("API không trả về URL."); }
        } catch (err: any) { console.error("❌ Lỗi upload file:", err); const errorMsg = err.response?.data?.message || err.message || "Không thể tải file."; setNotifMessage(`❌ Lỗi Upload: ${errorMsg}`); }
        finally { setUploading(false); }
     };

    const handleSave = async () => { /* ... Copy handleSave logic ... */
        if (!formData.title || !formData.fileUrl || !formData.lecturerId) { setNotifMessage("Lỗi: Vui lòng nhập Tiêu đề và có File URL."); return; }
        setSaving(true); setNotifMessage(null);
        const payload: MaterialFormData = { title: formData.title, description: formData.description || null, fileUrl: formData.fileUrl, type: formData.type || "RESOURCE", lecturerId: formData.lecturerId, fileType: formData.fileType || null, fileSize: formData.fileSize || null };
        let url = "", method: "post" | "put" = "post";
        if (initialData?.id) { url = `${API_URL}/materials/${initialData.id}`; method = "put"; }
        else { url = `${API_URL}/materials`; method = "post"; }
        try {
            const response = await axios[method](url, payload, { headers: { Authorization: `Bearer ${token}` } });
            setNotifMessage(initialData ? "Cập nhật thành công!" : "Thêm mới thành công!");
            onSaveSuccess(response.data.result); // Pass updated data back
            // onClose(); // Let parent handle closing
        } catch (err: any) { console.error("❌ Lỗi khi lưu tài liệu:", err); setNotifMessage(`❌ Không thể lưu: ${err.response?.data?.message || err.message}`); }
        finally { setSaving(false); }
     };

    // --- Render Form (Copy renderForm JSX with Labels) ---
    const renderForm = () => (
         <div className="flex flex-col gap-4">
            {/* Title */} <div> <label htmlFor="mat-title" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề (*)</label> <input id="mat-title" type="text" value={formData.title || ""} onChange={(e) => handleChange("title", e.target.value)} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} required/> </div>
            {/* Description */} <div> <label htmlFor="mat-description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label> <textarea id="mat-description" value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} className="w-full border p-3 rounded-lg min-h-[100px] focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} /> </div>
            {/* Type */} <div> <label htmlFor="mat-type" className="block text-sm font-medium text-gray-700 mb-1">Loại tài liệu (*)</label> <select id="mat-type" value={formData.type || "RESOURCE"} onChange={(e) => handleChange("type", e.target.value)} className="w-full border p-3 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }}> <option value="RESOURCE">Tài nguyên</option> <option value="ASSIGNMENT">Bài tập lớn</option> <option value="EXERCISE">Bài tập thực hành</option> </select> </div>
             {/* File Input Method Selection */}
             <div className="pt-2"> <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn File đính kèm (*)</label> <div className="flex gap-4 mb-3"> <label className="flex items-center gap-2 cursor-pointer"> <input type="radio" name="fileInputMethod" value="upload" checked={fileInputMethod === 'upload'} onChange={() => { setFileInputMethod('upload'); if(formData.fileUrl && !selectedFile && initialData?.fileUrl && formData.fileUrl !== initialData.fileUrl) { handleChange("fileUrl", initialData.fileUrl || null); } }} className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"/> <span className="text-sm">Tải file lên</span> </label> <label className="flex items-center gap-2 cursor-pointer"> <input type="radio" name="fileInputMethod" value="url" checked={fileInputMethod === 'url'} onChange={() => { setFileInputMethod('url'); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"/> <span className="text-sm">Dán Link URL</span> </label> </div>
             {/* Conditionally Render Input */}
             {fileInputMethod === 'upload' ? ( <div> <div className="flex items-center gap-3"> <input id="mat-file" type="file" ref={fileInputRef} onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 disabled:opacity-50 disabled:pointer-events-none" disabled={uploading}/> <button onClick={handleFileUpload} disabled={!selectedFile || uploading} className={`flex items-center flex-shrink-0 gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow ${!selectedFile || uploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}> {uploading ? <CircularProgress size={16} color="inherit"/> : <AiOutlineUpload />} {uploading ? 'Đang tải...' : 'Tải lên'} </button> </div> {formData.fileUrl && !selectedFile && ( <div className="mt-2 text-sm text-green-700 flex items-center gap-1"> <AiOutlinePaperClip /> <span>Đã tải lên: <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 break-all">{formData.fileUrl.split('/').pop()}</a></span> </div> )} {selectedFile && ( <div className="mt-2 text-sm text-blue-700"> Đã chọn: {selectedFile.name} ({formatFileSize(selectedFile.size)}) </div> )} </div> )
              : ( <div> <input id="mat-fileUrl" type="url" placeholder="https://..." value={formData.fileUrl || ""} onChange={(e) => { handleChange("fileUrl", e.target.value); handleChange("fileType", null); handleChange("fileSize", null); }} className="w-full border p-3 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" style={{ boxShadow: insetShadow }} required /> <p className="text-xs text-gray-500 mt-1">Dán link trực tiếp. Đảm bảo link công khai.</p> </div> )}
             </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[52] p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose} // Close when clicking backdrop
                >
                    <motion.div
                        className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                        initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
                    >
                        <h3 className="text-xl font-semibold text-gray-800 mb-5">
                            {initialData ? "Chỉnh sửa Tài liệu" : "Thêm Tài liệu mới"}
                        </h3>

                        {renderForm()}

                        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                            <button onClick={onClose} className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Hủy</button>
                            <button
                                onClick={handleSave}
                                disabled={saving || uploading}
                                className={`px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 ${(saving || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {saving ? <CircularProgress size={20} color="inherit"/> : <AiOutlineSave />} {/* Changed icon */}
                                {saving ? 'Đang lưu...' : (initialData ? 'Lưu thay đổi' : 'Thêm Tài liệu')}
                            </button>
                        </div>
                         {/* Internal Notification for upload/save errors */}
                         {notifMessage && <div className="mt-4 text-sm text-red-600">{notifMessage}</div>}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MaterialEditModal;