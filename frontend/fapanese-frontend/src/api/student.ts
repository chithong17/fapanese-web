import axios from "axios";

const API_URL = "http://localhost:8080/fapanese/api/students";

export const getAllStudents = async (token: string) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.result;
};

export const registerStudent = async (data: any, token: string) => {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.result;
};

export const updateStudent = async (email: string, data: any, token: string) => {
  const res = await axios.put(`${API_URL}/${email}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.result;
};

export const deleteStudent = async (email: string, token: string) => {
  await axios.delete(`${API_URL}/${email}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
