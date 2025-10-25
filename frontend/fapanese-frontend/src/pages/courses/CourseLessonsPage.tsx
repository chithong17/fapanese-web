import React, { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { getLessonsByCourseCode } from "../../api/lesson";
import { getOverviewsByCourseCode } from "../../api/overview"; 
import CourseBanner from "../../assets/jpd113-coursebanner.svg";
import { getLessonPartsByLesson } from "../../api/lessonPart";
import { getOverviewPartsByOverview } from "../../api/overviewPart";
import { useParams, Link, useNavigate } from "react-router-dom";
import NotificationModal from "../../components/NotificationModal";

// --- Cấu hình Animation Tối Ưu ---
const customEase = [0.4, 0, 0.2, 1] as const;
const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: customEase, staggerChildren: 0.2, delay: 0.1 },
  },
};
const headerFadeIn: Variants = {
  hidden: { opacity: 0, y: -40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.2, ease: customEase } },
};
const sectionFadeIn: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: customEase } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: customEase } },
};
const mainBg = "#e8ebf0";
const neumorphicShadow = "20px 20px 40px #c6c9cc, -10px -10px 40px #ffffff";
const buttonShadow = "4px 4px 10px rgba(33, 147, 176, 0.4), -4px -4px 10px rgba(109, 213, 237, 0.3)";


const CourseLessonsPage: React.FC = () => {
  const { courseCode } = useParams();
  const [lessons, setLessons] = useState<any[]>([]);
  const [overviews, setOverviews] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!courseCode) return;
        setLoading(true);

        const [lessonData, overviewData] = await Promise.all([
          getLessonsByCourseCode(courseCode),
          getOverviewsByCourseCode(courseCode), 
        ]);
        
        setLessons(lessonData || []);
        setOverviews(overviewData || []);

      } catch (err: any) {
        if (err?.response?.data?.code === 1001) {
          setNotifMessage("Vui lòng đăng nhập để thực hiện tính năng này.");
          setIsAuthError(true);
        } else {
          console.error("Không thể tải dữ liệu khóa học:", err);
          setNotifMessage(err.response?.data?.message || "Lỗi khi tải dữ liệu.");
          setIsAuthError(false);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  // *** HÀM BẠN BỊ THIẾU NẰM Ở ĐÂY ***
  const handleStartOverview = async (overviewId: number) => {
    try {
      setIsAuthError(false);
      const parts = await getOverviewPartsByOverview(overviewId);
      if (parts.length > 0) {
        const firstPartId = parts[0].id;
        navigate(`/overview/${courseCode}/${overviewId}/${firstPartId}`); 
      } else {
        setNotifMessage("Nội dung ôn tập này chưa có chi tiết nào!");
      }
    } catch (err: any) {
      console.error("Không thể tải overview part:", err);
      setIsAuthError(false);
      setNotifMessage(err.response?.data?.message || "Lỗi khi mở nội dung ôn tập!");
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
        {/* --- 1. Banner và Tiêu đề --- */}
        <motion.div variants={headerFadeIn} className="text-center space-y-6 mb-16">
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
          
          {/* --- 2. Lộ trình Học tập --- */}
          <motion.div
            variants={sectionFadeIn}
            className="space-y-12 mb-20"
          >
            <h2 className="text-4xl font-light text-gray-700 text-center tracking-tight border-b-2 border-gray-300 pb-3">
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
                  className="p-8 rounded-2xl bg-white transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-default"
                  style={{ boxShadow: neumorphicShadow }}
                >
                  <h3 className="font-semibold text-gray-800 text-xl mb-3 border-b pb-2 border-gray-100">{item.title}</h3>
                  <p className="text-gray-500 text-base font-normal">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* --- 3. Danh sách Bài học --- */}
          <motion.div
            variants={sectionFadeIn}
            className="space-y-12"
          >
            <h2 className="text-4xl font-light text-gray-700 text-center tracking-tight border-b-2 border-gray-300 pb-3">
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
                    className="bg-white rounded-[30px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center 
                                   transition-all duration-300 hover:shadow-2xl hover:bg-[#F0F8FF]"
                    style={{ boxShadow: neumorphicShadow }}
                  >
                    <div className="flex flex-col mb-4 md:mb-0">
                      <p className="text-1xl font-semibold uppercase text-cyan-600 tracking-widest mb-1 opacity-75">
                        BÀI HỌC {lesson.id}:
                      </p>
                      <h3 className="text-3xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                        {lesson.lessonTitle || "Chưa đặt tiêu đề"}
                      </h3>
                      <p className="text-md text-gray-600 max-w-2xl font-light opacity-75 min-h-12">
                        {lesson.description || "Chưa có mô tả cho bài học này."}
                      </p>
                    </div>
                    
                    <motion.button
                      onClick={() => handleStartLesson(lesson.id)}
                      className="flex-shrink-0 px-12 py-4 bg-gradient-to-r from-[#B2EBF2] to-[#80DEEA] text-white font-medium rounded-full shadow-lg transition-all duration-300 transform text-lg tracking-wider w-full md:w-auto"
                      style={{ boxShadow: buttonShadow }}
                      whileHover={{ scale: 1.05, y: -2 }}
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

          {/* --- 4. Danh sách Tổng ôn (Overviews) --- */}
          <motion.div
            variants={sectionFadeIn}
            className="space-y-12 mt-20" 
          >
            <h2 className="text-4xl mb-5 font-light text-gray-700 text-center tracking-tight border-b-2 border-gray-400 pb-3">
              Nội dung Tổng ôn
            </h2>

            {loading ? (
              <></> 
            ) : overviews.length === 0 ? (
              <p className="text-center italic text-gray-500">
                Chưa có nội dung tổng ôn nào cho khóa này.
              </p>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.15 } } }}
                className="space-y-6"
              >
                {overviews.map((overview) => (
                  <motion.div
                    key={overview.id}
                    variants={itemVariants}
                    className="bg-white rounded-[30px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center 
                                   transition-all duration-300 hover:shadow-2xl hover:bg-[#FFFBEF]"
                    style={{ boxShadow: neumorphicShadow }}
                  >
                    <div className="flex flex-col mb-4 md:mb-0">
                      <p className="text-1xl font-semibold uppercase text-orange-600 tracking-widest mb-1 opacity-75">
                        TỔNG ÔN {overview.id}:
                      </p>
                      <h3 className="text-3xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                        {overview.overviewTitle || "Chưa đặt tiêu đề"}
                      </h3>
                      <p className="text-md text-gray-600 max-w-2xl font-light opacity-75 min-h-12">
                        {overview.description || "Chưa có mô tả cho nội dung này."}
                      </p>
                    </div>
                    
                    {/* HÀM ĐƯỢC GỌI TẠI ĐÂY */}
                    <motion.button
                      onClick={() => handleStartOverview(overview.id)}
                      className="flex-shrink-0 px-12 py-4 bg-gradient-to-r from-[#FDEB71] to-[#F8D800] text-gray-900 font-medium rounded-full shadow-lg transition-all duration-300 transform text-lg tracking-wider w-full md:w-auto"
                      style={{ boxShadow: "4px 4px 10px rgba(248, 216, 0, 0.4), -4px -4px 10px rgba(253, 235, 113, 0.3)" }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ 
                        scale: 0.95, 
                        y: 0, 
                        boxShadow: "inset 6px 6px 15px rgba(248, 216, 0, 0.4), inset -6px -6px 15px rgba(253, 235, 113, 0.3)" 
                      }} 
                    >
                      Bắt đầu ôn tập
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>


          {/* --- 5. CTA (Call to Action) --- */}
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