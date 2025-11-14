import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import {
  AiOutlineUsergroupAdd,
  AiOutlineDelete,
  AiOutlineSearch,
  AiOutlineFolderOpen,
  AiOutlineCheckSquare,
  AiOutlinePlusCircle,
  AiOutlinePaperClip, // Thêm icon
  AiOutlineCalendar,
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineSave,
} from "react-icons/ai"; // Icons
import axios from "axios";
import NotificationModal from "../../components/NotificationModal";
import CircularProgress from "@mui/material/CircularProgress";
import MaterialEditModal from "../../components/MaterialEditModal";

// --- Interfaces ---
interface Student {
  id: string; // Assuming student ID is string (UUID)
  firstName: string;
  lastName: string;
  email: string; // Or other display info
  // Add other fields if needed
}

interface ClassCourse {
  // For displaying class info
  id: number;
  className: string;
  semester: string;
  course?: { id: string; courseName: string; code: string };
  lecturer?: { id: string };
}

interface Material {
  // Interface Material đầy đủ
  id: number;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt: string;
  updatedAt: string;
  lecturerId: string;
  type: "RESOURCE" | "ASSIGNMENT" | "EXERCISE" | string;
}
interface MaterialAssignment {
  // Dữ liệu trả về từ API get assignments for class
  material: Material; // Chứa object Material đầy đủ
  assignedAt?: string;
  deadline: string | null;
  // classCourseId không cần nữa vì đã lọc theo classId
}

