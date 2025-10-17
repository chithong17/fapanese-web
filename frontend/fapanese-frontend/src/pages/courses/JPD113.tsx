import React from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
// Bỏ import các icon FaBookOpen, FaComments, FaLanguage vì không dùng nữa
import CourseBanner from "../../assets/jpd113-coursebanner.svg";

// Tạo motion Link component để hỗ trợ animation props
const MotionLink = motion(Link);

// Sửa lỗi TYPESCRIPT: Custom easing cho chuyển động "sang xịn"
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

// Hàm tạo Neumorphism Shadow
const neumorphicShadow = "20px 20px 60px #d4d7dc, -20px -20px 60px #ffffff";
const buttonShadow = "4px 4px 10px rgba(33, 147, 176, 0.4), -4px -4px 10px rgba(109, 213, 237, 0.3)";

const JPD113: React.FC = () => {
  // KHÔI PHỤC: Cấu trúc dữ liệu tối giản (bỏ details)
  const lessons = [
    {
      title: "第1課 ー はじめて",
      lessonId: "bai1",
      desc: "Giới thiệu bản thân, các câu chào hỏi cơ bản, chữ cái và con số, đặt nền móng giao tiếp.",
    },
    {
      title: "第２課 ー 買い物◦食事",
      lessonId: "bai2",
      desc: "Thực hành mua sắm và gọi món ăn. Nắm vững đại từ chỉ định và danh từ chỉ đồ vật.",
    },
    {
      title: "第３課 ー スケジュール",
      lessonId: "bai3",
      desc: "Thảo luận về lịch trình cá nhân, thời gian. Học các động từ di chuyển quan trọng và cách hỏi giờ.",
    },
  ];

  return (
    // Nền: Tông màu trắng xám nhạt cao cấp
    <div className="min-h-screen bg-[#e8ebf0] py-20"> 
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeInUp}
        className="mx-auto space-y-32"
      >
        {/* Header (Giữ nguyên phong cách cao cấp) */}
        <motion.div
          variants={itemFadeIn}
          className="text-center space-y-6"
        >
          <div className="shadow-2xl shadow-gray-400/30 rounded-b-[60px] overflow-hidden">
            <img 
                src={CourseBanner} 
                alt="JPD113 Course Banner" 
                className="w-full h-auto object-cover" 
            />
          </div>
        </motion.div>

        {/* Nội dung chính: Đặt trong container tập trung */}
        <div className="max-w-7xl mx-auto px-10 space-y-24">
            
            {/* Lộ trình học tập chi tiết (Giữ nguyên phong cách Neumorphism) */}
            <motion.div variants={itemFadeIn} className="space-y-12">
                <h2 className="text-4xl font-light text-gray-700 text-center tracking-tight">
                    Tổng quan Lộ trình Học tập
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: "1. Bảng chữ cái", desc: "Nắm vững Hiragana, Katakana và phát âm chuẩn." },
                        { title: "2. Từ vựng Cốt lõi", desc: "Mở rộng vốn từ vựng cơ bản theo các chủ đề thiết yếu." },
                        { title: "3. Ngữ pháp Chìa khóa", desc: "Thành thạo cấu trúc câu đơn giản và thể thông thường." },
                        { title: "4. Luyện giao tiếp", desc: "Thực hành phản xạ, tự tin nói các tình huống cơ bản." },
                        { title: "5. Ôn tập Chuyên sâu", desc: "Củng cố kiến thức, làm bài tập và kiểm tra định kỳ." },
                        { title: "6. Hoàn thành & Chứng nhận", desc: "Đánh giá cuối khóa và nhận chứng chỉ hoàn thành." },
                    ].map((item) => (
                    <motion.div
                        key={item.title}
                        variants={itemFadeIn}
                        whileHover={{ 
                            scale: 1.05, 
                            boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" 
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        style={{ boxShadow: neumorphicShadow }}
                        className={`bg-[#e8ebf0] rounded-[25px] p-8 transition-all duration-500 transform cursor-pointer border-2 border-transparent`}
                    >
                        <h3 className="font-medium text-gray-800 text-xl tracking-tight mb-3">{item.title}</h3>
                        <p className="text-gray-500 mt-2 text-base font-normal">{item.desc}</p>
                    </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Danh sách bài học (CHỈ CÒN 1 NÚT, LINK ĐẾN TỪ VỰNG) */}
            <motion.div variants={itemFadeIn} className="space-y-12">
                <h2 className="text-4xl font-light text-gray-700 text-center tracking-tight">
                    Chi tiết Các Bài học Chính
                </h2>

                <div className="space-y-8">
                    {lessons.map((lesson) => (
                    <motion.div
                        key={lesson.lessonId}
                        variants={itemFadeIn}
                        whileHover={{ y: -8, scale: 1.01, boxShadow: "0 25px 50px rgba(45, 110, 150, 0.2)" }} 
                        transition={{ type: "spring", stiffness: 250, damping: 18 }}
                        className="bg-white rounded-[30px] shadow-2xl shadow-gray-300/50 p-8 md:p-12 transition-all duration-300 transform flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0"
                    >
                        {/* Typography Sang trọng */}
                        <div className="flex flex-col">
                            <p className="text-1xl font-semibold uppercase text-cyan-600 tracking-widest mb-1 opacity-75">BÀI HỌC</p>
                            <h3 className="text-4xl font-medium text-gray-900 mb-2 tracking-tighter">
                                {lesson.title}
                            </h3>
                            <p className="text-xl text-gray-500 max-w-2xl font-light mt-1">{lesson.desc}</p>
                        </div>

                        {/* Nút Học ngay (Dẫn thẳng đến Từ vựng) */}
                        <MotionLink
                            // SỬA LINK: Cố định tham số cuối cùng là 'tuvung'
                            to={`/lesson/jpd113/${lesson.lessonId}/tuvung`} 
                            whileHover={{ scale: 1.05, boxShadow: "0 8px 15px rgba(33, 147, 176, 0.6)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            style={{ boxShadow: buttonShadow }}
                            className="inline-block px-12 py-4 bg-gradient-to-r from-[#B2EBF2] to-[#80DEEA] text-white font-medium rounded-full shadow-lg transition-all duration-300 transform text-lg tracking-wider"
                        >
                            Bắt đầu học
                        </MotionLink>
                    </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* CTA */}
            <motion.div
            variants={itemFadeIn}
            className="text-center space-y-6 pt-16"
            >
            <h3 className="text-gray-900 font-extralight text-5xl tracking-tight">
                Hành trình chinh phục tiếng Nhật bắt đầu từ đây.
            </h3>
            <p className="text-gray-500 max-w-3xl mx-auto text-xl font-light mt-3">
                Hãy tham gia cùng cộng đồng học viên tinh hoa và xây dựng nền tảng ngôn ngữ vững chắc nhất.
            </p>
            <MotionLink 
                to="#" 
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(45, 110, 150, 0.4)" }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }} 
                className="inline-block mt-8 px-16 py-5 bg-gradient-to-r from-[#B2EBF2] to-[#80DEEA] text-white font-bold text-xl rounded-full shadow-2xl shadow-cyan-600/50 hover:shadow-cyan-700/60 transition-all duration-500 transform tracking-wider"
            >
                Đăng ký Khóa học Ngay
            </MotionLink>
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default JPD113;