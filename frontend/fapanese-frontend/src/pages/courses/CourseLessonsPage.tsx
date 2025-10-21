import React, { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { getLessonsByCourseCode } from "../../api/lesson";
import CourseBanner from "../../assets/jpd113-coursebanner.svg"; // ảnh banner chung
import { getLessonPartsByLesson } from "../../api/lessonPart";
import { useParams, Link, useNavigate } from "react-router-dom";
import NotificationModal from "../../components/NotificationModal"; // <-- 1. IMPORT MODAL

// ... (animation config giữ nguyên) ...
const customEase = [0.4, 0, 0.2, 1] as const;

const fadeInUp: Variants = {
 hidden: { opacity: 0, y: 50 },
 show: {
  opacity: 1,
  y: 0,
  transition: { duration: 1.2, ease: customEase, staggerChildren: 0.1 },
 },
};

const itemFadeIn: Variants = {
 hidden: { opacity: 0, y: 40 },
 show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: customEase } },
};

// neumorphism
const neumorphicShadow = "20px 20px 60px #d4d7dc, -20px -20px 60px #ffffff";
const buttonShadow =
 "4px 4px 10px rgba(33, 147, 176, 0.4), -4px -4px 10px rgba(109, 213, 237, 0.3)";
// ...

const CourseLessonsPage: React.FC = () => {
 const { courseCode } = useParams();
 const [lessons, setLessons] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const navigate = useNavigate();

 // --- 2. STATE CHO MODAL ---
 const [notifMessage, setNotifMessage] = useState<string | null>(null);
  // 🔹 Thêm state "cờ" để nhớ hành động cần làm (giống unverifiedEmail trong AuthPopup)
 const [isAuthError, setIsAuthError] = useState(false);

 useEffect(() => {
  const fetchLessons = async () => {
   try {
    if (!courseCode) return;
    setLoading(true);
    const res = await getLessonsByCourseCode(courseCode);
    setLessons(res);
   } catch (err: any) { // 🔹 Đặt kiểu 'any' để truy cập err.response
    if (err?.response?.data?.code === 1001) {
          // 🔹 3. SỬA LOGIC CATCH
          // Chỉ hiển thị thông báo và đặt cờ, KHÔNG chuyển trang ngay
     setNotifMessage("Vui lòng đăng nhập để thực hiện tính năng này.");
     setIsAuthError(true); // Đặt cờ để biết cần chuyển trang khi đóng modal
    } else {
     console.error("Không thể tải bài học:", err);
     setNotifMessage(err.response?.data?.message || "Lỗi khi tải bài học.");
          setIsAuthError(false); // Đảm bảo cờ được xóa
    }
   } finally {
    setLoading(false);
   }
  };
  fetchLessons();
    // 🔹 navigate không được gọi trực tiếp trong effect, 
    // nên ta chỉ cần phụ thuộc vào courseCode
 }, [courseCode]);

  // 🔹 4. TẠO HÀM XỬ LÝ ĐÓNG MODAL (Giống hệt logic của AuthPopup)
  const handleNotifClose = () => {
    // Lưu lại trạng thái cờ trước khi reset
    const wasAuthError = isAuthError;

    // Reset tất cả state
    setNotifMessage(null);
    setIsAuthError(false);

    // Kiểm tra cờ và thực hiện hành động (nếu có)
    if (wasAuthError) {
      navigate("/courses"); // Chuyển trang NGAY SAU KHI đóng modal
    }
    // Nếu không phải lỗi auth, không làm gì thêm
  };

 // --- 5. CẬP NHẬT HÀM ĐỂ SỬ DỤNG MODAL (Và xóa cờ) ---
 const handleStartLesson = async (lessonId: number) => {
  try {
      // 🔹 Đảm bảo cờ được xóa khi có hành động mới
      setIsAuthError(false); 
   const parts = await getLessonPartsByLesson(lessonId);
   if (parts.length > 0) {
    const firstPartId = parts[0].id;
    navigate(`/lesson/${courseCode}/${lessonId}/${firstPartId}`);
   } else {
    setNotifMessage("Bài học này chưa có nội dung nào!");
   }
  } catch (err: any) { // 🔹 Đặt kiểu 'any'
   console.error("Không thể tải lesson part:", err);
      setIsAuthError(false); // 🔹 Xóa cờ
   setNotifMessage(err.response?.data?.message || "Lỗi khi mở bài học!");
  }
 };

 return (
  <div className="min-h-screen bg-[#e8ebf0] py-20">
   <motion.div
        // ... (Toàn bộ phần JSX Banner và Lộ trình giữ nguyên) ...
   >
        {/* ... Banner ... */}
    <motion.div variants={itemFadeIn} className="text-center space-y-6">
     <div className="shadow-2xl shadow-gray-400/30 rounded-b-[60px] overflow-hidden">
      <img
       src={CourseBanner}
       alt="Course Banner"
       className="w-full h-auto object-cover"
      />
     </div>
     <h1 className="text-5xl font-semibold text-gray-800 mt-8">
      Khóa học: {courseCode?.toUpperCase()}
     </h1>
    </motion.div>

        {/* ... Lộ trình ... */}
    <motion.div
     variants={itemFadeIn}
     className="space-y-12 max-w-7xl mx-auto px-10"
    >
          {/* ... */}
     <h2 className="text-4xl font-light text-gray-700 text-center tracking-tight">
      Tổng quan Lộ trình Học tập
     </h2>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
              /* ... các item ... */
      ].map((item) => (
       <motion.div
        key={item.title}
// ...
       >
        <h3 className="font-medium text-gray-800 text-xl mb-3">{item.title}</h3>
        <p className="text-gray-500 text-base font-normal">{item.desc}</p>
       </motion.div>
      ))}
     </div>
    </motion.div>

    {/* Danh sách bài học */}
    <motion.div
     variants={itemFadeIn}
     className="space-y-12 max-w-7xl mx-auto px-10"
    >
     <h2 className="text-4xl font-light text-gray-700 text-center tracking-tight">
      Chi tiết Các Bài học
     </h2>

     {loading ? (
      <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
     ) : lessons.length === 0 ? (
      <p className="text-center italic text-gray-500">
       Không có bài học nào trong khóa này.
      </p>
     ) : (
      <div className="space-y-8">
              {/* 🔹 6. SỬA LẠI THẺ LINK THÀNH BUTTON */}
       {lessons.map((lesson) => (
        <motion.div
         key={lesson.id}
                  // ... (props của motion.div giữ nguyên) ...
         className="bg-white rounded-[30px] shadow-2xl shadow-gray-300/50 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center"
        >
         <div className="flex flex-col">
                    {/* ... (thông tin bài học giữ nguyên) ... */}
          <p className="text-1xl font-semibold uppercase text-cyan-600 tracking-widest mb-1 opacity-75">
        Tóm tắt: 
           BÀI HỌC
          </p>
          <h3 className="text-4xl font-medium text-gray-900 mb-2">
           {lesson.lessonTitle || "Chưa đặt tiêu đề"}
          </h3>
          <p className="text-lg text-gray-500 max-w-2xl font-light">
           {lesson.description || "Chưa có mô tả cho bài học này."}
          </p>
         </div>
                  
                  {/* 🔹 THAY <Link> BẰNG <button> ĐỂ GỌI handleStartLesson */}
         <button
          onClick={() => handleStartLesson(lesson.id)}
          className="inline-block px-12 py-4 bg-gradient-to-r from-[#B2EBF2] to-[#80DEEA] text-white font-medium rounded-full shadow-lg transition-all duration-300 transform text-lg tracking-wider hover:scale-105"
          style={{ boxShadow: buttonShadow }}
     _
        >
          Bắt đầu học
         </button>
        </motion.div>
       ))}
      </div>
     )}
    </motion.div>

    {/* ... (CTA giữ nguyên) ... */}
    <motion.div
     variants={itemFadeIn}
     className="text-center space-y-6 pt-16"
    >
          {/* ... */}
    </motion.div>
   </motion.div>

   {/* --- 7. RENDER MODAL VÀ GỌI HÀM MỚI --- */}
   {notifMessage && (
    <NotificationModal
     message={notifMessage}
     onClose={handleNotifClose} // 🔹 Sử dụng hàm xử lý mới
    />
   )}
  </div>
 );
};

export default CourseLessonsPage;