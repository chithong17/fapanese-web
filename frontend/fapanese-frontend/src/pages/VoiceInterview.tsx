// src/pages/VoiceInterview.tsx
import React, { useState } from 'react';
import RecordingButton from '../components/RecordingButton';
import ChatHistory from '../components/ChatHistory';
import type { ChatMessage } from '../components/ChatHistory';
import { sendAudioToNodeBackend } from '../api/api';

// Giả định bạn có các component layout (Navbar, Footer)
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer';

// Hàm mock/placeholder cho Navbar
const mockScrollToSection = (id: string, tab?: "hiragana" | "katakana") => {
    console.log(`Scrolling to ${id}`);
};

const VoiceInterview: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (isProcessing) return;

    setIsProcessing(true);
    let messageId = Date.now();
    
    // 1. Thêm tin nhắn người dùng vào lịch sử
    const userText = `(Đã gửi ${Math.round(audioBlob.size / 1024)} KB audio. Chờ AI trả lời...)`; 
    setMessages(prev => [...prev, { id: messageId++, sender: 'user', text: userText }]);

    try {
      // 2. Gửi audio đến Node.js backend
      const { text, audioBase64 } = await sendAudioToNodeBackend(audioBlob);

      // 3. Thêm tin nhắn trả lời từ AI vào lịch sử
      setMessages(prev => [...prev, { 
        id: messageId++, 
        sender: 'ai', 
        text: text, 
        audioBase64: audioBase64 
      }]);

    } catch (error) {
      console.error("Lỗi khi giao tiếp với backend AI:", error);
      // Hiển thị thông báo lỗi
      setMessages(prev => [...prev, { 
        id: messageId++, 
        sender: 'ai', 
        text: 'Lỗi: Không thể kết nối hoặc xử lý yêu cầu. Vui lòng kiểm tra Node.js backend (cổng 5000).', 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
        <Navbar 
            scrollToSection={mockScrollToSection} 
            onAuthClick={() => {}} 
            userDropdownOpen={false} 
            setUserDropdownOpen={() => {}} 
        />
        
        <main className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                🗣️ Trợ Lý Luyện Nói AI (Phỏng Vấn)
            </h1>
            
            {/* Khu vực Lịch sử Chat */}
            <ChatHistory messages={messages} />

            {/* Khu vực Ghi Âm và Tương tác */}
            <div className="mt-6 p-4 border-t bg-white sticky bottom-0">
                <div className="flex justify-center">
                    <RecordingButton 
                        onRecordingComplete={handleRecordingComplete} 
                        isProcessing={isProcessing}
                    />
                </div>
                
                {isProcessing && (
                    <p className="text-center text-sm mt-2 text-blue-600">
                        AI đang phân tích và tạo câu trả lời...
                    </p>
                )}
            </div>
        </main>
        <Footer />
    </div>
  );
};

export default VoiceInterview;