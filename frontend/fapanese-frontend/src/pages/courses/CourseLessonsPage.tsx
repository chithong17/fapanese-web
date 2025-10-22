import React, { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { getLessonsByCourseCode } from "../../api/lesson";
import CourseBanner from "../../assets/jpd113-coursebanner.svg"; 
import { getLessonPartsByLesson } from "../../api/lessonPart";
import { useParams, Link, useNavigate } from "react-router-dom";
import NotificationModal from "../../components/NotificationModal"; 

// --- Cấu hình Animation Tối Ưu ---
const customEase = [0.4, 0, 0.2, 1] as const;

// Container chính (FadeIn & Scale nhẹ)
const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: customEase, staggerChildren: 0.2, delay: 0.1 },
  },
};

// Dùng cho Banner, Title lớn
const headerFadeIn: Variants = {
  hidden: { opacity: 0, y: -40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.2, ease: customEase } },
};

// Dùng cho các section chi tiết (Lộ trình, Danh sách bài học)
const sectionFadeIn: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: customEase } },
};

// Dùng cho từng item trong danh sách
const itemVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: customEase } },
};

// --- Cấu hình Neumorphism & Màu Sắc ---
const mainBg = "#e8ebf0"; 
// Shadow Neumorphism Sâu hơn
const neumorphicShadow = "20px 20px 40px #c6c9cc, -10px -10px 40px #ffffff"; 
// Shadow nút (Cyan/Teal)
const buttonShadow = "4px 4px 10px rgba(33, 147, 176, 0.4), -4px -4px 10px rgba(109, 213, 237, 0.3)";


