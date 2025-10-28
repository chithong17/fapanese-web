import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import {
  AiOutlineBook,
  AiOutlineDashboard,
  AiOutlineEdit,
} from "react-icons/ai";
import { MdLogout } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";
import logouser from "../assets/logouser.png";
import LogoutPopup from "./LogoutPopup";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface NavbarProps {
  scrollToSection: (id: string, tab?: "hiragana" | "katakana") => void;
  onAuthClick: (tab: "login" | "signup") => void;
  userDropdownOpen: boolean;
  setUserDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({
  scrollToSection,
  onAuthClick,
  userDropdownOpen,
  setUserDropdownOpen,
}) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<string | null>(
    localStorage.getItem("firstName") || null
  );
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    campus?: string;
    dob?: string;
  } | null>(null);

  // --- Fetch profile using token ---
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(
        "http://localhost:8080/fapanese/api/users/profile",
        { headers: { Authorization: `Bearer ${token}` } } // <-- token ở đây
      );
      if (res.data && res.data.result) {
        setUserProfile(res.data.result);
        setUser(res.data.result.email); // set email từ profile
      }
    } catch (err) {
      console.error("Lỗi fetch profile:", err);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const handleLogin = () => {
      fetchProfile();
    };
    const handleLogout = () => setUser(null);

    window.addEventListener("loginSuccess", handleLogin);
    window.addEventListener("logoutSuccess", handleLogout);

    if (localStorage.getItem("token")) fetchProfile();

    return () => {
      window.removeEventListener("loginSuccess", handleLogin);
      window.removeEventListener("logoutSuccess", handleLogout);
    };
  }, []);

  const menuItems = [
    { name: "VỀ CHÚNG TÔI", link: "/aboutus" },
    { name: "TRANG CHỦ", link: "/" },
    { name: "KHÓA HỌC", link: "/courses" },
    // { name: "THÀNH TÍCH", link: "/dashboard/student" },
    { name: "LỚP HỌC", link: "/student/materials" },
    { name: "GÓC CHIA SẺ", link: "/" },
  ];

  const handleMenuClick = (item: { name: string; link: string }) => {
  if (item.name === "LỚP HỌC") {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập trước khi xem lớp học!");
      return;
    }
    // 👉 Không gọi API ở Navbar. Điều hướng thẳng.
    navigate("/student/materials");
  } else {
    navigate(item.link);
  }
};


  const handleLogoutClick = () => setLogoutOpen(true);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.dispatchEvent(new Event("logoutSuccess"));
    setLogoutOpen(false);
    window.location.reload();
  };

  const userMenuItems = user
    ? [
        {
          name: "Khóa Học",
          icon: <AiOutlineBook />,
          action: () => console.log("Go to courses"),
        },
        {
          name: "Dashboard",
          icon: <AiOutlineDashboard />,
          action: () => console.log("Go to dashboard"),
        },
        {
          name: "Edit Profile",
          icon: <AiOutlineEdit />,
          action: () => navigate("/profile"),
        },
        { name: "Đăng Xuất", icon: <MdLogout />, action: handleLogoutClick },
      ]
    : [];

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-[2000] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20 items-center relative">
          {/* Logo */}
          <div className="flex-shrink-0 -ml-10 w-32 h-16 overflow-hidden flex items-center">
            <a href="/" className="flex items-center">
              <img
                src={logo}
                alt="Fapanese Logo"
                className="w-full h-full object-cover"
              />
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-grow justify-center">
            <div className="flex space-x-12 items-center">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMenuClick(item)}
                  className="text-gray-800 font-bold relative group transition-all"
                >
                  <span className="group-hover:bg-gradient-to-r group-hover:from-[#80D9E6] group-hover:to-[#A4EBF2] group-hover:bg-clip-text group-hover:text-transparent transition-colors">
                    {item.name}
                  </span>
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] group-hover:w-full transition-all"></span>
                </button>
              ))}

              {/* Dropdown bảng chữ cái */}
              <div className="relative">
                <span
                  className="font-bold cursor-pointer transition-colors group-hover:bg-gradient-to-r group-hover:from-[#80D9E6] group-hover:to-[#A4EBF2] group-hover:bg-clip-text group-hover:text-transparent"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  BẢNG CHỮ CÁI
                </span>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-40 bg-white rounded-xl shadow-lg z-[2100]"
                    >
                      <button
                        onClick={() => {
                          scrollToSection("alphabet", "hiragana");
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-xl font-medium flex items-center gap-2"
                      >
                        Hiragana
                      </button>
                      <button
                        onClick={() => {
                          scrollToSection("alphabet", "katakana");
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-xl font-medium flex items-center gap-2"
                      >
                        Katakana
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-800 hover:text-blue-500 focus:outline-none"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* User dropdown */}
          <div className="relative flex items-center gap-4 -mr-30">
            {user ? (
              <>
                <div
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img src={logouser} className="h-10" />
                  </motion.div>
                </div>
                <span className="text-gray-700 font-medium">
                  Xin chào,
                  <span className="font-semibold text-[#0b7a75]">
                    {userProfile
                      ? `${userProfile.firstName} ${userProfile.lastName}`
                      : "Đang tải..."}
                  </span>
                </span>
              </>
            ) : (
              <button
                onClick={() => onAuthClick("login")}
                className="bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white py-2 px-5 rounded-4xl font-bold shadow-md transform transition duration-300 hover:scale-105 hover:shadow-xl hover:opacity-90 mr-20"
              >
                Đăng Nhập
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 py-2 space-y-2">
            {menuItems.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                className="block text-gray-800 hover:text-blue-500 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* User dropdown portal */}
      {userDropdownOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="fixed right-6 top-20 w-60 bg-white rounded-xl shadow-xl z-[9999] overflow-visible"
            >
              {userMenuItems.map((item, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    setUserDropdownOpen(false);
                    item.action();
                  }}
                  whileHover={{ backgroundColor: "rgba(243,244,246,1)" }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-none font-medium text-gray-800 transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}

      {/* Logout popup */}
      <LogoutPopup
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
    </nav>
  );
};

export default Navbar;
