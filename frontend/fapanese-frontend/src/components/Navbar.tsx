import { FaUserCircle } from "react-icons/fa";
import React from "react";

const UserIcon = FaUserCircle as React.ElementType;

function Navbar() {
  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          {/* Trái: Logo */}
          <div className="flex-shrink-0">
            <a
              href="/"
              className="text-3xl font-bold text-gray-900 transition-colors relative group"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              <span className="group-hover:bg-gradient-to-r group-hover:from-[#80D9E6] group-hover:to-[#A4EBF2] group-hover:bg-clip-text group-hover:text-transparent transition-colors">
                {/* Fapanese */}
              </span>
            </a>
          </div>

          {/* Giữa: Menu */}
          <div className="hidden md:flex flex-grow justify-center">
            <div className="flex space-x-12">
              {["VỀ CHÚNG TÔI", "TRANG CHỦ", "KHÓA HỌC", "THÀNH TÍCH", "GÓC CHIA SẺ"].map((item, idx) => (
                <a
                  key={idx}
                  href="/"
                  className="text-gray-800 font-bold relative group transition-all"
                  style={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  <span className="group-hover:bg-gradient-to-r group-hover:from-[#80D9E6] group-hover:to-[#A4EBF2] group-hover:bg-clip-text group-hover:text-transparent transition-colors">
                    {item}
                  </span>
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] group-hover:w-full transition-all"></span>
                </a>
              ))}
            </div>
          </div>

          {/* Phải: User icon */}
          <div className="flex items-center space-x-4">
            <div className="p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer group">
              <UserIcon className="text-3xl text-gray-700 group-hover:bg-gradient-to-r group-hover:from-[#80D9E6] group-hover:to-[#A4EBF2] group-hover:bg-clip-text group-hover:text-transparent transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
