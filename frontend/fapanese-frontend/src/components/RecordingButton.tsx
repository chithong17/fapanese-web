// src/components/RecordingButton.tsx
import React, { useState, useRef } from 'react';

interface RecordingButtonProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        // Tạo Blob audio từ các chunk đã ghi
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Dừng track để tắt đèn ghi âm
        stream.getTracks().forEach(track => track.stop()); 
        onRecordingComplete(audioBlob);
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log("Đã bắt đầu ghi âm...");
    } catch (error) {
      console.error("Lỗi khi truy cập microphone:", error);
      alert("Không thể truy cập microphone. Vui lòng kiểm tra quyền.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log("Đã dừng ghi âm.");
    }
  };

  const buttonClass = isRecording 
    ? "bg-red-500 hover:bg-red-600 animate-pulse" 
    : "bg-green-500 hover:bg-green-600";
  
  const text = isRecording 
    ? "Đang Ghi Âm... (Click để Dừng)" 
    : isProcessing 
      ? "Đang Xử Lý..." 
      : "Bắt Đầu Ghi Âm";

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      className={`p-4 rounded-full text-white font-bold transition-colors shadow-lg ${buttonClass} ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {text}
    </button>
  );
};

export default RecordingButton;