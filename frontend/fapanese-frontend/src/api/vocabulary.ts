import axios from "axios";

const API_URL = "https://85e7dd680e50.ngrok-free.app/fapanese/api";

export const getVocabulariesByLessonPartId = async (lessonPartId: number) => {
  try {
    const token = localStorage.getItem("token"); // 🔹 lấy token sau khi login
    const response = await axios.get(
      `${API_URL}/vocabularies/by-lesson-part/${lessonPartId}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Không thể tải từ vựng:", error);
    throw error;
  }
};
