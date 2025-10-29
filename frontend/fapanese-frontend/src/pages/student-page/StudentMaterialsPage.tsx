import React, { useRef, useState, useEffect } from "react";
import {
  UploadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PaperClipOutlined, // Sử dụng icon này cho file
  LinkOutlined, // Icon cho link
  MessageOutlined, // Icon cho feedback
  CheckOutlined, // Icon cho đã nộp
  InboxOutlined, // Icon cho chưa nộp
  BookOutlined, // Icon cho tài liệu
  EditOutlined, // Icon cho bài tập
} from "@ant-design/icons";
import { message, Spin, Tag as AntTag } from "antd"; // Giữ lại message và Spin, Tag
import axios from "axios";
// ✅ SỬA LỖI IMPORT: Thêm AnimatePresence
import { motion, AnimatePresence } from "framer-motion";
import CircularProgress from "@mui/material/CircularProgress";

// --- Interfaces (Giữ nguyên) ---
interface Material {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  type: "RESOURCE" | "ASSIGNMENT" | "EXERCISE";
  deadline?: string | null;
}

interface Submission {
  id: number;
  materialId: number;
  fileUrl?: string;
  submissionText?: string;
  submissionLink?: string;
  submittedAt?: string;
  score?: number | null;
  feedback?: string | null;
  status: "PENDING" | "SUBMITTED" | "GRADED";
}

// --- Style Constants ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "20px 20px 40px #c6c9cc, -10px -10px 40px #ffffff";
const neumorphicShadowInset = "inset 8px 8px 15px #c6c9cc, inset -8px -8px 15px #ffffff";

