import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import motion
import { 
  FaBook, 
  FaClipboardList, 
  FaFolderOpen, 
  FaUsers,
 
} from "react-icons/fa";

// --- CẤU HÌNH MÀU SẮC & ICON CHO PHONG CÁCH TỐI GIẢN ---
const CARD_BG = "bg-white";
const NEUTRAL_ICON_COLOR = "text-gray-500"; 
const TITLE_COLOR = "text-gray-800"; 
const DESCRIPTION_COLOR = "text-gray-500"; 
const HOVER_BG_COLOR = "hover:bg-gray-50"; 
const BORDER_COLOR = "border-gray-200"; 
const SHADOW_CLASS = "shadow-lg"; 
const HOVER_TRANSFORM = "hover:shadow-xl hover:-translate-y-0.5"; // Hiệu ứng nâng nhẹ khi hover

// Danh sách các card (Cập nhật đường dẫn icon/path)
const DASHBOARD_CARDS = [
  {
    title: "Quản lý Khóa học",
    description: "Xem, thêm, chỉnh sửa các khóa học, bài học và nội dung tổng ôn.",
    path: "/teacher/courses",
    Icon: FaBook,
  },
  {
    title: "Ngân hàng Câu hỏi",
    description: "Xem, thêm, sửa và xóa các câu hỏi trắc nghiệm, điền từ dùng chung.",
    path: "/teacher/question-bank",
    Icon: FaClipboardList,
  },
  {
    title: "Quản lý Tài liệu",
    description: "Tải lên và quản lý các tài liệu học tập, bài tập cho sinh viên.",
    path: "/teacher/materials",
    Icon: FaFolderOpen,
  },
  {
    title: "Quản lý Lớp học",
    description: "Xem, thêm, sửa, xóa lớp học; quản lý sinh viên và tài liệu theo lớp.",
    path: "/teacher/classes",
    Icon: FaUsers,
  },

];

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen  p-5`}>
      {/* Tiêu đề trang */}
      <h1 className={`text-3xl font-bold ${TITLE_COLOR} mb-10 flex items-center border-b ${BORDER_COLOR} pb-3`}>
        Bảng điều khiển Giảng viên
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Đảm bảo khoảng cách hợp lý */}

        {DASHBOARD_CARDS.map((card, index) => (
          <motion.div
            key={card.path}
            onClick={() => navigate(card.path)}
            className={`
              ${CARD_BG} p-6 rounded-xl ${SHADOW_CLASS} 
              transition-all duration-300 ease-out 
              cursor-pointer border ${BORDER_COLOR} 
              flex flex-col items-start 
              ${HOVER_BG_COLOR} 
              ${HOVER_TRANSFORM} 
            `}
            // Animation từ Framer Motion
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07 }} 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }} 
          >
            {/* Icon - Kích thước lớn hơn một chút */}
            <card.Icon className={`text-4xl ${NEUTRAL_ICON_COLOR} mb-3`} /> 
            
            {/* Tiêu đề */}
            <h2 className={`text-xl font-semibold ${TITLE_COLOR} mb-2`}>
              {card.title}
            </h2>
            
            {/* Mô tả */}
            <p className={`${DESCRIPTION_COLOR} text-sm`}>
              {card.description}
            </p>
          </motion.div> 
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;