const CourseLessonsPage: React.FC = () => {
  const { courseCode } = useParams();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        if (!courseCode) return;
        setLoading(true);
        const res = await getLessonsByCourseCode(courseCode);
        setLessons(res);
      } catch (err: any) {
        if (err?.response?.data?.code === 1001) {
          setNotifMessage("Vui lòng đăng nhập để thực hiện tính năng này.");
          setIsAuthError(true); 
        } else {
          console.error("Không thể tải bài học:", err);
          setNotifMessage(err.response?.data?.message || "Lỗi khi tải bài học.");
          setIsAuthError(false);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [courseCode]);

  const handleNotifClose = () => {
    const wasAuthError = isAuthError;
    setNotifMessage(null);
    setIsAuthError(false);
    if (wasAuthError) {
      navigate("/courses"); 
    }
  };

  const handleStartLesson = async (lessonId: number) => {
    try {
      setIsAuthError(false); 
      const parts = await getLessonPartsByLesson(lessonId);
      if (parts.length > 0) {
        const firstPartId = parts[0].id;
        navigate(`/lesson/${courseCode}/${lessonId}/${firstPartId}`);
      } else {
        setNotifMessage("Bài học này chưa có nội dung nào!");
      }
    } catch (err: any) {
      console.error("Không thể tải lesson part:", err);
      setIsAuthError(false); 
      setNotifMessage(err.response?.data?.message || "Lỗi khi mở bài học!");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: mainBg }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="py-20" 
      >
        {/* --- 1. Banner và Tiêu đề (Header Fade In) --- */}
        <motion.div variants={headerFadeIn} className="text-center space-y-6 mb-16">
          
          {/* Vùng Banner: GIỮ NGUYÊN CODE TỪ PHIÊN BẢN TRƯỚC */}
          <div className="w-full flex justify-center items-center overflow-hidden shadow-2xl shadow-gray-400/30 bg-white min-h-[300px] sm:min-h-[400px] mb-8">
            <img
              src={CourseBanner}
              alt="Course Banner"
              className=" w-full object-contain transform hover:scale-[1.03] transition duration-700" 
            />
          </div>

        </motion.div>

        {/* Các section còn lại */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10"> 
          
          {/* --- 2. Lộ trình Học tập (Section Fade In) --- */}
          <motion.div
            variants={sectionFadeIn}
            className="space-y-12 mb-20"
          >
            <h2 className="text-4xl font-light text-gray-700 text-center tracking-tight border-b-2 border-cyan-100 pb-3">
              Tổng quan Lộ trình Học tập
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                  { title: "Ngữ pháp cốt lõi", desc: "Nền tảng vững chắc cho mọi cấp độ JLPT." },
                  { title: "Từ vựng chuyên sâu", desc: "Mở rộng vốn từ vựng theo chủ đề ứng dụng." },
                  { title: "Kỹ năng Đọc & Nghe", desc: "Thực hành các bài tập theo định dạng thi JLPT." },
                ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  // Thẻ lộ trình: Hiệu ứng Neumorphism đẹp mắt
                  className="p-8 rounded-2xl bg-white transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-default"
                  style={{ boxShadow: neumorphicShadow }}
                >
                  <h3 className="font-semibold text-gray-800 text-xl mb-3 border-b pb-2 border-gray-100">{item.title}</h3>
                  <p className="text-gray-500 text-base font-normal">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* --- 3. Danh sách Bài học (Section Fade In & Item Variants) --- */}
          <motion.div
            variants={sectionFadeIn}
            className="space-y-12"
          >
            <h2 className="text-4xl font-light text-gray-700 text-center tracking-tight border-b-2 border-cyan-100 pb-3">
              Chi tiết Các Bài học
            </h2>

            {loading ? (
              <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
            ) : lessons.length === 0 ? (
              <p className="text-center italic text-gray-500">
                Không có bài học nào trong khóa này.
              </p>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.15 } } }} 
                className="space-y-6"
              >
                {lessons.map((lesson) => (
                  <motion.div
                    key={lesson.id}
                    variants={itemVariants} 
                    // Thẻ bài học: Neumorphism và hover state
                    className="bg-white rounded-[30px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center 
                               transition-all duration-300 hover:shadow-2xl hover:bg-[#F0F8FF]"
                    style={{ boxShadow: neumorphicShadow }}
                  >
                    <div className="flex flex-col mb-4 md:mb-0">
                      <p className="text-base font-semibold uppercase text-cyan-600 tracking-widest mb-1 opacity-75">
                        BÀI HỌC {lesson.id}: 
                      </p>
                      <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                        {lesson.lessonTitle || "Chưa đặt tiêu đề"}
                      </h3>
                      <p className="text-lg text-gray-600 max-w-2xl font-light">
                        {lesson.description || "Chưa có mô tả cho bài học này."}
                      </p>
                    </div>
                    
                    {/* Nút Bắt đầu Học: Hiệu ứng Tương tác Neumorphism */}
                    <motion.button
                      onClick={() => handleStartLesson(lesson.id)}
                      className="flex-shrink-0 px-12 py-4 bg-gradient-to-r from-[#B2EBF2] to-[#80DEEA] text-white font-medium rounded-full shadow-lg transition-all duration-300 transform text-lg tracking-wider w-full md:w-auto"
                      style={{ boxShadow: buttonShadow }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      // Hiệu ứng nhấn sâu (inset shadow)
                      whileTap={{ 
                        scale: 0.95, 
                        y: 0, 
                        boxShadow: "inset 6px 6px 15px rgba(33, 147, 176, 0.4), inset -6px -6px 15px rgba(109, 213, 237, 0.3)" 
                      }} 
                    >
                      Bắt đầu học
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* --- 4. CTA (Call to Action): Nút chuyên nghiệp hơn --- */}
          <motion.div
            variants={sectionFadeIn}
            className="text-center space-y-6 pt-24 pb-10"
          >
            <h3 className="text-3xl font-light text-gray-700">
              Sẵn sàng chinh phục {courseCode?.toUpperCase()}?
            </h3>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
                <Link
                  to="/contact"
                  className="inline-block px-12 py-4 bg-gray-800 text-white font-bold rounded-lg shadow-xl hover:bg-gray-700 transition duration-300 transform text-lg tracking-wider"
                >
                  Liên hệ Tư vấn Khóa học
                </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* --- Notification Modal --- */}
      {notifMessage && (
        <NotificationModal
          message={notifMessage}
          onClose={handleNotifClose}
        />
      )}
    </div>
  );
};

export default CourseLessonsPage;