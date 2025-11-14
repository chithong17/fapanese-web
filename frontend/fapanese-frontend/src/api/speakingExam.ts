// src/api/speakingExam.ts
import axios from "axios";

const API_URL = "https://85e7dd680e50.ngrok-free.app/fapanese/api";

// Lấy nội dung Speaking theo Part ID
export const getSpeakingExamsByPartId = async (partId: number) => {
  const token = localStorage.getItem("token");
  // Giả định API endpoint hỗ trợ lấy theo partId
  const res = await axios.get(
    `${API_URL}/speaking-exams/by-overview-part/${partId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  // Dựa trên cấu trúc API bạn gửi, result là một mảng các "nhóm đề"
  return res.data.result;
};