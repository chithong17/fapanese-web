import axios from "axios";

const API_URL = "http://localhost:8080/fapanese/api";

export const getLessonPartsByLesson = async (lessonId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/lesson-parts/by-lesson/${lessonId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error("Unauthorized - Vui lòng đăng nhập lại!");
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.result || [];
};
