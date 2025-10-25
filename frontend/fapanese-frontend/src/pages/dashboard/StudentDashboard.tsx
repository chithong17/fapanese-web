import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Confetti from "react-confetti";
import {
  AiOutlineBook,
  AiOutlineDashboard,
  AiOutlineEdit,
  AiOutlinePlayCircle,
  AiOutlineSound,
  AiOutlineForm,
  AiOutlineGift,
} from "react-icons/ai";

// Theme màu chung Fapanese
const Theme = {
  primary: "#00BCD4",
  primaryHover: "#00ACC1",
  accent: "#4DD0E1",
  text: "#1F2937",
  bgLight: "#F9FAFB",
  white: "#FFFFFF",
};

// Hiệu ứng thống nhất
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

// Component Card tiến độ
const ProgressCard = ({
  title,
  value,
  subtitle,
  icon,
  onComplete,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  onComplete?: () => void;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      onClick={onComplete}
      className="rounded-2xl p-6 shadow-md w-full sm:w-60 cursor-pointer transition-all border border-gray-100"
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${Theme.primary}, ${Theme.accent})`
          : Theme.white,
        color: hovered ? "white" : Theme.text,
      }}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-sm">{subtitle}</p>}
    </motion.div>
  );
};

// Component hoạt động gần đây
const ActivityItem = ({
  activity,
  status,
  score,
  icon,
  onComplete,
}: {
  activity: string;
  status: string;
  score?: number;
  icon?: React.ReactNode;
  onComplete?: () => void;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      onClick={onComplete}
      className={`flex justify-between items-center p-4 rounded-xl transition-all shadow-sm border border-gray-100 mb-3`}
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${Theme.primary}, ${Theme.accent})`
          : Theme.white,
        color: hovered ? "white" : Theme.text,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-xl">{icon}</div>
        <div>
          <h4 className="font-medium">{activity}</h4>
          <p className="text-sm">{status}</p>
        </div>
      </div>
      {score !== undefined && <span className="font-bold">{score}</span>}
    </motion.div>
  );
};

// Trang Dashboard chính
const StudentDashboard: React.FC = () => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleComplete = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const scrollToSection = () => {};
  const handleAuthClick = () => {};

  return (
    <div>
      <Navbar
        scrollToSection={scrollToSection}
        onAuthClick={handleAuthClick}
        userDropdownOpen={userDropdownOpen}
        setUserDropdownOpen={setUserDropdownOpen}
      />

      <div
        className="pt-24 px-6 sm:px-12 pb-10 min-h-screen"
        style={{ backgroundColor: Theme.bgLight }}
      >
        {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

        {/* Tiêu đề */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-gray-800 mb-2">
            DASHBOARD HỌC VIÊN
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Theo dõi tiến độ học tập và hoạt động của bạn trong hệ thống Fapanese.
          </p>
        </motion.div>

        {/* Tổng quan tiến độ */}
        <div className="flex flex-wrap gap-5 mb-10">
          <ProgressCard
            title="Tổng điểm"
            value="1,250"
            icon={<AiOutlineDashboard />}
            onComplete={handleComplete}
          />
          <ProgressCard
            title="Ngày liên tiếp"
            value="15"
            icon={<AiOutlineBook />}
          />
          <ProgressCard
            title="Bài đã học"
            value="32"
            icon={<AiOutlineEdit />}
          />
          <ProgressCard
            title="Thời gian hôm nay"
            value="45 phút"
            icon={<AiOutlinePlayCircle />}
          />
          <ProgressCard
            title="Cấp độ hiện tại"
            value="Intermediate"
            subtitle="Tiến độ lên cấp 17%"
            icon={<AiOutlineDashboard />}
          />
        </div>

        {/* Hoạt động gần đây */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100"
        >
          <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-2">
            Hoạt động gần đây
          </h2>
          <ActivityItem
            activity="Hiragana và Katakana"
            status="Hoàn thành"
            score={95}
            icon={<AiOutlineBook />}
            onComplete={handleComplete}
          />
          <ActivityItem
            activity="Kanji cơ bản - Số"
            status="Hoàn thành"
            score={88}
            icon={<AiOutlineBook />}
          />
          <ActivityItem
            activity="Ngữ pháp N5"
            status="60% hoàn thành"
            icon={<AiOutlineBook />}
          />
        </motion.div>

        {/* Tiếp tục học */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-5"
        >
          {[
            { name: "Tiếp tục học", icon: <AiOutlineBook /> },
            { name: "Chơi game", icon: <AiOutlinePlayCircle /> },
            { name: "Luyện nói", icon: <AiOutlineSound /> },
            { name: "Luyện viết", icon: <AiOutlineForm /> },
            { name: "Nhận thưởng", icon: <AiOutlineGift /> },
          ].map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white shadow-md rounded-2xl p-5 w-full sm:w-60 text-center border border-gray-100 cursor-pointer transition-all"
            >
              <div className="text-3xl mb-2 text-cyan-600">{item.icon}</div>
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
