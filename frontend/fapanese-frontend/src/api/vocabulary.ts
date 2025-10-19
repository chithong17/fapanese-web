import axios from "axios";
import { ApiResponse, VocabularyResponse } from "../types/api"; // Đảm bảo đường dẫn đúng

const API_URL = "http://localhost:8080/fapanese/api"; // Giữ nguyên nếu đúng

export const getVocabulariesByLessonPartId = async (lessonPartId: number): Promise<VocabularyResponse[]> => {
  try {
    const response = await axios.get<ApiResponse<VocabularyResponse[]>>(
      `${API_URL}/vocabularies/by-lesson-part/${lessonPartId}`
    );
    return response.data.result;
  } catch (error: any) {
    console.error("Error fetching vocabularies:", error.response?.data || error.message || error);
    throw error.response?.data || error;
  }
};

