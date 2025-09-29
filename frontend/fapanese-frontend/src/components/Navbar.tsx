import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";

const UserIcon = FaUserCircle as React.ElementType;

interface NavbarProps {
  scrollToSection: (id: string, tab?: "hiragana" | "katakana") => void;
  onAuthClick: (tab: "login" | "signup") => void;
}

const Navbar: React.FC<NavbarProps> = ({ scrollToSection, onAuthClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menuItems = [
    { name: "VỀ CHÚNG TÔI", link: "/" },
    { name: "TRANG CHỦ", link: "/" },
    { name: "KHÓA HỌC", link: "/" },
    { name: "THÀNH TÍCH", link: "/" },
    { name: "GÓC CHIA SẺ", link: "/" },
  ];

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20 items-center">

          {/* Logo */}
          <div className="flex-shrink-0 -ml-30">
            <a href="/" className="flex items-center  h-40">
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

                <div
                  className={`absolute top-full mt-2 w-40 bg-white rounded-xl shadow-lg transition-all z-50 ${
                    dropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
                  }`}
                >
                  <button
                    onClick={() => {
                      scrollToSection("alphabet", "hiragana");
                      setDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-xl font-medium"
                  >
                    Hiragana
                  </button>
                  <button
                    onClick={() => {
                      scrollToSection("alphabet", "katakana");
                      setDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-xl font-medium"
                  >
                    Katakana
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User Icon + Login/Sign Up */}
          <div className="flex items-center gap-4 -mr-50">
            {/* User Icon */}
            <div className="p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer group">
              <UserIcon className="text-3xl text-gray-700 group-hover:bg-gradient-to-r group-hover:from-[#80D9E6] group-hover:to-[#A4EBF2] group-hover:bg-clip-text group-hover:text-transparent transition-colors" />
            </div>

            {/* Login & Sign Up */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAuthClick("login")}
                className="px-4 py-1 rounded-lg font-medium text-gray-700 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => onAuthClick("signup")}
                className="px-4 py-1 rounded-lg font-medium text-gray-700 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Đăng ký
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
