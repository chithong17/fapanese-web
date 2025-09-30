import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { AiOutlineBook, AiOutlineDashboard, AiOutlineQuestionCircle, AiOutlineEdit } from "react-icons/ai";
import { MdLogin, MdPersonAdd } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

interface NavbarProps {
  scrollToSection: (id: string, tab?: "hiragana" | "katakana") => void;
  onAuthClick: (tab: "login" | "signup") => void;
}

const Navbar: React.FC<NavbarProps> = ({ scrollToSection, onAuthClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const menuItems = [
    { name: "VỀ CHÚNG TÔI", link: "/" },
    { name: "TRANG CHỦ", link: "/" },
    { name: "KHÓA HỌC", link: "/courses" },
    { name: "THÀNH TÍCH", link: "/dashboard/student" },
    { name: "GÓC CHIA SẺ", link: "/" },
  ];

  const userMenuItems = [
    { name: "Đăng Nhập", icon: <MdLogin />, action: () => onAuthClick("login") },
    { name: "Đăng Ký", icon: <MdPersonAdd />, action: () => onAuthClick("signup") },
    { name: "Khóa Học", icon: <AiOutlineBook />, action: () => console.log("Go to courses") },
    { name: "Dashboard", icon: <AiOutlineDashboard />, action: () => console.log("Go to dashboard") },
    { name: "Hướng Dẫn Sử Dụng", icon: <AiOutlineQuestionCircle />, action: () => console.log("Go to guide") },
    { name: "Edit Profile", icon: <AiOutlineEdit />, action: () => console.log("Go to edit profile") },
  ];

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center h-12">
              <img src={logo} alt="Fapanese Logo" className="w-40 h-40 object-contain" />
            </a>
          </div>

          {/* Menu */}
          <div className="hidden md:flex flex-grow justify-center">
            <div className="flex space-x-12 items-center">
              {menuItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  className="text-gray-800 font-bold relative group transition-all"
                  style={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  <span className="group-hover:bg-gradient-to-r group-hover:from-[#80D9E6] group-hover:to-[#A4EBF2] group-hover:bg-clip-text group-hover:text-transparent transition-colors">
                    {item.name}
                  </span>
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] group-hover:w-full transition-all"></span>
                </a>
              ))}

              {/* Dropdown: Bảng Chữ Cái */}
              <div className="relative">
                <span
                  className="font-bold cursor-pointer transition-colors group-hover:bg-gradient-to-r group-hover:from-[#80D9E6] group-hover:to-[#A4EBF2] group-hover:bg-clip-text group-hover:text-transparent"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  BẢNG CHỮ CÁI
                </span>
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] group-hover:w-full transition-all"></span>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-40 bg-white rounded-xl shadow-lg z-50"
                    >
                      <button
                        onClick={() => {
                          scrollToSection("alphabet", "hiragana");
                          setDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-xl font-medium flex items-center gap-2"
                      >
                        Hiragana
                      </button>
                      <button
                        onClick={() => {
                          scrollToSection("alphabet", "katakana");
                          setDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-xl font-medium flex items-center gap-2"
                      >
                        Katakana
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* User Icon + Dropdown */}
          <div className="relative flex items-center gap-4">
            <div
              className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <FaUserCircle  />
              </motion.div>
            </div>

            <AnimatePresence>
              {userDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {userMenuItems.map((item, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => {
                        item.action();
                        setUserDropdownOpen(false);
                      }}
                      whileHover={{ backgroundColor: "rgba(243,244,246,1)" }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-none font-medium text-gray-800 transition-colors"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
