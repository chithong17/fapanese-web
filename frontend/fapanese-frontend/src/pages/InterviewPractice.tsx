import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import CircularProgress from "@mui/material/CircularProgress";


const InterviewPractice: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      setLoading(true);
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "input.webm");

      const response = await fetch("http://localhost:8080/fapanese/api/interview/interact", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setUserText(data.userText);
      setAiText(data.aiText);

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

  return (
    <div className="flex flex-col items-center min-h-[80vh] pt-32 pb-16 px-4 bg-gradient-to-b from-white via-[#f0fbff] to-[#d6f1ff]">

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
      >
        🎤 Luyện Phỏng Vấn Tiếng Nhật Cùng AI
      </motion.h1>

      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Nhấn nút bên dưới để bắt đầu ghi âm câu trả lời bằng tiếng Nhật.  
        AI sẽ phân tích và đưa ra nhận xét chi tiết bằng tiếng Việt.
      </p>

      <motion.div whileHover={{ scale: 1.05 }}>
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-[#00bcd4] text-white px-8 py-4 rounded-full shadow-lg hover:bg-[#0097a7] transition flex items-center gap-2 text-lg font-semibold"
          >
            <MicIcon />
            Bắt đầu ghi âm
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-8 py-4 rounded-full shadow-lg hover:bg-red-600 transition flex items-center gap-2 text-lg font-semibold"
          >
            <StopIcon />
            Dừng ghi âm
          </button>
        )}
      </motion.div>

      {loading && (
        <div className="flex flex-col items-center mt-10 text-gray-600">
          <CircularProgress color="info" />
          <p className="mt-3 text-sm">AI đang xử lý, vui lòng chờ...</p>
        </div>
      )}

      {!loading && userText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 bg-white p-6 rounded-2xl shadow-md max-w-2xl w-full border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-700 mb-2">🗣 Câu bạn nói:</h3>
          <p className="text-gray-800 mb-4">{userText}</p>

          <h3 className="text-lg font-bold text-gray-700 mb-2">🤖 Nhận xét của AI:</h3>
          <p className="text-gray-800 whitespace-pre-line leading-relaxed">{aiText}</p>

          {audioUrl && (
            <div className="flex items-center gap-2 mt-6">
              <VolumeUpIcon color="primary" />
              <audio controls src={audioUrl}></audio>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default InterviewPractice;
