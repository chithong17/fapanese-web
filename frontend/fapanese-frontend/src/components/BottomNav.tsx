import React from "react";

interface BottomNavProps {
  scrollToSection: (id: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ scrollToSection }) => {
  const sections = [
    { id: "test", label: "KIỂM TRA" },
    { id: "materials", label: "NHẬN QUÀ" },
    { id: "consult", label: "TƯ VẤN" },
    { id: "feedback", label: "CẢM NHẬN" },
    { id: "library", label: "TÀI LIỆU", href: "https://www.tiengnhatdongian.com/tong-hop-toan-bo-giao-trinh/" },
    { id: "jlpt", label: "THI THỬ" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[900]">
      <div className="flex justify-between bg-amber-100 border rounded-3xl shadow-amber-500 shadow-md px-6 backdrop-blur-md max-w-4xl h-10 w-400">
        {sections.map((section) =>
          section.href ? (
            <a
              key={section.id}
              href={section.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-amber-100 hover:scale-105 rounded-3xl hover:shadow-xl transition-transform duration-300 font-extrabold text-gray-800 text-center flex items-center justify-center"
            >
              {section.label}
            </a>
          ) : (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="flex-1 bg-amber-100 hover:scale-105 rounded-3xl hover:shadow-xl transition-transform duration-300 font-extrabold text-gray-800 text-center"
            >
              {section.label}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default BottomNav;
