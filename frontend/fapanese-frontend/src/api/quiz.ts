import axios from "axios";

const API_URL = "https://fapanese-backend-production.up.railway.app/fapanese/api";

export const submitQuizAnswers = async (userAnswers: any[]) => {
  const token = localStorage.getItem("token");
  console.log("📤 Payload gửi đi:", JSON.stringify(userAnswers, null, 2));

  // ✅ Gửi trực tiếp mảng — KHÔNG bọc { answers: ... }
  const res = await axios.post(`${API_URL}/questions/submit`, userAnswers, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data; // có code, message, result
};

export const submitExamAnswers = async (userAnswers: any[]) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    "https://fapanese-backend-production.up.railway.app/fapanese/api/exam/submit",
    userAnswers,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );
  return res.data;
};

