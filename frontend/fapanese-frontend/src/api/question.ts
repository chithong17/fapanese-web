import axios from "axios";

const API_URL = "http://localhost:8080/fapanese/api";

export const getQuestionsByLessonPartId = async (lessonPartId: number) => {
  const token = localStorage.getItem("token"); // 🔹 đổi lại cho khớp

  const res = await axios.get(
    `${API_URL}/questions/by-lesson-part/${lessonPartId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
