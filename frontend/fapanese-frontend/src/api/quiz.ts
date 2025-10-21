import axios from "axios";

const API_URL = "http://localhost:8080/fapanese/api";

export const submitQuizAnswers = async (userAnswers: any[]) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(`${API_URL}/questions/submit`, userAnswers, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data; // có code, message, result
};
