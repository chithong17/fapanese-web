import React from "react";
import ScrollReveal from "./ScrollReveal";
import featureImage from "../assets/aifeature.jpg"; // Thay bằng đường dẫn ảnh phù hợp
const FeatureSection: React.FC = () => {
  return (
    <ScrollReveal>
      <section className="w-full py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Text content */}
          <div className="lg:w-1/2 flex flex-col gap-6 text-center lg:text-left">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#80D9E6]">
              Feature Section AI Technology
            </h3>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              Học tiếng Nhật thông minh với AI
            </h2>
            <p className="text-gray-700 text-base sm:text-lg">
              Phương pháp học tiếng Nhật hiện đại với công nghệ AI, mang đến
              trải nghiệm học tập cá nhân hóa và hiệu quả.
            </p>

            {/* Features list */}
            <ul className="mt-6 flex flex-col gap-4">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 bg-[#1E88A8] rounded-full mt-1.5"></div>
                <p className="font-extrabold text-gray-900 text-sm sm:text-base">
                  AI phân tích năng lực – Phương pháp học thông minh được cá
                  nhân hóa theo từng học viên
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 bg-[#1E88A8] rounded-full mt-1.5"></div>
                <p className="font-extrabold text-gray-900 text-sm sm:text-base">
                  AI phân tích ngữ pháp – Hệ thống phân tích ngữ pháp tự động
                  giúp bạn hiểu sâu hơn
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 bg-[#1E88A8] rounded-full mt-1.5"></div>
                <p className="font-extrabold text-gray-900 text-sm sm:text-base">
                  Học tập với nhóm học – Tạo cơ hội giao lưu và thực hành với
                  các học viên khác
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 bg-[#1E88A8] rounded-full mt-1.5"></div>
                <p className="font-extrabold text-gray-900 text-sm sm:text-base">
                  Phương pháp học tiếng Việt – Ứng dụng phương pháp học tiếng
                  Việt để tiếp cận tiếng Nhật hiệu quả
                </p>
              </li>
            </ul>

            <div className="mt-8">
              <a
                href="/courses"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#1E88A8] text-white font-bold rounded-xl shadow-lg hover:bg-[#166B8C] transition"
              >
                Học ngay
              </a>
            </div>
          </div>

          {/* Right: Image */}
          <div className="lg:w-1/2 flex justify-center">
            <img
              src={featureImage}
              alt="AI Feature"
              className="w-full max-w-xs sm:max-w-md lg:max-w-lg rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
};

export default FeatureSection;
