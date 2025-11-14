import axios, { type AxiosProgressEvent } from "axios";

const API_URL = "https://85e7dd680e50.ngrok-free.app/fapanese/api/students";

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

export const uploadStudentExcel = async (
    formData: FormData,
    token: string,
    // Thêm tham số callback để cập nhật tiến trình
    onProgress: (progress: number) => void
) => {
    const res = await axios.post(`${API_URL}/upload-excel`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        // --- Thêm onUploadProgress ---
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted); // Gọi callback với % tiến trình
            } else {
                 onProgress(0); // Hoặc một giá trị khác nếu không tính được total
            }
        },
    });
    return res.data;
};
