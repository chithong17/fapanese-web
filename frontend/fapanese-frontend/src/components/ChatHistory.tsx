// src/components/ChatHistory.tsx
import React, { useEffect, useRef } from 'react';
import AudioPlayer from './AudioPlayer';

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  audioBase64?: string; // Chỉ có ở tin nhắn AI
}

interface ChatHistoryProps {
  messages: ChatMessage[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Tự động cuộn xuống cuối khi có tin nhắn mới
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 border rounded-lg h-96">
      {messages.length === 0 && (
        <p className="text-center text-gray-500 italic">Bấm "Bắt Đầu Ghi Âm" để bắt đầu phỏng vấn!</p>
      )}
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-xs lg:max-w-md p-3 rounded-xl shadow-md ${
            msg.sender === 'user' 
              ? 'bg-blue-500 text-white rounded-br-none' 
              : 'bg-white text-gray-800 rounded-tl-none border'
          }`}>
            <p className="font-semibold mb-1">{msg.sender === 'user' ? 'Bạn' : 'AI Phỏng Vấn'}</p>
            <p className="whitespace-pre-wrap">{msg.text}</p>
            {/* Chỉ hiển thị AudioPlayer cho tin nhắn từ AI */}
            {msg.sender === 'ai' && msg.audioBase64 && (
                <AudioPlayer base64Data={msg.audioBase64} />
            )}
          </div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatHistory;