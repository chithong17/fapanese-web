import React, { useEffect, useState } from "react";
import { FaQuoteLeft } from "react-icons/fa"; // icon ngoặc kép
import ScrollReveal from "./ScrollReveal";
const quotes = [
  "Học tiếng Nhật với phương pháp hiện đại và hiệu quả.",
  "Đội ngũ phát triển giàu kinh nghiệm, tâm huyết với học viên.",
  "Cá nhân hóa lộ trình học theo năng lực từng học viên.",
  "Học tập vui vẻ và kết nối cùng cộng đồng học viên.",
];

const WhyUs: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollReveal>
      <section className="w-full py-20 bg-gray-100 flex flex-col items-center text-center px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          <span className="text-[#80D9E6]">FAPANESE</span>{" "}
          <span className="text-gray-900">LÀ CỖ MÁY TẬN TÌNH NHẤT</span>
        </h2>

        <div className="relative h-32 w-full max-w-3xl flex items-center justify-center">
          {quotes.map((quote, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-start justify-center ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Sử dụng size và color thay vì className */}
              <FaQuoteLeft size={32} color="#80D9E6" />
              <p className="text-xl md:text-2xl font-semibold text-gray-800 max-w-2xl">
                {quote}
              </p>
            </div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
};

export default WhyUs;
