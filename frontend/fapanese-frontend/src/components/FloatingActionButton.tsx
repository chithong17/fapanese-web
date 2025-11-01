import React, { useState, useEffect } from "react";
import ActionButtonImage from "../assets/hocngay.svg";
import ActionButtonImage2 from "../assets/ai-float.svg";

interface FloatingActionButtonProps {
  delay?: number;
  animationDuration?: number;
  leftSize?: string;
  rightSize?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  delay = 800,
  animationDuration = 500,
  leftSize = "350px",
  rightSize = "200px",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const baseStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: `transform ${animationDuration}ms ease-out, opacity ${animationDuration}ms ease-out`,
    opacity: isVisible ? 1 : 0,
    backgroundColor: "transparent",
    overflow: "visible",
    border: "none",
    animation: isVisible ? "float 3s ease-in-out infinite" : "none",
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transition: "filter 0.3s ease, transform 0.3s ease",
  };

  return (
    <>
      {/* --- HÌNH TRÁI (AI FLOAT - INTERVIEW PRACTICE) --- */}
      <a
        href="/interview-practice"
        style={{
          ...baseStyle,
          left: "-3rem",
          bottom: "-4rem", // 👈 thấp hơn hình bên phải
          width: leftSize,
          height: leftSize,
          transform: isVisible
            ? hovered === "left"
              ? "scale(1.12)"
              : "scale(1)"
            : "scale(0)",
          filter:
            hovered === "left"
              ? "drop-shadow(0 0 20px rgba(6,182,212,0.6))"
              : "drop-shadow(0 0 8px rgba(6,182,212,0.3))",
        }}
        onMouseEnter={() => setHovered("left")}
        onMouseLeave={() => setHovered(null)}
        aria-label="AI hỗ trợ luyện phỏng vấn"
      >
        <img src={ActionButtonImage2} alt="AI hỗ trợ luyện phỏng vấn" style={imageStyle} />
      </a>

      {/* --- HÌNH PHẢI (HỌC NGAY - KHÓA HỌC) --- */}
      <a
        href="/courses"
        style={{
          ...baseStyle,
          right: "0.5rem",
          bottom: "1rem", // 👈 cao hơn chút để cân đối
          width: rightSize,
          height: rightSize,
          transform: isVisible
            ? hovered === "right"
              ? "scale(1.12)"
              : "scale(1)"
            : "scale(0)",
          filter:
            hovered === "right"
              ? "drop-shadow(0 0 20px rgba(37,99,235,0.6))"
              : "drop-shadow(0 0 8px rgba(37,99,235,0.3))",
        }}
        onMouseEnter={() => setHovered("right")}
        onMouseLeave={() => setHovered(null)}
        aria-label="Xem khóa học ngay"
      >
        <img src={ActionButtonImage} alt="Học ngay" style={imageStyle} />
      </a>

      {/* --- Hiệu ứng nổi --- */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}
      </style>
    </>
  );
};

export default FloatingActionButton;
