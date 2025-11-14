import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { motion, AnimatePresence, type Variants } from "framer-motion"; // Thêm AnimatePresence và Variants

// --- CẤU HÌNH TONE MÀU CYAN CHỦ ĐẠO (Theo code bạn cung cấp) ---
const PRIMARY_TEXT = "text-cyan-600";
const LOGOUT_COLOR_START = "#00BCD4"; // Cyan
const LOGOUT_COLOR_END = "#4DD0E1"; // Cyan nhạt hơn
const LOGOUT_HOVER_BG = "hover:bg-cyan-500";
// MÀU DANGER cho nút Xác nhận Đăng xuất
const DANGER_COLOR = "bg-red-600";
const DANGER_HOVER = "hover:bg-red-700";

// --- CẤU HÌNH ANIMATION POPUP (Giữ nguyên như Admin) ---
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

const LogoutIcon = ({ className = "" }) => <IoIosLogOut className={`text-xl ${className}`} />;


export default function TeacherPanelLayout() {
    const navigate = useNavigate();
    // Đổi tên state để rõ ràng hơn và sử dụng cho Modal
    const [showLogoutModal, setShowLogoutModal] = useState(false); 

    const handleLogoutConfirm = () => {
        // Logic đăng xuất (Không thay đổi)
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        // Gửi sự kiện để đồng bộ hóa nếu cần
        window.dispatchEvent(new Event("logout")); 
        navigate("/");
        setShowLogoutModal(false);
    };

    // Bắt sự kiện click nút Đăng xuất trên Topbar để mở Modal
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            
            {/* Top Header (Sử dụng style hiện đại hơn) */}
            <header className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b border-gray-100 z-10">
                <h1 className={`text-3xl font-extrabold tracking-wider text-gray-800`}>
                    TEACHER <span className={PRIMARY_TEXT}>PORTAL</span>
                </h1>

                {/* Nút Đăng xuất: CYAN GRADIENT + Animation */}
                <motion.button
                    onClick={handleLogoutClick} // Mở Modal
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-sm text-white transition duration-300 shadow-lg 
                        bg-gradient-to-r from-[${LOGOUT_COLOR_START}] to-[${LOGOUT_COLOR_END}] ${LOGOUT_HOVER_BG}
                    `}
                    whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 188, 212, 0.4)" }} // Shadow Cyan
                    whileTap={{ scale: 0.98 }}
                >
                    <IoIosLogOut className="text-white text-base" />
                    <span>Đăng xuất</span>
                </motion.button>
            </header>

            {/* Main Content (Sử dụng style box container) */}
            <main className="flex-1 p-8 rounded-2xl shadow-xl"> 
                {/* Container chính cho nội dung Outlet (Giống Admin) */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-full">
                    <Outlet />
                </div>
            </main>

            {/* Popup Xác nhận Đăng xuất (Modal - Giống Admin) */}
            <AnimatePresence>
                {showLogoutModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-30 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => setShowLogoutModal(false)}
                    >
                        <motion.div
                            className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full"
                            variants={popupVariants}
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <h3 className={`text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center text-red-600`}>
                                <LogoutIcon className="text-3xl mr-2" /> Xác nhận Đăng xuất
                            </h3>
                            
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn rời khỏi Khu vực Giảng viên ngay bây giờ?
                            </p>
                            
                            <div className="flex justify-end space-x-3">
                                {/* Nút Hủy */}
                                <motion.button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition duration-150"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Hủy
                                </motion.button>
                                
                                {/* Nút Xác nhận (Đỏ/Danger) */}
                                <motion.button
                                    onClick={handleLogoutConfirm}
                                    className={`px-6 py-2 rounded-full ${DANGER_COLOR} text-white font-bold ${DANGER_HOVER} transition duration-150 shadow-lg`}
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