// --- Styles ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "8px 8px 15px #c6c9cc, -4px -4px 15px #ffffff";
const insetShadow = "inset 4px 4px 8px #c6c9cc, inset -4px -4px 8px #ffffff";
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- Component ---
const TeacherClassDetailPage: React.FC = () => {
  const { classId } = useParams(); // Get classId from URL

  const [currentClass, setCurrentClass] = useState<ClassCourse | null>(null);
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]); // For adding students
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAllStudents, setLoadingAllStudents] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "students" | "materials" | "submissions"
  >("students");

  // Add Student Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentIdsToAdd, setSelectedStudentIdsToAdd] = useState<
    Set<string>
  >(new Set()); // Dùng Set để lưu nhiều ID
  const [addingStudent, setAddingStudent] = useState(false); // Saving state for adding

  // --- ✅ STATE CHO TAB TÀI LIỆU ---
  const [materialsInClass, setMaterialsInClass] = useState<
    MaterialAssignment[]
  >([]); // Tài liệu đã gán
  const [allMaterials, setAllMaterials] = useState<Material[]>([]); // Tất cả tài liệu có thể gán
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingAllMaterials, setLoadingAllMaterials] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [searchTermMaterial, setSearchTermMaterial] = useState(""); // Search tài liệu
  const [selectedMaterialIdsToAdd, setSelectedMaterialIdsToAdd] = useState<
    Set<number>
  >(new Set());
  const [materialDeadlineInput, setMaterialDeadlineInput] =
    useState<string>(""); // Deadline cho tài liệu mới gán
  const [savingMaterialAssignment, setSavingMaterialAssignment] =
    useState(false); // Lưu assignment

  const [showMaterialEditModal, setShowMaterialEditModal] = useState(false);
  const [editingMaterialDetails, setEditingMaterialDetails] =
    useState<Material | null>(null);

  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [editingAssignmentForDeadline, setEditingAssignmentForDeadline] =
    useState<MaterialAssignment | null>(null);
  const [newDeadline, setNewDeadline] = useState<string>(""); // YYYY-MM-DDTHH:mm
  const [savingDeadline, setSavingDeadline] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const token = localStorage.getItem("token") || "";
  const API_URL = "https://85e7dd680e50.ngrok-free.app/fapanese/api";

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [gradeValue, setGradeValue] = useState<number | "">("");
  const [feedbackText, setFeedbackText] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

  const openGradeModal = (submission: any) => {
    setGradingSubmission(submission);
    setGradeValue(submission.score || "");
    setFeedbackText(submission.feedback || "");
    setShowGradeModal(true);
  };

  // --- Fetch Class Details ---
  const fetchClassDetails = useCallback(async () => {
    if (!classId) {
      setLoading(false);
      setNotifMessage("Lỗi: Không tìm thấy ID lớp học.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentClass(res.data.result || res.data);
    } catch (err) {
      console.error("❌ Lỗi tải thông tin lớp:", err);
      setNotifMessage("Không thể tải thông tin lớp học này.");
    } finally {
      // Loading stops after fetching students/materials based on tab
    }
  }, [classId, token]);

  // --- Fetch Students in Class ---
  const fetchStudentsInClass = useCallback(async () => {
    if (!classId) return;
    setLoadingStudents(true);
    // --- !!! CẦN API BACKEND: GET /api/classes/{classId}/students !!! ---
    try {
      const res = await axios.get(`${API_URL}/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming API returns List<Student> where Student has id, firstName, lastName, email
      const studentClassRecords = res.data.result || res.data || [];

      // Trích xuất object 'student' từ mỗi record
      const extractedStudents: Student[] = studentClassRecords
        .map((record: any) => record.student) // Lấy object student lồng nhau
        .filter(
          (student: any): student is Student =>
            student != null && student.id != null
        ); // Lọc ra những record không có student hoặc student.id

      console.log("Extracted Students:", extractedStudents); // Log để kiểm tra

      setStudentsInClass(extractedStudents);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setStudentsInClass([]); // 404 means no students yet
      } else {
        console.error("❌ Lỗi tải danh sách sinh viên trong lớp:", err);
        setNotifMessage("Không thể tải danh sách sinh viên của lớp.");
        setStudentsInClass([]);
      }
    } finally {
      setLoadingStudents(false);
      setLoading(false); // Stop main loading after initial tab data is fetched
    }
  }, [classId, token]);

  const handleSaveGrade = async () => {
    if (!gradingSubmission || gradeValue === "" || savingGrade) return;

    setSavingGrade(true);
    try {
      await axios.put(
        `${API_URL}/material-submissions/${gradingSubmission.id}/grade`,
        {
          score: gradeValue,
          feedback: feedbackText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifMessage("Đã lưu điểm và phản hồi thành công!");
      setShowGradeModal(false);
      setGradingSubmission(null);

      // Reload danh sách submissions để cập nhật điểm mới
      fetchSubmissionsForClass();
    } catch (err: any) {
      console.error("❌ Lỗi khi lưu điểm:", err);
      setNotifMessage(
        `❌ Không thể lưu điểm: ${
          err.response?.data?.message || err.message || "Lỗi không xác định"
        }`
      );
    } finally {
      setSavingGrade(false);
    }
  };

  // --- Fetch All Students (for Add Modal) ---
  const fetchAllStudents = useCallback(async () => {
    setLoadingAllStudents(true);
    // --- !!! CẦN API BACKEND: GET /api/students !!! ---
    try {
      const res = await axios.get(`${API_URL}/students`, {
        // Adjust endpoint if needed
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming API returns List<Student>
      setAllStudents(res.data.result || res.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách tất cả sinh viên:", err);
      setNotifMessage("Không thể tải danh sách sinh viên để thêm.");
      setAllStudents([]);
    } finally {
      setLoadingAllStudents(false);
    }
  }, [token]);

  // --- ✅ HÀM FETCH CHO TAB TÀI LIỆU ---

  // Lấy tài liệu ĐÃ GÁN cho lớp này
  const fetchMaterialsForClass = useCallback(async () => {
    if (!classId) return;
    setLoadingMaterials(true);
    setMaterialsInClass([]); // Xóa dữ liệu cũ
    // --- !!! CẦN API BACKEND: GET /api/classes/{classId}/materials !!! ---
    // API này cần trả về List<MaterialAssignment> (bao gồm Material details và deadline)
    try {
      const res = await axios.get(`${API_URL}/classes/${classId}/materials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const assignments: MaterialAssignment[] =
        res.data.result || res.data || [];
      console.log("Fetched Materials for Class:", assignments);
      setMaterialsInClass(assignments);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setMaterialsInClass([]); // 404 = chưa có tài liệu nào
      } else {
        console.error("❌ Lỗi tải tài liệu của lớp:", err);
        setNotifMessage("Không thể tải danh sách tài liệu đã gán.");
        setMaterialsInClass([]);
      }
    } finally {
      setLoadingMaterials(false);
      setLoading(false); // Dừng loading chính
    }
  }, [classId, token]);
  const fetchSubmissionsForClass = useCallback(async () => {
    if (!classId) return;
    setLoadingSubmissions(true);
    try {
      const res = await axios.get(
        `${API_URL}/material-submissions/class/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmissions(res.data.result || []);
    } catch (err) {
      console.error("❌ Lỗi tải bài nộp:", err);
      setNotifMessage("Không thể tải danh sách bài nộp.");
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
      setLoading(false);
    }
  }, [classId, token]);
  // Lấy TẤT CẢ tài liệu (để chọn trong modal)
  const fetchAllMaterials = useCallback(async () => {
    setLoadingAllMaterials(true);
    try {
      const res = await axios.get(`${API_URL}/materials`, {
        // Dùng lại API lấy tất cả materials
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllMaterials(res.data.result || res.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải tất cả tài liệu:", err);
      setNotifMessage("Không thể tải danh sách tài liệu để thêm.");
      setAllMaterials([]);
    } finally {
      setLoadingAllMaterials(false);
    }
  }, [token]);

  const handleEditMaterial = (material: Material) => {
    setEditingMaterialDetails(material);
    setShowMaterialEditModal(true);
  };

  const handleMaterialSaveSuccess = (updatedMaterial?: Material) => {
    setShowMaterialEditModal(false);
    setEditingMaterialDetails(null);
    setNotifMessage(
      updatedMaterial
        ? `Đã cập nhật tài liệu: ${updatedMaterial.title}`
        : "Thao tác thành công."
    );
    fetchMaterialsForClass(); // Refresh list in the current class detail page
  };

  const openDeadlineModal = (assignment: MaterialAssignment) => {
    setEditingAssignmentForDeadline(assignment);
    // Format deadline từ ISO string (nếu có) sang YYYY-MM-DDTHH:mm cho input
    const currentDeadline = assignment.deadline
      ? assignment.deadline.slice(0, 16)
      : "";
    setNewDeadline(currentDeadline);
    setSavingDeadline(false);
    setShowDeadlineModal(true);
  };

  // --- useEffect ---
  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  useEffect(() => {
    if (currentClass) {
      setLoading(true); // Start loading when tab changes or class loads
      if (activeTab === "students") {
        fetchStudentsInClass().finally(() => setLoading(false));
      } else if (activeTab === "materials") {
        fetchMaterialsForClass().finally(() => setLoading(false)); // Gọi hàm fetch materials
      } else if (activeTab === "submissions") {
        fetchSubmissionsForClass().finally(() => setLoading(false));
        setLoading(false); // Tạm thời
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false); // Stop loading if no class info
    }
  }, [
    activeTab,
    currentClass,
    fetchStudentsInClass,
    fetchMaterialsForClass,
    fetchSubmissionsForClass,
  ]); // Thêm fetchMaterialsForClass

  // Initial data fetch
  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  // Fetch data based on active tab
  useEffect(() => {
    if (currentClass) {
      // Only fetch tab data after class info is loaded
      if (activeTab === "students") {
        fetchStudentsInClass();
      } else if (activeTab === "materials") {
        // TODO: Call fetchMaterialsForClass() later
        console.log("Fetching materials...");
        setLoading(false); // Temporary
      } else if (activeTab === "submissions") {
        // TODO: Call fetchSubmissionsForClass() later
        console.log("Fetching submissions...");
        setLoading(false); // Temporary
      }
    }
  }, [
    activeTab,
    currentClass,
    fetchStudentsInClass /*, fetchMaterialsForClass, fetchSubmissionsForClass */,
  ]);

  // --- Student Management Handlers ---
  const openAddStudentModal = () => {
    setSelectedStudentIdsToAdd(new Set());
    setSearchTerm("");
    fetchAllStudents(); // Fetch all students when modal opens
    setShowAddStudentModal(true);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIdsToAdd((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(studentId)) {
        newSet.delete(studentId); // Nếu đã có -> Xóa (Bỏ chọn)
      } else {
        newSet.add(studentId); // Nếu chưa có -> Thêm (Chọn)
      }
      return newSet;
    });
  };

  const closeAddStudentModal = () => {
    setShowAddStudentModal(false);
    setAllStudents([]); // Clear list to save memory
  };

  const handleAddStudent = async () => {
    if (!classId || selectedStudentIdsToAdd.size === 0) {
      setNotifMessage("Lỗi: Vui lòng chọn ít nhất một sinh viên để thêm.");
      return;
    }
    setAddingStudent(true);
    setNotifMessage(`Đang thêm ${selectedStudentIdsToAdd.size} sinh viên...`);

    const addPromises = []; // Mảng chứa các promises

    // --- ✅ SỬA LẠI LOGIC LẶP VÀ TẠO PROMISE ---
    // Lặp qua từng studentId trong Set
    for (const studentId of selectedStudentIdsToAdd) {
      console.log(`Preparing promise to add studentId: ${studentId}`); // Log ID đang xử lý
      // Tạo một promise cho mỗi API call và thêm vào mảng
      addPromises.push(
        axios.post(`${API_URL}/classes/${classId}/students`, null, {
          headers: { Authorization: `Bearer ${token}` },
          // Đảm bảo params chứa ID của vòng lặp hiện tại
          params: { studentId: studentId },
        })
      );
    }
    // --- KẾT THÚC SỬA ---

    try {
      // Thực thi tất cả các promise đã tạo
      const results = await Promise.allSettled(addPromises);
      let successCount = 0;
      let failCount = 0;
      const failedIds: string[] = []; // Lưu ID bị lỗi

      // Xử lý kết quả từng promise
      results.forEach((result, index) => {
        const studentId = Array.from(selectedStudentIdsToAdd)[index]; // Lấy ID tương ứng
        if (result.status === "fulfilled") {
          successCount++;
          console.log(`Successfully added studentId: ${studentId}`);
        } else {
          failCount++;
          failedIds.push(studentId); // Thêm ID lỗi vào danh sách
          console.error(
            `❌ Failed to add studentId ${studentId}:`,
            result.reason?.response?.data ||
              result.reason?.message ||
              result.reason
          );
        }
      });

      // Tạo thông báo kết quả
      let message = `Hoàn tất. Thêm thành công: ${successCount}. Thất bại: ${failCount}.`;
      if (failCount > 0) {
        message += `\nCác ID bị lỗi: ${failedIds.join(
          ", "
        )}. Kiểm tra console log để biết chi tiết.`;
      }
      setNotifMessage(message);

      closeAddStudentModal();
      fetchStudentsInClass(); // Tải lại danh sách sinh viên trong lớp
    } catch (err) {
      // Lỗi ngoài dự kiến (ít xảy ra với allSettled)
      console.error("❌ Lỗi không xác định khi thêm nhiều sinh viên:", err);
      setNotifMessage(
        "❌ Đã xảy ra lỗi không mong muốn khi thực hiện thêm hàng loạt."
      );
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (
    studentId: string,
    studentName: string
  ) => {
    if (
      !classId ||
      !window.confirm(
        `Bạn chắc chắn muốn XÓA sinh viên "${studentName}" khỏi lớp này?`
      )
    )
      return;
    setNotifMessage(null);
    // --- !!! CẦN API BACKEND: DELETE /api/classes/{classId}/students?studentId={studentId} !!! ---
    try {
      // Simulate loading state if needed by setting state before API call
      await axios.delete(`${API_URL}/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { studentId: studentId }, // Send studentId as query param
      });
      setNotifMessage(`Xóa sinh viên ${studentName} khỏi lớp thành công!`);
      fetchStudentsInClass(); // Refresh student list
    } catch (err: any) {
      console.error("❌ Lỗi khi xóa sinh viên:", err);
      setNotifMessage(
        `❌ Không thể xóa sinh viên: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // --- Filter available students for Add Modal ---
  const availableStudentsToAdd = useMemo(() => {
    const studentIdsInClass = new Set(studentsInClass.map((s) => s.id));
    return allStudents
      .filter((s) => !studentIdsInClass.has(s.id)) // Exclude students already in class
      .filter((s) => {
        // Filter by search term
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return (
          s.id.toLowerCase().includes(lowerSearch) ||
          s.firstName.toLowerCase().includes(lowerSearch) ||
          s.lastName.toLowerCase().includes(lowerSearch) ||
          s.email.toLowerCase().includes(lowerSearch)
        );
      });
  }, [allStudents, studentsInClass, searchTerm]);

  // --- ✅ HÀM QUẢN LÝ TÀI LIỆU ---

  const openAddMaterialModal = () => {
    setSelectedMaterialIdsToAdd(new Set());
    setSearchTermMaterial("");
    setMaterialDeadlineInput("");
    fetchAllMaterials(); // Tải tất cả tài liệu khi mở modal
    setShowAddMaterialModal(true);
  };

  const closeAddMaterialModal = () => {
    setShowAddMaterialModal(false);
    setAllMaterials([]); // Xóa để tiết kiệm bộ nhớ
  };

  const toggleMaterialSelection = (materialId: number) => {
    setSelectedMaterialIdsToAdd((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(materialId)) {
        newSet.delete(materialId);
      } else {
        newSet.add(materialId);
      }
      return newSet;
    });
  };

  const handleAddMaterials = async () => {
    if (!classId || selectedMaterialIdsToAdd.size === 0) {
      setNotifMessage("Lỗi: Vui lòng chọn ít nhất một tài liệu để gán.");
      return;
    }
    setSavingMaterialAssignment(true);
    setNotifMessage(`Đang gán ${selectedMaterialIdsToAdd.size} tài liệu...`);

    const addPromises = [];
    const deadlineParam = materialDeadlineInput
      ? new Date(materialDeadlineInput).toISOString()
      : undefined;

    for (const materialId of selectedMaterialIdsToAdd) {
      addPromises.push(
        axios.post(`${API_URL}/materials/${materialId}/assign`, null, {
          headers: { Authorization: `Bearer ${token}` },
          params: { classCourseId: classId, deadline: deadlineParam },
        })
      );
    }

    try {
      const results = await Promise.allSettled(addPromises);
      let successCount = 0;
      let failCount = 0;
      const failedIds: number[] = [];
      results.forEach((result, index) => {
        const materialId = Array.from(selectedMaterialIdsToAdd)[index];
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          failCount++;
          failedIds.push(materialId);
          console.error(
            `❌ Lỗi gán material ID ${materialId}:`,
            result.reason?.response?.data ||
              result.reason?.message ||
              result.reason
          );
        }
      });
      let message = `Hoàn tất. Gán thành công: ${successCount}. Thất bại: ${failCount}.`;
      if (failCount > 0) message += `\nCác ID lỗi: ${failedIds.join(", ")}.`;
      setNotifMessage(message);
      closeAddMaterialModal();
      fetchMaterialsForClass(); // Tải lại danh sách tài liệu đã gán
    } catch (err) {
      console.error("❌ Lỗi không xác định khi gán nhiều tài liệu:", err);
      setNotifMessage("❌ Lỗi không mong muốn khi gán.");
    } finally {
      setSavingMaterialAssignment(false);
    }
  };

  const handleUnassignMaterial = async (
    materialId: number,
    materialTitle: string
  ) => {
    if (
      !classId ||
      !window.confirm(
        `Bạn chắc chắn muốn GỠ GÁN tài liệu "${materialTitle}" khỏi lớp này?`
      )
    )
      return;
    setNotifMessage(null);
    // --- !!! CẦN API BACKEND: DELETE /api/materials/{materialId}/assign?classCourseId={classId} !!! ---
    try {
      // Simulate loading state if needed
      setSavingMaterialAssignment(true); // Reuse saving state
      await axios.delete(`${API_URL}/materials/${materialId}/assign`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { classCourseId: classId }, // Gửi classId
      });
      setNotifMessage(`Gỡ gán tài liệu "${materialTitle}" thành công!`);
      fetchMaterialsForClass(); // Tải lại danh sách
    } catch (err: any) {
      console.error("❌ Lỗi khi gỡ gán tài liệu:", err);
      setNotifMessage(
        `❌ Không thể gỡ gán: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setSavingMaterialAssignment(false);
    }
  };

  // Lọc tài liệu có sẵn để thêm (chưa có trong lớp)
  const availableMaterialsToAdd = useMemo(() => {
    const materialIdsInClass = new Set(
      materialsInClass.map((m) => m.material.id)
    );
    return allMaterials
      .filter((m) => !materialIdsInClass.has(m.id)) // Bỏ qua tài liệu đã có trong lớp
      .filter((m) => {
        // Lọc theo search term
        if (!searchTermMaterial) return true;
        const lowerSearch = searchTermMaterial.toLowerCase();
        return (
          m.id.toString().includes(lowerSearch) ||
          m.title.toLowerCase().includes(lowerSearch) ||
          m.type.toLowerCase().includes(lowerSearch) ||
          (m.description && m.description.toLowerCase().includes(lowerSearch))
        );
      });
  }, [allMaterials, materialsInClass, searchTermMaterial]);

  // --- Helper Functions (Giữ nguyên) ---
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  }; // Added time
  const formatFileSize = (bytes?: number | null): string => {
    if (bytes === null || bytes === undefined || bytes === 0) return "-";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
      " " +
      ["Bytes", "KB", "MB", "GB", "TB"][i]
    );
  };

  const handleUpdateDeadline = async () => {
    if (!editingAssignmentForDeadline || !classId) return;
    setSavingDeadline(true);
    setNotifMessage(null);

    const materialId = editingAssignmentForDeadline.material.id;
    // Chuyển đổi deadline thành ISO string hoặc null
    const deadlineToSend = newDeadline
      ? new Date(newDeadline).toISOString()
      : null;

    // --- !!! CẦN API BACKEND: PUT /api/materials/{materialId}/assign?classCourseId={classId} !!! ---
    try {
      await axios.put(
        `${API_URL}/materials/${materialId}/assign`,
        { deadline: deadlineToSend }, // Gửi deadline trong body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: { classCourseId: classId }, // classId trong params
        }
      );
      setNotifMessage("Cập nhật deadline thành công!");
      setShowDeadlineModal(false);
      fetchMaterialsForClass(); // Refresh list
    } catch (err: any) {
      console.error("❌ Lỗi cập nhật deadline:", err);
      setNotifMessage(
        `❌ Không thể cập nhật deadline: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setSavingDeadline(false);
    }
  };

  const renderSubmissionsTab = () => {
    if (loadingSubmissions)
      return (
        <div className="flex justify-center p-10">
          <CircularProgress />
        </div>
      );
    if (submissions.length === 0)
      return (
        <p className="text-center italic text-gray-500 mt-6">
          Chưa có bài nộp nào.
        </p>
      );

    return (
      <motion.div initial="hidden" animate="show" variants={fadeIn}>
        <table
          className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow"
          style={{ boxShadow: neumorphicShadow }}
        >
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sinh viên
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tài liệu
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nộp lúc
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Điểm
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {submissions.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{s.studentName}</td>
                <td className="px-4 py-3 text-sm">
                  <a
                    href={s.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-700 hover:underline"
                  >
                    {s.materialTitle}
                  </a>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(s.submittedAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 font-semibold">
                  {s.score ?? "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => openGradeModal(s)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Chấm điểm
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    );
  };

  // --- Render Functions ---
  const renderStudentsTab = () => {
    if (loadingStudents)
      return (
        <div className="flex justify-center p-10">
          <CircularProgress />
        </div>
      );
    return (
      <motion.div initial="hidden" animate="show" variants={fadeIn}>
        <div className="flex justify-end mb-4">
          <button
            onClick={openAddStudentModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow text-sm font-semibold"
          >
            {" "}
            <AiOutlineUsergroupAdd /> Thêm Sinh viên{" "}
          </button>
        </div>
        {studentsInClass.length === 0 ? (
          <p className="text-center italic text-gray-500 mt-6">
            Chưa có sinh viên nào trong lớp.
          </p>
        ) : (
          <div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            style={{ boxShadow: neumorphicShadow }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID Sinh viên
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Họ Tên
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentsInClass.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.lastName} {student.firstName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <button
                        onClick={() =>
                          handleRemoveStudent(
                            student.id,
                            `${student.lastName} ${student.firstName}`
                          )
                        }
                        className="text-red-600 hover:text-red-900"
                        title="Xóa khỏi lớp"
                      >
                        {" "}
                        <AiOutlineDelete className="h-5 w-5 inline" />{" "}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    );
  };

  // --- ✅ RENDER MATERIALS TAB ---
  const renderMaterialsTab = () => {
    if (loadingMaterials)
      return (
        <div className="flex justify-center p-10">
          <CircularProgress />
        </div>
      );
    return (
      <motion.div initial="hidden" animate="show" variants={fadeIn}>
        <div className="flex justify-end mb-4">
          <button
            onClick={openAddMaterialModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow text-sm font-semibold"
          >
            {" "}
            <AiOutlinePlus /> Thêm/Gán Tài liệu{" "}
          </button>
        </div>
        {materialsInClass.length === 0 ? (
          <p className="text-center italic text-gray-500 mt-6">
            Chưa có tài liệu nào được gán cho lớp này.
          </p>
        ) : (
          <div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            style={{ boxShadow: neumorphicShadow }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tài liệu
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Loại
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Deadline
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materialsInClass.map((assignment) => {
                  const mat = assignment.material; // Lấy object material lồng nhau
                  if (!mat) return null; // Bỏ qua nếu không có material data
                  return (
                    <tr key={mat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-cyan-700 flex items-center gap-1.5"
                          title={mat.description || mat.title}
                        >
                          <AiOutlinePaperClip className="flex-shrink-0" />
                          <span className="truncate">{mat.title}</span>
                        </a>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatFileSize(mat.fileSize)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            mat.type === "RESOURCE"
                              ? "bg-blue-100 text-blue-800"
                              : mat.type === "ASSIGNMENT"
                              ? "bg-yellow-100 text-yellow-800"
                              : mat.type === "EXERCISE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {mat.type}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-4 whitespace-nowrap text-sm ${
                          assignment.deadline
                            ? "text-orange-700 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {assignment.deadline
                          ? formatDate(assignment.deadline)
                          : "Không có"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          onClick={() => handleEditMaterial(mat)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2" // Added margin
                          title="Sửa chi tiết tài liệu"
                        >
                          <AiOutlineEdit className="h-5 w-5 inline" />
                        </button>

                        <button
                          onClick={() => openDeadlineModal(assignment)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                          title="Chỉnh sửa deadline"
                        >
                          <AiOutlineCalendar className="inline ml-1 h-4 w-4 opacity-70" />
                        </button>

                        <button
                          onClick={() =>
                            handleUnassignMaterial(mat.id, mat.title)
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Gỡ gán khỏi lớp"
                        >
                          {" "}
                          <AiOutlineDelete className="h-5 w-5 inline" />{" "}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    );
  };

  // --- Main Render ---
  if (loading && !currentClass) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress /> Đang tải thông tin lớp học...
      </div>
    );
  }
  if (!currentClass) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Lỗi: Không thể tải thông tin lớp học.
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header & Back Button */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to={`/teacher/classes`}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
          >
            {" "}
            <IoMdArrowBack className="h-6 w-6" />{" "}
            <span className="text-lg font-medium">Quản lý Lớp học</span>{" "}
          </Link>
          {/* Optional: Add Edit button for class details here? */}
        </div>

        {/* Class Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {currentClass.className}
        </h1>
        <p className="text-md text-gray-600 mb-8">
          Học kỳ: {currentClass.semester} - Khóa học:{" "}
          {currentClass.course?.courseName || `ID ${currentClass.course?.id}`}{" "}
          {currentClass.course?.code ? `(${currentClass.course.code})` : ""}
        </p>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-300 flex space-x-1">
          {(
            [
              {
                key: "students",
                label: "Sinh viên",
                icon: AiOutlineUsergroupAdd,
              },
              {
                key: "materials",
                label: "Tài liệu",
                icon: AiOutlineFolderOpen,
              },
              {
                key: "submissions",
                label: "Bài nộp",
                icon: AiOutlineCheckSquare,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.key
                  ? "border-cyan-600 text-cyan-700"
                  : "border-transparent text-gray-500 hover:border-gray-400 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "students" && renderStudentsTab()}
          {activeTab === "materials" && renderMaterialsTab()}
          {activeTab === "submissions" && renderSubmissionsTab()}
        </div>
      </div>

      {/* --- Modal Thêm Sinh viên --- */}
      <AnimatePresence>
        {showAddStudentModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[52] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAddStudentModal}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex-shrink-0">
                Thêm Sinh viên vào lớp "{currentClass.className}"
              </h3>

              {/* Search Input */}
              <div className="mb-4 relative flex-shrink-0">
                <input
                  type="text"
                  placeholder="Tìm sinh viên theo ID, tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border p-3 pl-10 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 bg-gray-50"
                  style={{ boxShadow: insetShadow }}
                />
                <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Student List */}
              <div className="flex-grow overflow-y-auto border rounded mb-4 bg-gray-50">
                {loadingAllStudents ? (
                  <div className="flex justify-center p-6">
                    <CircularProgress size={30} />
                  </div>
                ) : availableStudentsToAdd.length === 0 ? (
                  <p className="p-6 text-center text-gray-500 italic">
                    Không tìm thấy sinh viên phù hợp hoặc tất cả đã ở trong lớp.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {availableStudentsToAdd.map((student) => (
                      <li key={student.id}>
                        {" "}
                        {/* Giữ li làm container */}
                        <label // Dùng label để click được cả dòng
                          // Bỏ onClick ở đây nếu muốn chỉ click checkbox
                          // onClick={() => toggleStudentSelection(student.id)} // Có thể bỏ nếu dùng onChange của input
                          className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-cyan-100 text-sm ${
                            selectedStudentIdsToAdd.has(student.id)
                              ? "bg-cyan-200 font-semibold"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudentIdsToAdd.has(student.id)}
                            onChange={() => toggleStudentSelection(student.id)} // Xử lý khi checkbox thay đổi
                            className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 flex-shrink-0"
                            // Ngăn chặn sự kiện click lan ra label nếu không muốn click cả dòng
                            onClick={(e) => e.stopPropagation()}
                          />
                          {/* Thông tin sinh viên */}
                          <span className="flex-grow">
                            {student.lastName} {student.firstName} (
                            {student.email})
                          </span>
                          {/* Checkmark có thể không cần nữa vì đã có checkbox */}
                          {/* {selectedStudentIdsToAdd.has(student.id) && <AiOutlineCheckCircle className="text-green-600 h-5 w-5 flex-shrink-0"/>} */}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-auto border-t pt-4 flex-shrink-0">
                <button
                  onClick={closeAddStudentModal}
                  className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddStudent}
                  // Disable nếu đang thêm HOẶC không có sinh viên nào được chọn
                  disabled={addingStudent || selectedStudentIdsToAdd.size === 0}
                  className={`px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 ${
                    addingStudent || selectedStudentIdsToAdd.size === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {addingStudent ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AiOutlinePlusCircle />
                  )}
                  {/* Hiển thị số lượng nếu đang không loading */}
                  {addingStudent
                    ? "Đang thêm..."
                    : `Thêm (${selectedStudentIdsToAdd.size}) Sinh viên`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ✅ MODAL THÊM/GÁN TÀI LIỆU --- */}
      <AnimatePresence>
        {showAddMaterialModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[52] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAddMaterialModal}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex-shrink-0">
                Thêm/Gán Tài liệu cho lớp "{currentClass?.className}"
              </h3>

              {/* Search Input */}
              <div className="mb-4 relative flex-shrink-0">
                <input
                  type="text"
                  placeholder="Tìm tài liệu theo ID, tên, loại..."
                  value={searchTermMaterial}
                  onChange={(e) => setSearchTermMaterial(e.target.value)}
                  className="w-full border p-3 pl-10 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 bg-gray-50"
                  style={{ boxShadow: insetShadow }}
                />
                <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Material List */}
              <div className="flex-grow overflow-y-auto border rounded mb-4 bg-gray-50">
                {loadingAllMaterials ? (
                  <div className="flex justify-center p-6">
                    <CircularProgress size={30} />
                  </div>
                ) : availableMaterialsToAdd.length === 0 ? (
                  <p className="p-6 text-center text-gray-500 italic">
                    Không tìm thấy tài liệu phù hợp hoặc tất cả đã được gán.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {availableMaterialsToAdd.map((mat) => (
                      <li key={mat.id}>
                        <label
                          className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-cyan-100 text-sm ${
                            selectedMaterialIdsToAdd.has(mat.id)
                              ? "bg-cyan-200"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMaterialIdsToAdd.has(mat.id)}
                            onChange={() => toggleMaterialSelection(mat.id)}
                            className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-grow">
                            <span
                              className={`font-medium ${
                                selectedMaterialIdsToAdd.has(mat.id)
                                  ? "text-gray-900"
                                  : "text-gray-800"
                              }`}
                            >
                              {mat.title}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({mat.type})
                            </span>
                            <div
                              className="text-xs text-gray-500 truncate"
                              title={mat.description || ""}
                            >
                              {mat.description || "Không có mô tả"}
                            </div>
                          </div>
                          <a
                            href={mat.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800 flex-shrink-0 ml-2"
                            title={mat.fileUrl}
                          >
                            {" "}
                            <AiOutlinePaperClip />{" "}
                          </a>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Deadline Input */}
              <div className="mb-4 flex-shrink-0">
                <label
                  htmlFor="materialDeadline"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deadline (Tùy chọn)
                </label>
                <input
                  id="materialDeadline"
                  type="datetime-local"
                  value={materialDeadlineInput}
                  onChange={(e) => setMaterialDeadlineInput(e.target.value)}
                  className="w-full border p-2 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                  style={{ boxShadow: insetShadow }}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-auto border-t pt-4 flex-shrink-0">
                <button
                  onClick={closeAddMaterialModal}
                  className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddMaterials}
                  disabled={
                    savingMaterialAssignment ||
                    selectedMaterialIdsToAdd.size === 0
                  }
                  className={`px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 ${
                    savingMaterialAssignment ||
                    selectedMaterialIdsToAdd.size === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {savingMaterialAssignment ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AiOutlineUsergroupAdd />
                  )}
                  {savingMaterialAssignment
                    ? "Đang gán..."
                    : `Gán (${selectedMaterialIdsToAdd.size}) Tài liệu`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ✅ THÊM MODAL SỬA MATERIAL --- */}
      <MaterialEditModal
        isOpen={showMaterialEditModal}
        onClose={() => {
          setShowMaterialEditModal(false);
          setEditingMaterialDetails(null);
        }}
        initialData={editingMaterialDetails}
        lecturerId={currentClass?.lecturer?.id || null} // Pass lecturer ID from class details
        onSaveSuccess={handleMaterialSaveSuccess}
      />

      <AnimatePresence>
        {showDeadlineModal && editingAssignmentForDeadline && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[53] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeadlineModal(false)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Chỉnh sửa Deadline
              </h3>
              <p className="text-sm text-gray-600 mb-4 border-b pb-2">
                Cho: "{editingAssignmentForDeadline.material.title}"
              </p>

              <div className="mb-4">
                <label
                  htmlFor="editDeadline"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deadline mới
                </label>
                <input
                  id="editDeadline"
                  type="datetime-local"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full border p-2 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                  style={{ boxShadow: insetShadow }}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <button
                  onClick={() => setNewDeadline("")} // Nút xóa deadline
                  className="text-xs text-red-600 hover:underline mt-1 focus:outline-none"
                  title="Xóa deadline"
                >
                  Xóa deadline (để trống)
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button
                  onClick={() => setShowDeadlineModal(false)}
                  className="px-4 py-2 text-sm rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateDeadline}
                  disabled={savingDeadline}
                  className={`px-4 py-2 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 ${
                    savingDeadline ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {savingDeadline ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AiOutlineSave />
                  )}
                  {savingDeadline ? "Đang lưu..." : "Lưu Deadline"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modal chấm điểm --- */}
      <AnimatePresence>
        {showGradeModal && gradingSubmission && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[53] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGradeModal(false)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Chấm điểm - {gradingSubmission.studentName}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Điểm
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(Number(e.target.value))}
                    className="w-full border p-2 rounded-md mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Feedback
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={3}
                    className="w-full border p-2 rounded-md mt-1 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowGradeModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveGrade}
                  disabled={savingGrade}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                >
                  {savingGrade ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      {notifMessage && (
        <NotificationModal
          message={notifMessage}
          onClose={() => setNotifMessage(null)}
        />
      )}
    </div>
  );
};

export default TeacherClassDetailPage;
