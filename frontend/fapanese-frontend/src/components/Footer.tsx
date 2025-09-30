import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import ScrollReveal from "./ScrollReveal";

const Footer: React.FC = () => {
  return (
    <ScrollReveal>
      <footer className="bg-white text-black py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 items-start">
          {/* Logo & About */}
          <div className="flex flex-col space-y-4">
            <img
              src={logo}
              alt="Fapanese Logo"
              className="h-16 w-auto"
            />
            <p className="text-black/70 text-sm sm:text-base">
              Học tiếng Nhật thông minh với AI. Cung cấp lộ trình học tối ưu, dễ
              hiểu và hiệu quả.
            </p>
            <p className="text-xs sm:text-sm text-black/50">
              © 2025 Fapanese. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-2">
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <a href="#" className="hover:underline text-black/70 text-sm sm:text-base">
              Trang Chủ
            </a>
            <a href="#" className="hover:underline text-black/70 text-sm sm:text-base">
              Khóa Học
            </a>
            <a href="#" className="hover:underline text-black/70 text-sm sm:text-base">
              Về Chúng Tôi
            </a>
            <a href="#" className="hover:underline text-black/70 text-sm sm:text-base">
              Liên Hệ
            </a>
          </div>

          {/* Courses */}
          <div className="flex flex-col space-y-2">
            <h3 className="font-bold text-lg mb-4">Khóa Học</h3>
            <a href="#" className="hover:underline text-black/70 text-sm sm:text-base">
              Cơ Bản
            </a>
            <a href="#" className="hover:underline text-black/70 text-sm sm:text-base">
              Trung Cấp
            </a>
            <a href="#" className="hover:underline text-black/70 text-sm sm:text-base">
              Nâng Cao
            </a>
            <a href="#" className="hover:underline text-black/70 text-sm sm:text-base">
              Luyện Thi JLPT
            </a>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-lg mb-4">Liên Hệ</h3>
            <p className="text-black/70 text-sm sm:text-base">Email: support@fapanese.com</p>
            <p className="text-black/70 text-sm sm:text-base">Hotline: +84 123 456 789</p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 sm:p-3 bg-black/10 rounded-full hover:bg-black/20 transition-colors"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="p-2 sm:p-3 bg-black/10 rounded-full hover:bg-black/20 transition-colors"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="p-2 sm:p-3 bg-black/10 rounded-full hover:bg-black/20 transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                className="p-2 sm:p-3 bg-black/10 rounded-full hover:bg-black/20 transition-colors"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="mt-12 text-center text-black/50 text-xs sm:text-sm">
          Designed with ❤️ by Fapanese Team
        </div>
      </footer>
    </ScrollReveal>
  );
};

export default Footer;
