// src/api/middleExam.ts
import axios from "axios";

const API_URL = "https://85e7dd680e50.ngrok-free.app/fapanese/api";

// Lấy nội dung Middle Exam theo Part ID
export const getMiddleExamsByPartId = async (partId: number) => {
  const token = localStorage.getItem("token");
  // Giả định API endpoint hỗ trợ lấy theo partId
  const res = await axios.get(
    `${API_URL}/middle-exams/by-overview-part/${partId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.result;
};