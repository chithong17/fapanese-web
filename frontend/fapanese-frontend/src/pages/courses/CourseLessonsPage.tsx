import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { getLessonsByCourseCode } from "../../api/lesson";
import CourseBanner from "../../assets/jpd113-coursebanner.svg"; // ảnh banner chung

// animation config
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

const CourseLessonsPage: React.FC = () => {
  const { courseCode } = useParams();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        if (!courseCode) return;
        setLoading(true);
        const res = await getLessonsByCourseCode(courseCode);
        setLessons(res);
      } catch (err) {
        console.error("Không thể tải bài học:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [courseCode]);

  return (
    <div className="min-h-screen bg-[#e8ebf0] py-20">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeInUp}
        className="mx-auto space-y-32"
      >
        {/* Banner */}
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

        {/* Lộ trình */}
        <motion.div variants={itemFadeIn} className="space-y-12 max-w-7xl mx-auto px-10">
          <h2 className="text-4xl font-light text-gray-700 text-center tracking-tight">
            Tổng quan Lộ trình Học tập
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "1. Bảng chữ cái", desc: "Học Hiragana, Katakana, phát âm chuẩn." },
              { title: "2. Từ vựng Cốt lõi", desc: "Mở rộng vốn từ qua các chủ đề cơ bản." },
              { title: "3. Ngữ pháp Chìa khóa", desc: "Thành thạo cấu trúc câu thông dụng." },
              { title: "4. Giao tiếp tự tin", desc: "Luyện phản xạ và đối thoại thực tế." },
              { title: "5. Ôn tập & Kiểm tra", desc: "Củng cố kiến thức với bài tập định kỳ." },
              { title: "6. Hoàn thành & Chứng nhận", desc: "Đạt chứng chỉ sau khi hoàn thành khóa." },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={itemFadeIn}
                whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                style={{ boxShadow: neumorphicShadow }}
                className="bg-[#e8ebf0] rounded-[25px] p-8 transition-all duration-500 cursor-pointer"
              >
                <h3 className="font-medium text-gray-800 text-xl mb-3">{item.title}</h3>
                <p className="text-gray-500 text-base font-normal">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Danh sách bài học */}
        <motion.div variants={itemFadeIn} className="space-y-12 max-w-7xl mx-auto px-10">
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
              {lessons.map((lesson) => (
                <motion.div
                  key={lesson.id}
                  variants={itemFadeIn}
                  whileHover={{
                    y: -8,
                    scale: 1.01,
                    boxShadow: "0 10px 50px rgba(45, 110, 150, 0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 250, damping: 18 }}
                  className="bg-white rounded-[30px] shadow-2xl shadow-gray-300/50 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center"
                >
                  <div className="flex flex-col">
                    <p className="text-1xl font-semibold uppercase text-cyan-600 tracking-widest mb-1 opacity-75">
                      BÀI HỌC
                    </p>
                    <h3 className="text-4xl font-medium text-gray-900 mb-2">
                      {lesson.lessonTitle || "Chưa đặt tiêu đề"}
                    </h3>
                    <p className="text-lg text-gray-500 max-w-2xl font-light">
                      {lesson.description || "Chưa có mô tả cho bài học này."}
                    </p>
                  </div>

                  <Link
                    to={`/lesson/${courseCode}/${lesson.id}/1`}
                    className="inline-block px-12 py-4 bg-gradient-to-r from-[#B2EBF2] to-[#80DEEA] text-white font-medium rounded-full shadow-lg transition-all duration-300 transform text-lg tracking-wider hover:scale-105"
                    style={{ boxShadow: buttonShadow }}
                  >
                    Bắt đầu học
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemFadeIn} className="text-center space-y-6 pt-16">
          <h3 className="text-gray-900 font-extralight text-5xl tracking-tight">
            Hành trình chinh phục tiếng Nhật bắt đầu từ đây.
          </h3>
          <p className="text-gray-500 max-w-3xl mx-auto text-xl font-light mt-3">
            Hãy tham gia cùng cộng đồng học viên tinh hoa và xây dựng nền tảng ngôn ngữ vững chắc nhất.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CourseLessonsPage;
