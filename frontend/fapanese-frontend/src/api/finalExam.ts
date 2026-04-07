// src/api/finalExam.ts
import axios from "axios";

const API_URL = "https://fapanese-backend-production.up.railway.app/fapanese/api";

// Lấy nội dung Final Exam theo Part ID
export const getFinalExamsByPartId = async (partId: number) => {
  const token = localStorage.getItem("token");
  // Giả định API endpoint hỗ trợ lấy theo partId
  const res = await axios.get(
    `${API_URL}/final-exams/by-overview-part/${partId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.result;
};