import axios from "axios";
import type { ApiResponse, VocabularyResponse } from "../types/api";

const API_URL = "https://fapanese-backend-production.up.railway.app/fapanese/api";

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
