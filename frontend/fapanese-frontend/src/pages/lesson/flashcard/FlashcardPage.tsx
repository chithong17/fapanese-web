import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FlashCardArray } from "react-flashcards";
import { FaRandom } from "react-icons/fa"; 

// ⭐ Import API và Type ⭐
import { getVocabulariesByLessonPartId } from "../../../api/vocabulary";
import type { VocabularyResponse } from "../../../types/api";

// --- Hàm Tiện Ích ---
const shuffleArray = <T extends any>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- Định nghĩa Types ---
interface VocabularyItem {
  id: number; wordKana: string; meaning: string;
}
interface Flashcard {
  [key: string]: any; id: number; front: string; back: string;
  timerDuration: number; 
  label: string; // Vẫn cần trong type nhưng sẽ được truyền giá trị rỗng/giả
  currentIndex: number;
}

// --- Component Chính ---

const FlashcardPage: React.FC = () => {
  const { lessonPartId } = useParams<{ lessonPartId: string }>();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialCards, setInitialCards] = useState<Flashcard[]>([]);

  const handleShuffle = () => {
    if (flashcards.length > 0) {
      setFlashcards(shuffleArray(flashcards));
    }
  };

  useEffect(() => {
    const fetchVocabularies = async () => {
      if (!lessonPartId) { setError("Không tìm thấy ID bài học."); setLoading(false); return; }
      const idAsNumber = parseInt(lessonPartId, 10);
      if (isNaN(idAsNumber) || idAsNumber <= 0) { setError("ID bài học không hợp lệ."); setLoading(false); return; }
      
      try {
        const apiResponse: VocabularyResponse = await getVocabulariesByLessonPartId(idAsNumber);
        const vocabularies = apiResponse as unknown as VocabularyItem[];
        const totalCards = vocabularies.length;
        
        const convertedCards: Flashcard[] = vocabularies.map(
          (item: VocabularyItem, index) => ({
            id: item.id, front: item.wordKana, back: item.meaning,
            timerDuration: 0, 
            label: ` `, // ⭐ SỬA: Gán giá trị khoảng trắng để ẩn số thứ tự ⭐
            currentIndex: index,
          })
        );
        
        setInitialCards(convertedCards);
        setFlashcards(convertedCards); 
      } catch (err) {
        setError("Lỗi tải dữ liệu từ API. Vui lòng kiểm tra kết nối hoặc đường dẫn API.");
        console.error("API Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVocabularies();
  }, [lessonPartId]);

  // --- PHẦN JSX CUỐI CÙNG ---

  if (loading) return <div className="text-center p-4">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center p-4 text-red-600">Lỗi: {error}</div>;
  if (flashcards.length === 0) return (<div className="text-center p-4 text-gray-500">Không có từ vựng nào.</div>);

  return (
    // Thay đổi nền trang thành gradient Cyan nhẹ nhàng
    <div className="p-4 max-w-3xl mx-auto pt-40 min-h-screen ">
      
      <h1 className="text-4xl font-extralight tracking-wide text-center text-gray-800 mb-10">
        <span className="font-medium" style={{ color: '#00BCD4' }}>TẬP TRUNG</span> HỌC TỪ <span className="text-gray-500">#{lessonPartId}</span>
      </h1>
      
      {/* Nút Xáo trộn Tùy chỉnh (Đổ bóng Neumorphism - Tone Cyan) */}
      <div className="flex justify-end mb-8">
          <button 
              onClick={handleShuffle}
              className="flex items-center px-5 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition duration-300 
                         shadow-lg transform hover:scale-105 active:shadow-inner"
              style={{ 
                  // Đổ bóng Neumorphism trên nền sáng
                  boxShadow: '4px 4px 8px #c8c8c8, -4px -4px 8px #ffffff', 
              }}
              title="Xáo trộn thứ tự các thẻ"
          >
              <FaRandom className="mr-2" style={{ color: '#00BCD4' }}/> 
              XÁO TRỘN
          </button>
      </div>

      <FlashCardArray
        cards={flashcards}
        width="100%"
        label={` `}
        timerDuration={1}
        
       
        
        // 1. Style tổng thể (Container)
        FlashcardArrayStyle={{
             borderRadius: '25px',
             boxShadow: 'inset 5px 5px 10px #e0e0e0, inset -5px -5px 10px #ffffff', 
             border: 'none',
             backgroundColor: '#f0f0f0', 
             padding: '40px',
        }}
        
        // 2. Style mặt trước (Câu hỏi) - Chữ nhỏ lại
        frontStyle={{
            backgroundColor: '#ffffff',
            color: '#333333',
            borderRadius: '20px',
            minHeight: '200px', 
            fontSize: '2rem', // ⭐ SỬA: Chữ nhỏ lại (từ 3.5rem xuống 2rem) ⭐
            fontWeight: '400', 
            boxShadow: '10px 10px 20px #e0e0e0, -10px -10px 20px #ffffff', 
            transition: 'all 0.5s ease-out',
        }}
        
        // 3. Style mặt sau (Câu trả lời) - Màu nhấn Cyan
        backStyle={{
            // Nền sử dụng gradient Cyan (Glassmorphism effect)
            background: 'linear-gradient(135deg, #E0F7FA, #B2EBF2)',
            color: '#006064', // Màu chữ Cyan đậm
            borderRadius: '20px',
            minHeight: '200px',
            fontSize: '1.5rem', // ⭐ SỬA: Chữ nhỏ lại (từ 2rem xuống 1.5rem) ⭐
            fontWeight: '600',
            // Đổ bóng nổi nhẹ
            boxShadow: '5px 5px 10px #c8c8c8, -5px -5px 10px #ffffff',
            transition: 'all 0.5s ease-out',
        }}
      />
      
     
    </div>
  );
};

export default FlashcardPage;