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
    { id: "library", label: "TÀI LIỆU" },
    { id: "jlpt", label: "THI THỬ" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999]">
  <div className="flex justify-between bg-amber-100 border rounded-3xl shadow-amber-500 shadow-md px-6 py-3 backdrop-blur-md max-w-4xl h-15 w-400">
    {sections.map((section) => (
      <button
        key={section.id}
        onClick={() => scrollToSection(section.id)}
        className="flex-1 mx-1 px-3 py-2 bg-amber-100 hover:scale-105 hover:shadow-xl transition-transform duration-300 font-extrabold text-gray-800 text-center"
      >
        {section.label}
      </button>
    ))}
  </div> 
</div>
  );
};

export default BottomNav;
