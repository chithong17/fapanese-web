import React from "react";

interface BottomNavProps {
  scrollToSection: (id: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ scrollToSection }) => {
  const sections = [
    { id: "test", label: "HỌC NGAY!" },
    { id: "materials", label: "NHẬN QUÀ" },
    { id: "consult", label: "TƯ VẤN" },
    { id: "feedback", label: "CẢM NHẬN" },
    { id: "library", label: "TÀI LIỆU", href: "https://www.tiengnhatdongian.com/tong-hop-toan-bo-giao-trinh/" },
    { id: "jlpt", label: "THI THỬ" },
  ];

  // Định nghĩa các lớp CSS nền tảng từ code gốc của bạn
  const baseButtonClasses = 
    "flex-1 bg-amber-100 hover:scale-105 rounded-2xl hover:shadow-xl " +
    "transition-transform duration-300 font-extrabold text-gray-800 text-center flex items-center justify-center";

  // Định nghĩa các lớp CSS nổi bật cho nút "HỌC NGAY!"
  const primaryButtonClasses = 
    "bg-amber-400 text-black shadow-amber-500 hover:bg-amber-500 hover:scale-110 rounded-0xl";

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[900]">
      {/* Container chính giữ nguyên layout cũ */}
      <div className="flex justify-between bg-amber-100 border rounded-2xl shadow-amber-500 shadow-md px-6 backdrop-blur-md max-w-4xl h-12 w-400 p-1">
        {sections.map((section) => {
          const isPrimary = section.id === "test";
          
          // Kết hợp các lớp: Base Class (hoặc Link Class) + Primary Override Class (nếu là nút chính)
          const finalClasses = isPrimary 
            ? `${baseButtonClasses} ${primaryButtonClasses}`
            : baseButtonClasses;

          return section.href ? (
            <a
              key={section.id}
              href={section.href}
              target="_blank"
              rel="noopener noreferrer"
              className={finalClasses}
            >
              {section.label}
            </a>
          ) : (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={finalClasses}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;