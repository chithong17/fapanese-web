import axios from "axios";

const API_URL = "http://localhost:8080/fapanese/api";
const token = localStorage.getItem("token");

export const getPendingTeachers = async () => {
  const res = await axios.get(`${API_URL}/users/pending-teachers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.result;
};

export const approveTeacher = async (id: string) => {
  const res = await axios.put(`${API_URL}/users/approve-teacher/${id}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const rejectTeacher = async (id: string) => {
  const res = await axios.put(`${API_URL}/users/reject-teacher/${id}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
