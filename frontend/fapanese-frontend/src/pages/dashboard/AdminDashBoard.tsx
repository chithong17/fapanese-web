import React, { useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants, type ForwardRefComponent, type HTMLMotionProps } from "framer-motion"; 
import StudentManagementPage from "./StudentManagementPage";

// --- IMPORTS ICON MỚI (TỪ REACT ICONS) ---
import { IoIosLogOut } from "react-icons/io"; // Biểu tượng đăng xuất
import { AiOutlineTeam, AiOutlineBook } from "react-icons/ai"; // Biểu tượng học sinh và khóa học
// import CourseManagementPage from "./CourseManagementPage"; 


// --- CẤU HÌNH TONE MÀU TRẮNG-XÁM CHỦ ĐẠO ---
const PRIMARY_BLUE = "#00BCD4"; 
const PRIMARY_TEXT = "text-cyan-600"; 
const DASHBOARD_BG = "bg-white"; 
const TOPBAR_BG = "bg-white"; 
const SIDEBAR_BG = "bg-white"; 

// --- MÀU LOGOUT: CYAN GRADIENT ---
const LOGOUT_COLOR_START = "#00BCD4"; 
const LOGOUT_COLOR_END = "#4DD0E1"; 
const LOGOUT_HOVER_BG = "hover:bg-cyan-500";
// MÀU DANGER cho nút Xác nhận Đăng xuất
const DANGER_COLOR = "bg-red-600";
const DANGER_HOVER = "hover:bg-red-700";


// --- CẤU HÌNH ANIMATION POPUP ---
const popupVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

// --- ICON PLACEHOLDERS MỚI (SỬ DỤNG REACT ICONS) ---
const UsersIcon = ({ className = "" }) => <AiOutlineTeam className={`text-2xl ${className}`} />; 
const BookOpenIcon = ({ className = "" }) => <AiOutlineBook className={`text-2xl ${className}`} />;
const LogoutIcon = ({ className = "" }) => <IoIosLogOut className={`text-xl ${className}`} />;


// --- DỮ LIỆU MENU ---
const ADMIN_MENU = [
    { name: "Quản lý học sinh", path: "/admin/students", icon: UsersIcon },
    { name: "Quản lý khóa học", path: "/admin/courses", pathMatch: "courses", icon: BookOpenIcon },
];

const MotionLink = motion(Link);


