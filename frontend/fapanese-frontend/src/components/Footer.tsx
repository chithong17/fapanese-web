import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-black py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Logo & About */}
        <div className="flex flex-col space-y-4">
          <div className="text-3xl font-extrabold">Fapanese</div>
          <p className="text-black/70">
            Học tiếng Nhật thông minh với AI. Cung cấp lộ trình học tối ưu, dễ hiểu và hiệu quả.
          </p>
          <p className="text-sm text-black/50">© 2025 Fapanese. All rights reserved.</p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-2">
          <h3 className="font-bold text-lg mb-2">Quick Links</h3>
          <a href="#" className="hover:underline text-black/70">Trang Chủ</a>
          <a href="#" className="hover:underline text-black/70">Khóa Học</a>
          <a href="#" className="hover:underline text-black/70">Về Chúng Tôi</a>
          <a href="#" className="hover:underline text-black/70">Liên Hệ</a>
        </div>

        {/* Courses */}
        <div className="flex flex-col space-y-2">
          <h3 className="font-bold text-lg mb-2">Khóa Học</h3>
          <a href="#" className="hover:underline text-black/70">Cơ Bản</a>
          <a href="#" className="hover:underline text-black/70">Trung Cấp</a>
          <a href="#" className="hover:underline text-black/70">Nâng Cao</a>
          <a href="#" className="hover:underline text-black/70">Luyện Thi JLPT</a>
        </div>

        {/* Contact & Social */}
        <div className="flex flex-col space-y-4">
          <h3 className="font-bold text-lg mb-2">Liên Hệ</h3>
          <p className="text-black/70">Email: support@fapanese.com</p>
          <p className="text-black/70">Hotline: +84 123 456 789</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="p-3 bg-black/10 rounded-full hover:bg-black/20 transition-colors">
              <FaFacebookF />
            </a>
            <a href="#" className="p-3 bg-black/10 rounded-full hover:bg-black/20 transition-colors">
              <FaTwitter />
            </a>
            <a href="#" className="p-3 bg-black/10 rounded-full hover:bg-black/20 transition-colors">
              <FaInstagram />
            </a>
            <a href="#" className="p-3 bg-black/10 rounded-full hover:bg-black/20 transition-colors">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom footer */}
      <div className="mt-12 text-center text-black/50 text-sm">
        Designed with ❤️ by Fapanese Team
      </div>
    </footer>
  );
};

export default Footer;
