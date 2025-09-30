  // src/pages/StudentDashboard.tsx
  import React, { useState } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import Navbar from "../../components/Navbar";
  import {
    AiOutlineBook,
    AiOutlineDashboard,
    AiOutlineQuestionCircle,
    AiOutlineEdit,
    AiOutlinePlayCircle,
    AiOutlineSound,
    AiOutlineForm,
    AiOutlineGift,
  } from "react-icons/ai";
  import { MdLogin, MdPersonAdd } from "react-icons/md";
  import Confetti from "react-confetti";

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
        className="bg-white rounded-xl p-6 w-full sm:w-60 transition-transform cursor-pointer shadow-lg"
        style={{
          background: hovered
            ? "linear-gradient(135deg, #80D9E6, #A4EBF2)"
            : "white",
          color: hovered ? "#fff" : "#1F2937",
        }}
        onClick={onComplete}
      >
        <div className="text-2xl mb-2">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-sm">{subtitle}</p>}
      </motion.div>
    );
  };

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
        className={`flex justify-between items-center p-4 border-b last:border-b-0 cursor-pointer rounded-lg transition-all`}
        style={{
          background: hovered ? "linear-gradient(135deg, #80D9E6, #A4EBF2)" : "white",
          color: hovered ? "#fff" : "#1F2937",
        }}
        onClick={onComplete}
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

  const StudentDashboard: React.FC = () => {
    const scrollToSection = (id: string) => {};
    const handleAuthClick = (tab: "login" | "signup") => {};

    const [showConfetti, setShowConfetti] = useState(false);

    const handleComplete = () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); // Confetti 3 giây
    };

    return (
      <div>
        <Navbar scrollToSection={scrollToSection} onAuthClick={handleAuthClick} />
        <div className="pt-24 p-6 min-h-screen bg-gray-50">
          {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="mb-6">Theo dõi tiến độ học tập của bạn</p>

          {/* Tổng quan */}
          <div className="flex flex-wrap gap-6 mb-8">
            <ProgressCard
              title="Tổng điểm"
              value="1,250"
              icon={<AiOutlineDashboard />}
              onComplete={handleComplete}
            />
            <ProgressCard title="Ngày liên tiếp" value="15" icon={<AiOutlineBook />} />
            <ProgressCard title="Bài đã học" value="32" icon={<AiOutlineEdit />} />
            <ProgressCard title="Hôm nay" value="45m" icon={<AiOutlinePlayCircle />} />
            <ProgressCard
              title="Cấp độ hiện tại"
              value="Intermediate"
              subtitle="Tiến độ lên cấp -17%"
              icon={<AiOutlineDashboard />}
            />
            <ProgressCard
              title="Cấp tiếp theo"
              value="Advanced"
              subtitle="1,500 / 3,000 điểm"
              icon={<AiOutlineBook />}
            />
          </div>

          {/* Hoạt động gần đây */}
          <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
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
          </div>

          {/* Tiếp tục học */}
          <div className="flex flex-wrap gap-6">
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
                className="bg-white shadow-md rounded-xl p-6 w-full sm:w-60 text-center cursor-pointer transition-all flex flex-col items-center gap-2"
              >
                <div className="text-3xl">{item.icon}</div>
                <h3 className="font-semibold">{item.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default StudentDashboard;
