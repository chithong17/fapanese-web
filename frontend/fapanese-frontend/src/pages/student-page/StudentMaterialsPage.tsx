import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, Button, Upload, Input, message, Spin, Tag } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";

// ---- Interfaces ----
interface Material {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  type: "RESOURCE" | "ASSIGNMENT" | "EXERCISE";
}

interface SubmissionPayload {
  studentId: string;
  materialId: number;
  classCourseId: string;
  fileUrl?: string | null;
  fileType?: string | null;
  submissionText?: string;
  submissionLink?: string;
}

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: number]: UploadFile | null }>({});
  const [submissionTexts, setSubmissionTexts] = useState<{ [key: number]: string }>({});
  const [submissionLinks, setSubmissionLinks] = useState<{ [key: number]: string }>({});

  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("studentId") || "";
  const classCourseId = localStorage.getItem("classCourseId") || "";

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/fapanese/api";

  // ---- Fetch materials (theo lớp học) ----
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/materials/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMaterials(res.data.result || []);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách tài liệu được phân cho lớp.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [studentId, token]);

  // ---- Handle submission ----
  const handleSubmit = async (materialId: number) => {
    try {
      if (!studentId || !classCourseId) {
        message.error("Không tìm thấy thông tin sinh viên hoặc lớp học.");
        return;
      }

      const payload: SubmissionPayload = {
        studentId,
        materialId,
        classCourseId,
        fileUrl: selectedFiles[materialId]?.response?.url || null,
        fileType: selectedFiles[materialId]?.type || null,
        submissionText: submissionTexts[materialId] || "",
        submissionLink: submissionLinks[materialId] || "",
      };

      await axios.post(`${API_BASE}/material-submissions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("✅ Nộp bài thành công!");
      setSelectedFiles((prev) => ({ ...prev, [materialId]: null }));
      setSubmissionTexts((prev) => ({ ...prev, [materialId]: "" }));
      setSubmissionLinks((prev) => ({ ...prev, [materialId]: "" }));
    } catch (err) {
      console.error(err);
      message.error("❌ Nộp bài thất bại, vui lòng thử lại.");
    }
  };

  // ---- UI: Loading ----
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải tài liệu..." />
      </div>
    );
  }

  // ---- UI: Render ----
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-cyan-700 mb-8">
        🧾 Tài liệu & Bài tập của lớp học
      </h1>

      {materials.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          📚 Chưa có tài liệu nào được phân cho lớp của bạn.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((mat) => (
            <motion.div
              key={mat.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                title={
                  <div className="flex justify-between items-center">
                    <span>{mat.title}</span>
                    <Tag color={
                      mat.type === "ASSIGNMENT"
                        ? "orange"
                        : mat.type === "EXERCISE"
                        ? "blue"
                        : "green"
                    }>
                      {mat.type}
                    </Tag>
                  </div>
                }
                bordered={false}
                className="shadow-md hover:shadow-lg transition"
              >
                <p className="text-gray-700 mb-3">{mat.description}</p>

                {mat.fileUrl && (
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 font-medium"
                  >
                    📄 Xem tài liệu
                  </a>
                )}

                {/* Nếu là bài tập hoặc bài nộp */}
                {mat.type !== "RESOURCE" && (
                  <>
                    <div className="mt-4">
                      <Upload
                        beforeUpload={() => false}
                        onChange={(info) =>
                          setSelectedFiles((prev) => ({
                            ...prev,
                            [mat.id]: info.fileList[0] || null,
                          }))
                        }
                      >
                        <Button icon={<UploadOutlined />}>Chọn file nộp</Button>
                      </Upload>
                    </div>

                    <Input.TextArea
                      placeholder="Nhập nội dung bài làm..."
                      className="mt-3"
                      rows={3}
                      value={submissionTexts[mat.id] || ""}
                      onChange={(e) =>
                        setSubmissionTexts((prev) => ({
                          ...prev,
                          [mat.id]: e.target.value,
                        }))
                      }
                    />

                    <Input
                      placeholder="Hoặc dán link Google Docs..."
                      className="mt-3"
                      value={submissionLinks[mat.id] || ""}
                      onChange={(e) =>
                        setSubmissionLinks((prev) => ({
                          ...prev,
                          [mat.id]: e.target.value,
                        }))
                      }
                    />

                    <Button
                      type="primary"
                      className="mt-4 bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => handleSubmit(mat.id)}
                    >
                      Nộp bài
                    </Button>
                  </>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
