import axios from "axios";
const API_URL = "http://localhost:8080/fapanese/api";

export const getGrammarsByLessonPartId = async (lessonPartId: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/grammars/by-lesson-part/${lessonPartId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) throw new Error("Unauthorized - vui lòng đăng nhập lại!");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  return data.result || [];
};