export default function AdminDashBoard() {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const currentPath = window.location.pathname; 
    
    const isActive = (path: string) => currentPath.includes(path);

    const handleLogoutConfirm = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        window.dispatchEvent(new Event("logout"));
        navigate("/"); 
        setShowLogoutModal(false);
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    return (
        <div className={`min-h-screen flex flex-col ${DASHBOARD_BG}`}>
            
            {/* 1. TOP NAVIGATION BAR (Trắng) */}
            <div className={`flex items-center justify-between px-8 py-4 border-b border-gray-100 shadow-sm z-10`} style={{ backgroundColor: TOPBAR_BG }}>
                <h2 className={`text-3xl font-extrabold tracking-wider text-gray-800`}>
                    ADMIN <span className={PRIMARY_TEXT}>PANEL</span>
                </h2>

                {/* Nút Đăng xuất: CYAN GRADIENT + ICON TRẮNG */}
                <motion.button
                    onClick={handleLogout}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-sm text-white transition duration-300 shadow-lg 
                        bg-gradient-to-r from-[${LOGOUT_COLOR_START}] to-[${LOGOUT_COLOR_END}] ${LOGOUT_HOVER_BG}
                    `}
                    whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 188, 212, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                >
                    <LogoutIcon className="text-white text-base" /> 
                    <span>Đăng xuất</span>
                </motion.button>
            </div>

            {/* 2. BODY CONTAINER (Sidebar và Main Content) */}
            <div className="flex flex-1">
                
                {/* 2a. MINI SIDEBAR (Navigation Cột dọc - Icon Trắng khi Active) */}
                <nav className={`w-16 flex-shrink-0 flex flex-col items-center py-4 border-r border-gray-100`} style={{ backgroundColor: SIDEBAR_BG }}>
                    {ADMIN_MENU.map((item) => {
                        const active = isActive(item.path);
                        const IconComponent = item.icon;
                        
                        return (
                            <MotionLink
                                key={item.path}
                                to={item.path}
                                title={item.name}
                                className={`
                                    relative flex items-center justify-center w-12 h-12 my-2 rounded-lg transition duration-200 group
                                    ${active 
                                        ? // Active: Gradient Xanh Cyan + ICON TRẮNG
                                          `bg-gradient-to-br from-[#9bced5] to-[#9cdfe8] shadow-lg text-white` 
                                        : // Inactive: Màu xám, hover nền xám nhạt
                                          `text-gray-500 hover:bg-gray-100 hover:text-gray-700`
                                    }
                                `}
                                whileTap={{ scale: 0.9 }}
                            >
                                {/* ICON SẼ MÀU TRẮNG KHI ACTIVE VÀ MÀU XÁM KHI INACTIVE/HOVER */}
                                <IconComponent className={active ? 'text-white text-2xl' : 'text-gray-500 group-hover:text-gray-700'} />
                                
                                {/* Tooltip */}
                                <span className="absolute left-full ml-3 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 transition duration-300 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-20">
                                    {item.name}
                                </span>
                            </MotionLink>
                        );
                    })}
                </nav>

                {/* 2b. MAIN CONTENT AREA (Trắng ngà) */}
                <div className="flex-1 p-8 overflow-y-auto bg-gray-50"> 
                    {/* Tiêu đề chính */}
                    <h1 className={`text-3xl font-bold text-gray-800 mb-8 border-b border-gray-200 pb-3`}>
                        {ADMIN_MENU.find(item => isActive(item.path))?.name || "Bảng điều khiển chính"}
                    </h1>
                    
                    {/* Vùng Nội dung (Trắng tinh) */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 min-h-[calc(100vh-140px)]">
                        <Routes>
                            <Route path="students" element={<StudentManagementPage />} />
                            {/* <Route path="courses" element={<CourseManagementPage />} /> */}
                            <Route 
                                index 
                                element={
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="text-center text-xl text-gray-500 pt-20"
                                    >
                                        Vui lòng chọn mục từ thanh bên trái để bắt đầu quản lý.
                                    </motion.div>
                                } 
                            />
                        </Routes>
                    </div>
                </div>
            </div>
            
            {/* 3. Popup Xác nhận Đăng xuất (Modal - Đã tinh chỉnh) */}
            <AnimatePresence>
                {showLogoutModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => setShowLogoutModal(false)}
                    >
                        <motion.div
                            className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full"
                            variants={popupVariants}
                            onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng modal khi click bên trong
                        >
                            <h3 className={`text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center ${PRIMARY_TEXT}`}>
                                {/* Sử dụng Icon và màu Cyan cho tiêu đề */}
                                <LogoutIcon className="text-3xl mr-2" /> Xác nhận Đăng xuất
                            </h3>
                            
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn rời khỏi Khu vực Quản trị ngay bây giờ?
                            </p>
                            
                            <div className="flex justify-end space-x-3">
                                {/* Nút Hủy (Trắng/Xám) */}
                                <motion.button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition duration-150"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Hủy
                                </motion.button>
                                
                                {/* Nút Xác nhận (Đỏ/Danger - Hình dạng pill/full rounded và shadow) */}
                                <motion.button
                                    onClick={handleLogoutConfirm}
                                    className={`px-6 py-2 rounded-full ${DANGER_COLOR} text-white font-bold ${DANGER_HOVER} transition duration-150 shadow-lg`}
                                    // Thêm shadow màu đỏ nhẹ khi hover
                                    whileHover={{ scale: 1.05, boxShadow: "0 4px 10px rgba(239, 68, 68, 0.4)" }} 
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Đăng xuất
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}