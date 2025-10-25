import React, { useState, useEffect } from 'react';
// Đảm bảo đường dẫn này đúng:
import ActionButtonImage from "../assets/hocngay.svg"; 

interface FloatingActionButtonProps {
  link: string; // Link URL mà nút sẽ dẫn đến
  delay?: number; 
  animationDuration?: number; 
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  link,
  delay = 1000, 
  animationDuration = 500, 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // --- THAY ĐỔI KÍCH THƯỚC VÀ CÁC THUỘC TÍNH CỐ ĐỊNH ---
  const BUTTON_SIZE = '250px'; 
  
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '0.5rem',  
    right: '0.5rem',   
    zIndex: 1000,
    width: BUTTON_SIZE, 
    height: BUTTON_SIZE,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    
    transition: `transform ${animationDuration}ms ease-out, opacity ${animationDuration}ms ease-out`,
    transform: isVisible 
        ? (isHovered ? 'scale(1.08) rotate(3deg)' : 'scale(1)') 
        : 'scale(0)', 
    opacity: isVisible ? 1 : 0,
    backgroundColor: 'transparent',
    textDecoration: 'none',
    overflow: 'hidden',
    border: 'none', 
  };

  return (
    <a
      href={link}
      // ĐÃ LOẠI BỎ: target="_blank"
      // ĐÃ LOẠI BỎ: rel="noopener noreferrer"
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Bấm vào để học ngay"
    >
      <img 
        src={ActionButtonImage} 
        alt="Học Ngay - Bấm vào đây"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 'inherit',
        }}
      />
    </a>
  );
};

export default FloatingActionButton;