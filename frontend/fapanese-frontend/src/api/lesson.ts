import axios from "axios";

const API_URL = "https://85e7dd680e50.ngrok-free.app/fapanese/api"; 

export const getLessonsByCourseCode = async (courseCode: string) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/lessons/by-course/${courseCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getLessonById = async (lessonId: number) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/lessons/${lessonId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;  
};
