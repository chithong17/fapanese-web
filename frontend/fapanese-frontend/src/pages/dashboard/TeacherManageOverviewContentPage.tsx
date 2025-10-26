import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineArrowLeft,
  AiOutlineQuestionCircle,
  AiOutlineCopy, // Icon cho duplicate
} from "react-icons/ai";
import { IoMdArrowBack } from "react-icons/io";
import { BiBookContent, BiDuplicate } from "react-icons/bi"; // Icon khác cho duplicate
import axios from "axios";
import NotificationModal from "../../components/NotificationModal";

// --- Định nghĩa Interface ---
// (Giữ nguyên các interface đã định nghĩa ở code trước)
interface OverviewPart {
  id: number;
  title: string;
  type: "SPEAKING" | "MIDDLE_EXAM" | "FINAL_EXAM" | string;
  overviewId: number;
}
interface SpeakingQuestion { /* ... */ }
interface SpeakingItem { /* ... */ }
interface SpeakingExam { /* ... */ }
interface ExamQuestion { /* ... */ }
interface Exam { /* ... */ }


// --- Cấu hình style ---
const mainBg = "#e8ebf0";
const neumorphicShadow = "10px 10px 20px #c6c9cc, -5px -5px 20px #ffffff";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- Component Chính ---
const TeacherManageOverviewContentPage: React.FC = () => {
  const { courseCode, overviewId, partId } = useParams();
  const navigate = useNavigate();

  const [currentPart, setCurrentPart] = useState<OverviewPart | null>(null);
  const [contentList, setContentList] = useState<any[]>([]); // Danh sách Exam/SpeakingExam cho Tabs
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [activeItemDetails, setActiveItemDetails] = useState<any[]>([]); // speakings[] hoặc questions[]
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  // --- State cho Modal quản lý TAB (Exam/SpeakingExam) ---
  const [showTabModal, setShowTabModal] = useState(false);
  const [editingTabItem, setEditingTabItem] = useState<any | null>(null);
  const [tabFormData, setTabFormData] = useState<any>({}); // Form data động cho Exam/SpeakingExam

  // --- State cho Modal quản lý SpeakingItem (chi tiết trong tab Speaking) ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingDetailItem, setEditingDetailItem] = useState<SpeakingItem | null>(null);
  const [detailFormData, setDetailFormData] = useState<Partial<SpeakingItem>>({}); // Form data cho SpeakingItem

  const token = localStorage.getItem("token") || "";
  const API_URL = "http://localhost:8080/fapanese/api";

  // --- Step 1: Lấy thông tin của Part (để biết type) ---
  const fetchPartInfo = async () => {
    // ... (Giữ nguyên hàm fetchPartInfo)
     if (!partId) return;
    try {
      setLoading(true);
      setActiveTabId(null);
      setContentList([]);
      setActiveItemDetails([]);
      const res = await axios.get(`${API_URL}/overview-parts/${partId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const partData = res.data.result || res.data;
      setCurrentPart(partData);
      fetchContentList(partData.type);
    } catch (err) {
      console.error("❌ Lỗi tải thông tin part:", err);
      setNotifMessage("Không thể tải thông tin mục này.");
      setLoading(false);
    }
  };

  // --- Step 2: Lấy danh sách nội dung (Exam/SpeakingExam cho Tabs) ---
  const fetchContentList = async (partType: string) => {
    // ... (Giữ nguyên hàm fetchContentList)
      let url = "";
    switch (partType) {
      case "SPEAKING":
        url = `${API_URL}/speaking-exams/by-overview-part/${partId}`;
        break;
      case "MIDDLE_EXAM":
        url = `${API_URL}/middle-exams/by-overview-part/${partId}`;
        break;
      case "FINAL_EXAM":
        url = `${API_URL}/final-exams/by-overview-part/${partId}`;
        break;
      default:
        setLoading(false);
        return;
    }

    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data.result || res.data || [];
      setContentList(list);
      if (list.length > 0 && activeTabId === null) { // Chỉ set active tab nếu chưa có
        setActiveTabId(list[0].id);
      } else if (list.length === 0) {
         setActiveTabId(null); // Nếu list rỗng thì reset tab
         setActiveItemDetails([]);
         setLoading(false);
      } else if (activeTabId && !list.some((item: any) => item.id === activeTabId)) {
         // Nếu tab đang active bị xóa, chọn tab đầu tiên
         setActiveTabId(list[0]?.id || null);
      }
       else if (activeTabId) {
         // Nếu tab active vẫn còn, fetch lại detail (trường hợp sửa tab title)
         fetchDetails(activeTabId);
      }
       else {
         setLoading(false); // Trường hợp khác
      }
    } catch (err) {
      console.error(`❌ Lỗi tải danh sách ${partType}:`, err);
      setNotifMessage("Không thể tải danh sách nội dung.");
      setLoading(false);
    }
  };

  // --- Step 3: Lấy chi tiết của Item được chọn (khi click Tab) ---
  const fetchDetails = async (itemId: number) => {
     // ... (Giữ nguyên hàm fetchDetails)
       if (!currentPart) return;
    setLoadingDetails(true);
    setActiveItemDetails([]);

    let url = "";
    switch (currentPart.type) {
      case "SPEAKING":
        url = `${API_URL}/speaking-exams/${itemId}`;
        break;
      case "MIDDLE_EXAM":
        url = `${API_URL}/middle-exams/${itemId}`;
        break;
      case "FINAL_EXAM":
        url = `${API_URL}/final-exams/${itemId}`;
        break;
      default:
        setLoadingDetails(false);
        setLoading(false);
        return;
    }

    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const itemData = res.data.result || res.data;
      if (currentPart.type === "SPEAKING") {
        setActiveItemDetails(itemData.speakings || []);
      } else {
        setActiveItemDetails(itemData.questions || []);
      }
    } catch (err) {
      console.error(`❌ Lỗi tải chi tiết item ${itemId}:`, err);
      setNotifMessage("Không thể tải chi tiết nội dung.");
    } finally {
      setLoadingDetails(false);
      setLoading(false);
    }
  };

  // Chạy khi component mount
  useEffect(() => {
    fetchPartInfo();
  }, [partId]);

  // Trigger fetch Details khi activeTabId thay đổi (và khác null)
  useEffect(() => {
    if (activeTabId !== null) {
      fetchDetails(activeTabId);
    } else {
      // Nếu không có tab nào active (vd: list rỗng), dừng loading
       setActiveItemDetails([]);
       setLoading(false);
       setLoadingDetails(false);
    }
  }, [activeTabId]);


  // --- Mở Modal quản lý TAB (Thêm/Sửa Exam/SpeakingExam) ---
  const openTabModal = (item?: any) => {
    setEditingTabItem(item || null);
    // Khởi tạo form dựa trên type của part
    switch (currentPart?.type) {
      case "SPEAKING":
        setTabFormData({
          title: item?.title || "",
          type: item?.type || "PASSAGE", // Loại mặc định của SpeakingExam (PASSAGE, PICTURE, QUESTION)
        });
        break;
      case "MIDDLE_EXAM":
      case "FINAL_EXAM":
        setTabFormData({
          examTitle: item?.examTitle || "",
          semester: item?.semester || "HK1",
          type: item?.type || "FE", // Loại của kỳ thi (FE, ME, RE...)
          year: item?.year || new Date().getFullYear(),
          // Chuyển mảng questions (nếu có) thành chuỗi ID "1, 2, 3"
          questionIds:
            item?.questions?.map((q: any) => q.id).join(", ") || "",
        });
        break;
    }
    setShowTabModal(true);
  };

   // --- Xử lý thay đổi Form TAB ---
  const handleTabFormChange = (key: string, value: string | number) => {
    setTabFormData((prev: any) => ({ ...prev, [key]: value }));
  };


  // --- Xử lý Lưu TAB (Thêm/Sửa Exam/SpeakingExam) ---
  const handleSaveTab = async () => {
    // ... (Giữ nguyên hàm handleSave đã đổi tên thành handleSaveTab)
        if (!currentPart) return;

    let payload: any;
    let url = "";
    let method: "post" | "put" = "post";

    try {
      // Build payload và URL dựa trên loại part
      switch (currentPart.type) {
        case "SPEAKING":
          payload = {
            overviewPartId: Number(partId),
            title: tabFormData.title,
            type: tabFormData.type, // 'PASSAGE', 'PICTURE', 'QUESTION'
          };
          url = editingTabItem
            ? `${API_URL}/speaking-exams/${editingTabItem.id}`
            : `${API_URL}/speaking-exams`;
          method = editingTabItem ? "put" : "post";
          break;

        case "MIDDLE_EXAM":
        case "FINAL_EXAM":
          payload = {
            overviewPartId: Number(partId),
            examTitle: tabFormData.examTitle,
            semester: tabFormData.semester,
            type: tabFormData.type,
            year: Number(tabFormData.year),
            // Chuyển chuỗi "1, 2, 3" thành mảng số [1, 2, 3]
            questionIds: tabFormData.questionIds
              .split(",")
              .map((s: string) => Number(s.trim()))
              .filter((n: number | '') => typeof n === 'number' && !isNaN(n) && n > 0), // Lọc kỹ hơn
          };

          if (currentPart.type === "MIDDLE_EXAM") {
            url = editingTabItem
              ? `${API_URL}/middle-exams/${editingTabItem.id}`
              : `${API_URL}/middle-exams`;
          } else {
            url = editingTabItem
              ? `${API_URL}/final-exams/${editingTabItem.id}`
              : `${API_URL}/final-exams`;
          }
          method = editingTabItem ? "put" : "post";
          break;

        default:
          throw new Error("Loại part không xác định");
      }

      // Gọi API
      await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifMessage("Lưu thành công!");
      setShowTabModal(false);
      fetchContentList(currentPart.type); // Tải lại danh sách tabs
    } catch (err) {
      console.error("❌ Lỗi khi lưu tab:", err);
      setNotifMessage("❌ Không thể lưu.");
    }
  };

  // --- Xử lý Xóa TAB (Exam/SpeakingExam) ---
  const handleDeleteTab = async (item: any) => {
    // ... (Giữ nguyên hàm handleDelete đã đổi tên thành handleDeleteTab)
      if (!currentPart || !item) return;
    if (!window.confirm(`Bạn chắc chắn muốn xóa "${item.title || item.examTitle}"?`)) return;

    let url = "";
    switch (currentPart.type) {
      case "SPEAKING":
        url = `${API_URL}/speaking-exams/${item.id}`;
        break;
      case "MIDDLE_EXAM":
        url = `${API_URL}/middle-exams/${item.id}`;
        break;
      case "FINAL_EXAM":
        url = `${API_URL}/final-exams/${item.id}`;
        break;
      default:
        return;
    }

    try {
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifMessage("Xóa thành công!");
       // Nếu tab bị xóa là tab đang active, reset activeTabId
       if (item.id === activeTabId) {
          setActiveTabId(null);
       }
      fetchContentList(currentPart.type); // Tải lại danh sách tabs
    } catch (err) {
      console.error("❌ Lỗi khi xóa tab:", err);
      setNotifMessage("❌ Không thể xóa!");
    }
  };


  // --- Mở Modal quản lý SpeakingItem ---
  const openDetailModal = (item?: SpeakingItem) => {
    // ... (Đổi tên openModal thành openDetailModal)
      setEditingDetailItem(item || null);
    setDetailFormData(
      item
        ? { // Copy các trường cần thiết để sửa
            id: item.id,
            topic: item.topic,
            speakingType: item.speakingType,
            passage: item.passage,
            passageRomaji: item.passageRomaji,
            passageMeaning: item.passageMeaning,
            description: item.description,
            imgUrl: item.imgUrl,
          }
        : { // Giá trị mặc định khi thêm mới
            topic: "",
            speakingType: "PASSAGE",
            passage: "",
            passageRomaji: "",
            passageMeaning: "",
            description: "",
            imgUrl: "",
          }
    );
    setShowDetailModal(true);
  };

  // --- Xử lý thay đổi Form SpeakingItem ---
  const handleDetailChange = (key: keyof SpeakingItem, value: string) => {
     // ... (Đổi tên handleChange thành handleDetailChange)
      setDetailFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --- Xử lý Lưu SpeakingItem (Thêm/Sửa) ---
  const handleSaveSpeakingItem = async () => {
     // ... (Giữ nguyên hàm handleSaveSpeakingItem)
       if (!activeTabId) return;

    let payload: any = { ...detailFormData }; // Sử dụng detailFormData
    let url = "";
    let method: "post" | "put" = "post";

    // Loại bỏ ID nếu có (API POST không cần ID)
    if (!editingDetailItem) { // Sử dụng editingDetailItem
      delete payload.id;
      // Thêm speakingExamId để liên kết
      payload.speakingExamId = activeTabId;
      url = `${API_URL}/speakings`;
      method = "post";
    } else {
      url = `${API_URL}/speakings/${editingDetailItem.id}`; // Sử dụng editingDetailItem
      method = "put";
      // API PUT cần cả ID trong payload theo tài liệu
      payload.id = editingDetailItem.id; // Sử dụng editingDetailItem
    }

    try {
      await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifMessage("Lưu bài tập Speaking thành công!");
      setShowDetailModal(false); // Đóng modal chi tiết
      fetchDetails(activeTabId); // Tải lại danh sách speaking items
    } catch (err) {
      console.error("❌ Lỗi khi lưu speaking item:", err);
      setNotifMessage("❌ Không thể lưu bài tập Speaking.");
    }
  };

  // --- Xử lý Xóa SpeakingItem ---
  const handleDeleteSpeakingItem = async (itemId: number) => {
    // ... (Giữ nguyên hàm handleDeleteSpeakingItem)
      if (!window.confirm("Bạn chắc chắn muốn xóa bài tập Speaking này?")) return;

    try {
      await axios.delete(`${API_URL}/speakings/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifMessage("Xóa bài tập Speaking thành công!");
      if (activeTabId) fetchDetails(activeTabId); // Tải lại danh sách
    } catch (err) {
      console.error("❌ Lỗi khi xóa speaking item:", err);
      setNotifMessage("❌ Không thể xóa bài tập Speaking!");
    }
  };

  // --- Xử lý Điều hướng sang trang Quản lý Speaking Questions ---
  const handleManageSpeakingQuestions = (speakingItem: SpeakingItem) => {
    // ... (Giữ nguyên hàm handleManageSpeakingQuestions)
      alert(`(Dev) Điều hướng đến trang quản lý Speaking Questions cho: ${speakingItem.topic} (ID: ${speakingItem.id})`);
  };

  // --- Render Form động trong Modal quản lý TAB ---
  const renderTabModalForm = () => {
    // ... (Giữ nguyên hàm renderModalForm đã đổi tên thành renderTabModalForm)
      if (!currentPart) return null;

    switch (currentPart.type) {
      case "SPEAKING":
        return (
          <>
            <input
              type="text"
              placeholder="Tiêu đề (VD: Chủ đề Gia đình)"
              value={tabFormData.title || ""}
              onChange={(e) => handleTabFormChange("title", e.target.value)}
              className="border p-3 rounded-lg"
            />
            {/* API nói type này là của Speaking Exam, không phải Speaking Item */}
             <select
              value={tabFormData.type || "PASSAGE"}
              onChange={(e) => handleTabFormChange("type", e.target.value)}
              className="border p-3 rounded-lg bg-white"
               disabled={!!editingTabItem} // Không cho sửa type sau khi tạo? (Tùy logic)
               title={editingTabItem ? "Không thể thay đổi loại sau khi tạo" : ""}
            >
              <option value="PASSAGE">Loại Văn bản (Passage)</option>
              <option value="PICTURE">Loại Hình ảnh (Picture)</option>
              <option value="QUESTION">Loại Câu hỏi (Question)</option>
            </select>
          </>
        );

      case "MIDDLE_EXAM":
      case "FINAL_EXAM":
        return (
          <>
            <input
              type="text"
              placeholder="Tiêu đề kỳ thi (VD: Đề thi cuối kỳ B3)"
              value={tabFormData.examTitle || ""}
              onChange={(e) => handleTabFormChange("examTitle", e.target.value)}
              className="border p-3 rounded-lg"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Học kỳ (VD: HK1)"
                value={tabFormData.semester || ""}
                onChange={(e) => handleTabFormChange("semester", e.target.value)}
                className="border p-3 rounded-lg"
              />
              <select
                value={tabFormData.type || "FE"}
                onChange={(e) => handleTabFormChange("type", e.target.value)}
                className="border p-3 rounded-lg bg-white"
              >
                <option value="FE">Final Exam (FE)</option>
                <option value="ME">Middle Exam (ME)</option>
                <option value="RE">Re-test (RE)</option>
                <option value="B3_FE">B3 Final Exam</option>
                <option value="B3_RE">B3 Re-test</option>
                <option value="B5_FE">B5 Final Exam</option>
                <option value="B5_RE">B5 Re-test</option>
              </select>
              <input
                type="number"
                placeholder="Năm"
                value={tabFormData.year || ""}
                onChange={(e) => handleTabFormChange("year", Number(e.target.value))}
                className="border p-3 rounded-lg"
              />
            </div>
            <textarea
              placeholder="Nhập ID các câu hỏi, cách nhau bằng dấu phẩy (VD: 1, 5, 12)"
              value={tabFormData.questionIds || ""}
              onChange={(e) => handleTabFormChange("questionIds", e.target.value)}
              className="border p-3 rounded-lg min-h-[100px]"
            />
          </>
        );
      default:
        return <p>Loại nội dung không được hỗ trợ.</p>;
    }
  };

  // --- Render Form động trong Modal quản lý SpeakingItem ---
  const renderSpeakingDetailModalForm = () => {
    // ... (Giữ nguyên hàm renderSpeakingModalForm đã đổi tên)
     return (
     <div className="flex flex-col gap-4">
        <input
            type="text"
            placeholder="Chủ đề (Topic)"
            value={detailFormData.topic || ""}
            onChange={(e) => handleDetailChange("topic", e.target.value)}
            className="border p-3 rounded-lg"
        />
        <select
            value={detailFormData.speakingType || "PASSAGE"}
            onChange={(e) => handleDetailChange("speakingType", e.target.value)}
            className="border p-3 rounded-lg bg-white"
        >
            <option value="PASSAGE">Dạng Văn bản (Passage)</option>
            <option value="PICTURE">Dạng Hình ảnh (Picture)</option>
            <option value="QUESTION">Dạng Câu hỏi (Question)</option>
        </select>

        {detailFormData.speakingType === 'PASSAGE' && (
            <>
                <textarea
                    placeholder="Nội dung Passage"
                    value={detailFormData.passage || ""}
                    onChange={(e) => handleDetailChange("passage", e.target.value)}
                    className="border p-3 rounded-lg min-h-[100px]"
                />
                 <textarea
                    placeholder="Passage Romaji (Optional)"
                    value={detailFormData.passageRomaji || ""}
                    onChange={(e) => handleDetailChange("passageRomaji", e.target.value)}
                    className="border p-3 rounded-lg min-h-[60px]"
                />
                 <textarea
                    placeholder="Passage Meaning (Optional)"
                    value={detailFormData.passageMeaning || ""}
                    onChange={(e) => handleDetailChange("passageMeaning", e.target.value)}
                    className="border p-3 rounded-lg min-h-[60px]"
                />
            </>
        )}

        {detailFormData.speakingType === 'PICTURE' && (
            <input
                type="text"
                placeholder="URL Hình ảnh"
                value={detailFormData.imgUrl || ""}
                onChange={(e) => handleDetailChange("imgUrl", e.target.value)}
                className="border p-3 rounded-lg"
            />
        )}

        <textarea
            placeholder="Mô tả / Gợi ý (Optional)"
            value={detailFormData.description || ""}
            onChange={(e) => handleDetailChange("description", e.target.value)}
            className="border p-3 rounded-lg min-h-[60px]"
        />
    </div>
     );
  };

  // --- Render Tabs ---
  const renderTabs = () => {
    // ... (Giữ nguyên hàm renderTabs)
      if (loading || contentList.length === 0) return null;
    return (
        <div className="mb-6 flex items-center space-x-2 border-b border-gray-300 overflow-x-auto pb-2">
            {contentList.map((item) => (
                <div key={item.id} className="relative group flex-shrink-0">
                    <button
                        onClick={() => setActiveTabId(item.id)}
                        className={`pl-4 pr-10 py-2 rounded-t-lg font-semibold whitespace-nowrap transition-all duration-200 border-b-2 ${
                            activeTabId === item.id
                                ? "bg-cyan-600 text-white shadow-sm border-cyan-700"
                                : "text-gray-600 hover:bg-gray-200 border-transparent hover:border-gray-400"
                        }`}
                    >
                        {item.title || item.examTitle || `Item ${item.id}`}
                    </button>
                    {/* Nút sửa/xóa tab */}
                     <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                         <button
                            onClick={(e) => { e.stopPropagation(); openTabModal(item); }}
                            className={`p-1 rounded ${activeTabId === item.id ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-300'}`}
                            title="Sửa Tab"
                         >
                             <AiOutlineEdit className="h-4 w-4"/>
                         </button>
                         <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTab(item); }}
                             className={`p-1 rounded ${activeTabId === item.id ? 'text-white hover:bg-white/20' : 'text-red-500 hover:bg-red-200'}`}
                             title="Xóa Tab"
                         >
                            <AiOutlineDelete className="h-4 w-4"/>
                        </button>
                    </div>
                </div>
            ))}
             {/* Nút thêm Tab */}
             <button
                 onClick={() => openTabModal()}
                 className="ml-2 flex items-center px-3 py-1.5 border border-dashed border-gray-400 text-gray-500 rounded-md hover:bg-gray-200 hover:text-gray-700 transition-colors"
                 title="Thêm Tab mới"
             >
                 <AiOutlinePlus className="h-4 w-4 mr-1"/> Thêm Tab
            </button>
        </div>
    );
  };

  // --- Render Table Content ---
  const renderTable = () => {
    // ... (Giữ nguyên hàm renderTable)
      if (loadingDetails) {
      return (
        <div className="flex justify-center items-center h-40">
          <p className="text-cyan-600 font-semibold text-lg animate-pulse">
            Đang tải chi tiết...
          </p>
        </div>
      );
    }
     if (!activeTabId && !loading && contentList.length > 0) {
        return (
             <div className="text-center p-10 bg-white rounded-lg shadow">
                 <p className="italic text-gray-600">Vui lòng chọn một tab để xem nội dung.</p>
             </div>
        );
     }
    if (!activeTabId || activeItemDetails.length === 0) {
        // Chỉ hiển thị "Chưa có nội dung" nếu không loading VÀ có tab đang active
        if (!loading && !loadingDetails && activeTabId) {
             return (
                <div className="text-center p-10 bg-white rounded-lg shadow">
                <p className="italic text-gray-600">
                    {currentPart?.type === 'SPEAKING' ? 'Chưa có bài tập Speaking nào trong mục này.' : 'Chưa có câu hỏi nào trong đề thi này.'}
                </p>
                </div>
             );
        }
        // Nếu không có tab nào được chọn (vd: list rỗng) hoặc đang loading ban đầu thì không hiển thị gì
        return null;
    }


    // --- Bảng cho Speaking ---
    if (currentPart?.type === "SPEAKING") {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ đề (Topic)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại (Type)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả / Đoạn văn
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeItemDetails.map((item: SpeakingItem) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.topic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.speakingType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {item.description || item.passage || (item.imgUrl ? 'Hình ảnh' : '-')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                    <button
                      onClick={() => handleManageSpeakingQuestions(item)}
                      className="text-purple-600 hover:text-purple-900"
                      title="Quản lý câu hỏi"
                    >
                      <AiOutlineQuestionCircle className="h-5 w-5 inline" />
                    </button>
                     <button
                      onClick={() => openDetailModal(item)} // Mở modal chi tiết
                      className="text-indigo-600 hover:text-indigo-900"
                       title="Chỉnh sửa"
                    >
                      <AiOutlineEdit className="h-5 w-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDeleteSpeakingItem(item.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <AiOutlineDelete className="h-5 w-5 inline"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // --- Bảng cho Middle/Final Exam (Read-only) ---
    if (currentPart?.type === "MIDDLE_EXAM" || currentPart?.type === "FINAL_EXAM") {
       return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <p className="p-4 text-sm text-blue-700 bg-blue-50 border-b border-blue-200">
            Lưu ý: Hiện tại chỉ hỗ trợ xem danh sách câu hỏi. Việc thêm/sửa/xóa câu hỏi cần được thực hiện thông qua chỉnh sửa Exam (Tab) và cập nhật danh sách `questionIds`.
          </p>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại (Type)
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Thể loại (Cat)
                 </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đáp án đúng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeItemDetails.map((q: ExamQuestion) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {q.id}
                  </td>
                   <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                    <div className="line-clamp-2">{q.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {q.questionType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {q.category}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold max-w-[150px] truncate">
                    {q.correctAnswer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null; // Trường hợp không xác định
  };


  // --- Main Render ---
  if (loading && !currentPart) // Chỉ hiển thị loading ban đầu khi chưa có thông tin part
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );

  return (
    <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* --- Header và Nút Back --- */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to={`/teacher/courses/${courseCode}/overviews/${overviewId}/manage-parts`}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
          >
            <IoMdArrowBack className="h-6 w-6" />
            <span className="text-lg font-medium">Quay lại Mục ôn tập</span>
          </Link>
          {/* Nút Thêm Bài tập Speaking chỉ hiển thị khi đang ở tab Speaking */}
          {currentPart?.type === 'SPEAKING' && activeTabId && (
             <button
              onClick={() => openDetailModal()} // Mở modal để thêm Speaking Item
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full hover:bg-green-700 shadow font-semibold"
            >
              <AiOutlinePlus /> Thêm Bài tập Speaking
            </button>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Quản lý Nội dung cho:
        </h1>
        <p className="text-xl text-cyan-700 font-semibold mb-8">
          {currentPart?.title} ({currentPart?.type.replace("_", " ")})
        </p>

        {/* --- Render Tabs --- */}
        {renderTabs()}

        {/* --- Render Table Content --- */}
        {renderTable()}

      </div>

      {/* --- Modal Thêm/Sửa TAB (Exam/SpeakingExam) --- */}
      <AnimatePresence>
        {showTabModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTabModal(false)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-5">
                {editingTabItem ? "Chỉnh sửa Tab" : "Thêm Tab mới"}
              </h3>

               <div className="flex flex-col gap-4">
                 {renderTabModalForm()}
               </div>

              <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button
                  onClick={() => setShowTabModal(false)}
                  className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveTab}
                  className="px-5 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700"
                >
                  Lưu Tab
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modal Thêm/Sửa Speaking Item --- */}
      <AnimatePresence>
        {showDetailModal && currentPart?.type === 'SPEAKING' && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[51] p-4" // z-index cao hơn modal tab
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-5">
                {editingDetailItem ? "Chỉnh sửa Bài tập Speaking" : "Thêm Bài tập Speaking mới"}
              </h3>

               {/* Form động sẽ được render ở đây */}
              {renderSpeakingDetailModalForm()}

              <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSpeakingItem}
                  className="px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700" // Màu nút khác
                >
                  Lưu Bài tập
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

export default TeacherManageOverviewContentPage;