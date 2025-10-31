import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Bắt buộc cho hiệu ứng mượt mà
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import CircularProgress from "@mui/material/CircularProgress";
import SmartToyIcon from '@mui/icons-material/SmartToy'; // Icon cho AI
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'; // Icon cho Text/User
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic'; // Icon cho Audio gốc

// Component cho phần hiển thị kết quả theo phong cách Card
const ResultCard: React.FC<{ title: string; text: string; icon: React.ReactNode; color: string }> = ({ title, text, icon, color }) => (
  // Màu nền trắng, đổ bóng tinh tế, border accent
  <div className={`p-6 rounded-xl border border-${color}-200 bg-white shadow-lg transition duration-300 hover:shadow-xl`}>
    <h3 className={`text-base font-extrabold text-${color}-600 flex items-center gap-2 mb-3 border-b border-gray-100 pb-2`}>
      {icon} <span className="tracking-wide">{title}</span>
    </h3>
    <p className="text-gray-800 whitespace-pre-line leading-relaxed text-base">{text}</p>
  </div>
);


const InterviewPractice: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null); // 👈 KHÔI PHỤC: State cho ghi âm gốc
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- LOGIC GHI ÂM (Đã thêm lưu URL ghi âm gốc) ---
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    
    // Đặt lại các state kết quả
    setUserText("");
    setAiText("");
    setAudioUrl(null);
    setUserAudioUrl(null); 

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      setLoading(true);
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      
      // 1. LƯU URL CỦA GHI ÂM GỐC
      const userUrl = URL.createObjectURL(blob);
      setUserAudioUrl(userUrl); 
      
      const formData = new FormData();
      formData.append("audio", blob, "input.webm");

      const response = await fetch("http://localhost:8080/fapanese/api/interview/interact", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setUserText(data.userText);
      setAiText(data.aiText);

      // 2. LƯU URL CỦA NHẬN XÉT AI
      const audioBytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: "audio/wav" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setLoading(false);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // --- JSX Giao Diện Đã Nâng Cấp Sang Trọng (Final) ---
  return (
    // Nền gradient sạch sẽ, tone trắng/xanh
    <div className="flex flex-col items-center min-h-[100vh] py-16 px-4 bg-gradient-to-br from-white via-blue-50 to-cyan-50 mt-20">
      
      {/* HEADER SECTION - Tựa đề mạnh mẽ, cuốn hút */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl mb-16"
      >
        <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-800 mb-3 tracking-tight drop-shadow-md">
          <span className="text-[#00bcd4]">AI</span> Luyện Tập Phỏng Vấn 
        </h1>
        <p className="text-gray-600 text-xl mt-4 max-w-2xl mx-auto italic">
          Đánh giá chi tiết, phản hồi song ngữ, luyện tập như chuyên gia.
        </p>
      </motion.div>

      {/* CONTROL BUTTON & TRANSITION CONTAINER - Hiệu ứng chuyển cảnh ngang */}
      <motion.div 
        className="relative w-full max-w-lg flex justify-center h-20"
      >
        <AnimatePresence mode="wait">
          {!recording ? (
            // NÚT BẮT ĐẦU: Cyan Gradient
            <motion.button
              key="start"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              onClick={startRecording}
              disabled={loading}
              className="absolute bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white px-10 py-4 rounded-full shadow-2xl hover:shadow-4xl transition flex items-center gap-3 text-xl font-bold disabled:opacity-50 tracking-wider transform hover:scale-105"
            >
              <MicIcon style={{ fontSize: 30 }} />
              <span>BẮT ĐẦU GHI ÂM</span>
            </motion.button>
          ) : (
            // HIỆN TRẠNG THÁI GHI ÂM VÀ NÚT STOP: Chuyển sang trái
            <motion.div
              key="recording"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="absolute flex items-center gap-6 p-2 rounded-full bg-white shadow-2xl border border-red-500"
            >
              <motion.div // Hiệu ứng Pulse cho Mic
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl"
              >
              </motion.div>
              
              <span className="text-xl font-extrabold text-red-600 tracking-wider">
                MỜI BẠN NÓI...
              </span>
              
              <button
                onClick={stopRecording}
                className="bg-red-600 text-white w-12 h-12 rounded-full shadow-lg hover:bg-red-700 transition flex items-center justify-center transform hover:scale-105"
              >
                <StopIcon />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center mt-16 p-8 bg-white rounded-xl shadow-xl border border-blue-200">
          <CircularProgress style={{ color: '#00bcd4' }} size={48} thickness={5} /> 
          <p className="mt-4 text-gray-700 font-medium italic">Đang phân tích bạn đợi nhé</p>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {!loading && userText && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-white p-10 rounded-3xl shadow-2xl max-w-5xl w-full border-t-8 border-[#00bcd4]"
        >
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8 border-b border-gray-200 pb-4">
             Báo Cáo Đánh Giá Chi Tiết
          </h2>
          
          <div className="gap-8 mb-8">
            <ResultCard 
                title="CÂU TRẢ LỜI CỦA BẠN" 
                text={userText} 
                icon={<RecordVoiceOverIcon style={{ color: '#4B5563' }} />}
                color="gray"
            />
            <br />
            <ResultCard 
                title="NHẬN XÉT CHUYÊN GIA AI" 
                text={aiText} 
                icon={<SmartToyIcon style={{ color: '#00bcd4' }} />}
                color="cyan"
            />
          </div>

          {/* AUDIO PLAYER SECTION */}
          {(userAudioUrl || audioUrl) && (
            <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-gray-200">
            
              {/* PHÁT LẠI NHẬN XÉT CỦA AI */}
              {audioUrl && (
            <div className="flex items-center gap-2 mt-6">
              <VolumeUpIcon color="primary" />
              <audio controls src={audioUrl}></audio>
            </div>
          )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default InterviewPractice;