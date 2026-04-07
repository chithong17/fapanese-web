import axios from "axios";

const API_URL = "https://fapanese-backend-production.up.railway.app/fapanese/api";

export const getOverviewsByCourseCode = async (courseCode: string) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/overviews/by-course/${courseCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.result;
};