// --- Card Animation ---
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"resources" | "assignments">(
    "resources"
  );

  // --- ✅ THAY ĐỔI STATE FILE ---
  // Bỏ 'UploadFile' (của Antd), dùng 'File' (của trình duyệt)
  const [selectedFiles, setSelectedFiles] = useState<{
    [key: number]: File | null;
  }>({});
  // --- KẾT THÚC THAY ĐỔI ---

  const [submissionTexts, setSubmissionTexts] = useState<{
    [key: number]: string;
  }>({});
  const [submissionLinks, setSubmissionLinks] = useState<{
    [key: number]: string;
  }>({});
  const [submittingIds, setSubmittingIds] = useState<Set<number>>(new Set()); // State loading cho từng nút nộp bài

  const [submissionMethod, setSubmissionMethod] = useState<{
    [key: number]: 'file' | 'link';
  }>({});

  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("studentId") || "";
  const classCourseId = localStorage.getItem("classCourseId") || ""; // Vẫn lấy classCourseId để GỬI BÀI (handleSubmit)
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/fapanese/api";

  // --- ✅ SỬA LẠI LOGIC FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      // Kiểm tra các giá trị bắt buộc (chỉ cần studentId và token cho fetch)
      if (!studentId || !token) {
        message.error("Thiếu thông tin sinh viên hoặc token. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // --- ✅ SỬA API ENDPOINT VỀ GỐC ---
        const [matRes, subRes] = await Promise.all([
          // Trả về API gốc
          axios.get(`${API_BASE}/materials/student/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // Trả về API gốc
          axios.get(`${API_BASE}/material-submissions/student/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setMaterials(matRes.data.result || []);
        setSubmissions(subRes.data.result || []);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId, token]); // ✅ Bỏ classCourseId khỏi dependency array của fetch

  // --- ✅ HÀM XỬ LÝ CHỌN FILE MỚI ---
  const handleFileChange = (
    materialId: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    setSelectedFiles((prev) => ({
      ...prev,
      [materialId]: file,
    }));
    // Clear giá trị để có thể chọn lại file cũ nếu muốn
    event.target.value = "";
  };

  const clearFileSelection = (materialId: number) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [materialId]: null,
    }));
  };


  const handleMethodChange = (materialId: number, method: 'file' | 'link') => {
    // Cập nhật phương thức được chọn
    setSubmissionMethod(prev => ({
      ...prev,
      [materialId]: method
    }));

    // Quan trọng: Xóa dữ liệu của phương thức CÒN LẠI để tránh nộp nhầm
    if (method === 'file') {
      // Nếu chọn 'file', xóa 'link'
      setSubmissionLinks(prev => ({ ...prev, [materialId]: "" }));
    } else {
      // Nếu chọn 'link', xóa 'file'
      setSelectedFiles(prev => ({ ...prev, [materialId]: null }));
      // (Không cần reset input file ref vì nó sẽ bị ẩn đi)
    }
  };

  // --- ✅ HÀM SUBMIT (Giữ nguyên, vẫn dùng classCourseId khi GỬI BÀI) ---
  const handleSubmit = async (materialId: number) => {
    const file = selectedFiles[materialId];
    const text = submissionTexts[materialId] || "";
    const link = submissionLinks[materialId] || "";

    if (!file && !text && !link) {
      message.warning("Bạn phải nộp ít nhất 1 file, link hoặc nội dung text.");
      return;
    }

    // Kiểm tra classCourseId trước khi nộp
    if (!classCourseId) {
      message.error("Lỗi: Không tìm thấy ID lớp học. Vui lòng tải lại trang.");
      return;
    }

    setSubmittingIds(prev => new Set(prev).add(materialId));
    const loadingKey = "submit" + materialId;
    message.loading({ content: "Đang nộp bài...", key: loadingKey, duration: 0 });

    try {
      let uploadedUrl = null;

      // 1. Upload file nếu có
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "fapanese/submissions");

        const uploadRes = await axios.post(
          `${API_BASE}/files/upload`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
        uploadedUrl = uploadRes.data.result;
      }

      // 2. Tạo payload (vẫn bao gồm classCourseId)
      const payload = {
        studentId,
        materialId,
        classCourseId, // classCourseId rất quan trọng để biết nộp cho lớp nào
        fileUrl: uploadedUrl,
        fileType: file?.type || null,
        submissionText: text || null,
        submissionLink: link || null,
      };

      // 3. Gửi submission
      await axios.post(`${API_BASE}/material-submissions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success({ content: "✅ Nộp bài thành công!", key: loadingKey, duration: 2 });

      // 4. Reload submissions (vẫn dùng API gốc)
      const subRes = await axios.get(
        `${API_BASE}/material-submissions/student/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(subRes.data.result || []);

      // Xóa form sau khi nộp
      setSelectedFiles(prev => ({ ...prev, [materialId]: null }));
      setSubmissionTexts(prev => ({ ...prev, [materialId]: "" }));
      setSubmissionLinks(prev => ({ ...prev, [materialId]: "" }));

    } catch (err) {
      console.error(err);
      message.error({ content: "❌ Lỗi khi nộp bài. Thử lại sau.", key: loadingKey, duration: 3 });
    } finally {
      setSubmittingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(materialId);
        return newSet;
      });
    }
  };

  const getSubmissionForMaterial = (
    materialId: number
  ): Submission | undefined =>
    submissions.find((s) => s.materialId === materialId);

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("vi-VN", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- Render Functions (Giữ nguyên) ---

  const renderResourcesTab = () => {
    const resources = materials.filter((m) => m.type === "RESOURCE");
    if (resources.length === 0)
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 italic p-10">
          Chưa có tài liệu học nào được gán cho lớp này.
        </motion.div>
      );

    return (
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
      >
        {resources.map((mat, i) => (
          <motion.div
            key={mat.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl p-6 shadow-lg transition-shadow duration-300 hover:shadow-cyan-100"
            style={{ boxShadow: neumorphicShadow }}
          >
            <div className="flex justify-between items-start mb-3">
              <BookOutlined className="text-2xl text-cyan-600 p-3 bg-cyan-50 rounded-lg" />
              <AntTag color="green">Tài liệu</AntTag>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate" title={mat.title}>{mat.title}</h3>
            <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">{mat.description}</p>
            {mat.fileUrl && (
              <a
                href={mat.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
              >
                <FileTextOutlined /> Xem tài liệu
              </a>
            )}
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderAssignmentsTab = () => {
    const assignments = materials.filter((m) => m.type !== "RESOURCE");
    if (assignments.length === 0)
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 italic p-10">
          Không có bài tập nào được gán.
        </motion.div>
      );

    return (
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
      >
        {assignments.map((mat, i) => {
          const submission = getSubmissionForMaterial(mat.id);
          const isSubmitted = submission && (submission.status === "SUBMITTED" || submission.status === "GRADED");
          const isGraded = submission && submission.status === "GRADED";
          const isDeadlinePassed = mat.deadline ? new Date(mat.deadline) < new Date() : false;

          const fileIsSelected = !!selectedFiles[mat.id];
          const linkIsEntered = !!submissionLinks[mat.id] && submissionLinks[mat.id].trim() !== "";

          return (
            <motion.div
              key={mat.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl shadow-lg transition-shadow duration-300 flex flex-col"
              style={{ boxShadow: neumorphicShadow }}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <EditOutlined className={`text-2xl p-3 rounded-lg ${mat.type === "ASSIGNMENT" ? "text-orange-600 bg-orange-50" : "text-blue-600 bg-blue-50"}`} />
                  <AntTag color={mat.type === "ASSIGNMENT" ? "orange" : "blue"}>
                    {mat.type === "ASSIGNMENT" ? "Bài tập lớn" : "Bài tập"}
                  </AntTag>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate" title={mat.title}>{mat.title}</h3>
                <p className="text-sm text-gray-600 h-10 line-clamp-2">{mat.description}</p>
                {mat.deadline && (
                  <p className={`text-sm font-medium mt-2 flex items-center gap-1.5 ${isDeadlinePassed && !isSubmitted ? 'text-red-600' : 'text-gray-500'}`}>
                    <ClockCircleOutlined />
                    Deadline: {formatDate(mat.deadline)}
                    {isDeadlinePassed && !isSubmitted && <span className="text-xs font-semibold">(Đã trễ)</span>}
                  </p>
                )}
                {mat.fileUrl && (
                  <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-700 font-medium hover:underline inline-flex items-center gap-1 mt-2">
                    <PaperClipOutlined /> Xem đề bài
                  </a>
                )}
              </div>

              {/* Card Body: Submission Area */}
              <div className="p-5 flex-grow flex flex-col">
                {submission ? (
                  // --- Đã nộp (Submitted View) ---
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-grow">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700">Bài nộp của bạn</h4>
                      <AntTag
                        color={isGraded ? "green" : "blue"}
                        icon={isGraded ? <CheckCircleOutlined /> : <CheckOutlined />}
                      >
                        {isGraded ? "Đã chấm" : "Đã nộp"}
                      </AntTag>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">Nộp lúc: {formatDate(submission.submittedAt)}</p>

                    {submission.fileUrl && (
                      <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cyan-700 hover:underline text-sm mb-2 font-medium">
                        <PaperClipOutlined /> Xem file đã nộp
                      </a>
                    )}
                    {submission.submissionLink && (
                      <a href={submission.submissionLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 hover:underline text-sm mb-2 font-medium break-all">
                        <LinkOutlined /> {submission.submissionLink}
                      </a>
                    )}
                    <p className="mt-2 bg-white p-3 rounded border text-sm text-gray-700 whitespace-pre-wrap">
                      <span className="font-medium">Nội dung text:</span><br />
                      {submission.submissionText || "---"} {/* Sử dụng '|| "-"' để fallback */}
                    </p>

                    {/* Grade & Feedback */}
                    {isGraded && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-lg text-gray-800 font-bold mb-1">
                          Điểm: <span className="text-green-600">{submission.score}</span>
                        </p>
                        {submission.feedback && (
                          <p className="text-sm text-gray-600 italic">
                            <MessageOutlined /> <span className="font-medium">Nhận xét:</span> {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // --- Chưa nộp (Submission Form) ---
                  <div className="flex flex-col gap-4 flex-grow">

                    {/* --- 1. BỘ CHỌN RADIO (Giữ nguyên) --- */}
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`method-${mat.id}`}
                          value="file"
                          checked={(submissionMethod[mat.id] || 'file') === 'file'}
                          onChange={() => handleMethodChange(mat.id, 'file')}
                          disabled={isDeadlinePassed || submittingIds.has(mat.id)}
                          className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">Upload File</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`method-${mat.id}`}
                          value="link"
                          checked={submissionMethod[mat.id] === 'link'}
                          onChange={() => handleMethodChange(mat.id, 'link')}
                          disabled={isDeadlinePassed || submittingIds.has(mat.id)}
                          className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">Dán Link</span>
                      </label>
                    </div>

                    {/* --- 2. HIỂN THỊ CÓ ĐIỀU KIỆN INPUT FILE (Đã bỏ animation) --- */}
                    {(submissionMethod[mat.id] || 'file') === 'file' && (
                      <div
                        key="file-input"
                        className="flex flex-col" // Bỏ overflow-hidden
                      >
                        <label className={`cursor-pointer bg-white text-cyan-700 font-semibold text-sm border border-gray-300 rounded-lg p-2.5 text-center transition-colors duration-200 ${isDeadlinePassed ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-500" : "hover:bg-cyan-50"
                          }`} style={{}}>
                          <UploadOutlined /> <span>{selectedFiles[mat.id] ? "Thay đổi file" : "Chọn file nộp"}</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(mat.id, e)}
                            disabled={isDeadlinePassed}
                          />
                        </label>
                        {selectedFiles[mat.id] && (
                          <div className="text-xs text-gray-600 mt-1.5 flex justify-between items-center">
                            <span className="truncate w-4/5" title={selectedFiles[mat.id]?.name}>{selectedFiles[mat.id]?.name}</span>
                            <button onClick={() => clearFileSelection(mat.id)} className="text-red-500 text-xs font-bold hover:underline">Xóa</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- 3. HIỂN THỊ CÓ ĐIỀU KIỆN INPUT LINK (Đã bỏ animation) --- */}
                    {submissionMethod[mat.id] === 'link' && (
                      <div
                        key="link-input"
                      >
                        <input
                          type="url"
                          placeholder="Dán link bài nộp (Google Docs, Github...)"
                          className={`w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-cyan-500 focus:border-cyan-500 ${isDeadlinePassed ? "bg-gray-100 opacity-70 cursor-not-allowed" : ""
                            }`}
                          style={{}}
                          value={submissionLinks[mat.id] || ""}
                          onChange={(e) => setSubmissionLinks((prev) => ({ ...prev, [mat.id]: e.target.value }))}
                          disabled={isDeadlinePassed}
                        />
                      </div>
                    )}

                    {/* Text Input (Vẫn hiển thị) */}
                    <textarea
                      placeholder="Nhập nội dung bài làm (tùy chọn)..."
                      className={`w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-cyan-500 focus:border-cyan-500 ${isDeadlinePassed ? "bg-gray-100" : ""}`}
                      style={{}}
                      rows={3}
                      value={submissionTexts[mat.id] || ""}
                      onChange={(e) => setSubmissionTexts((prev) => ({ ...prev, [mat.id]: e.target.value }))}
                      disabled={isDeadlinePassed}
                    />

                    {/* Submit Button (Giữ nguyên) */}
                    <button
                      className={`w-full px-4 py-2.5 bg-gradient-to-r ${isDeadlinePassed
                        ? "from-gray-400 to-gray-500 cursor-not-allowed"
                        : "from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                        } text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform ${!isDeadlinePassed && "hover:scale-105"
                        } active:scale-95 flex items-center justify-center gap-2`}
                      onClick={() => handleSubmit(mat.id)}
                      disabled={isDeadlinePassed || submittingIds.has(mat.id)}
                    >
                      {submittingIds.has(mat.id) ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : isDeadlinePassed ? (
                        "Đã trễ hạn"
                      ) : (
                        "Nộp bài"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  // --- Main Return (Replaced Antd Tabs) ---
  return (
    <div
      className="p-4 sm:p-8 min-h-screen"
      style={{ backgroundColor: mainBg }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center"
      >
        Học liệu & Bài tập
      </motion.h1>

      {/* Custom Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-6"
      >
        <div className="flex p-1.5 rounded-full" style={{ boxShadow: neumorphicShadowInset }}>
          <button
            onClick={() => setActiveTab("resources")}
            className={`px-6 sm:px-10 py-2.5 rounded-full font-semibold transition-all duration-300 ${activeTab === "resources"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-gray-600 hover:bg-white/50"
              }`}
          >
            Tài liệu
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-6 sm:px-10 py-2.5 rounded-full font-semibold transition-all duration-300 ${activeTab === "assignments"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-gray-600 hover:bg-white/50"
              }`}
          >
            Bài tập
          </button>
        </div>
      </motion.div>

      {/* Content Area */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab} // Key changes to trigger animation
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="Đang tải dữ liệu..." />
              </div>
            ) : activeTab === "resources" ? (
              renderResourcesTab()
            ) : (
              renderAssignmentsTab()
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}