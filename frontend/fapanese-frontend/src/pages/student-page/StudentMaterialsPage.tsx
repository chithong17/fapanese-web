import { useEffect, useState } from "react";
import {
  Tabs,
  Card,
  Button,
  Upload,
  Input,
  message,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import { motion } from "framer-motion";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface Material {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  type: "RESOURCE" | "ASSIGNMENT" | "EXERCISE";
  deadline?: string | null;
}

interface Submission {
  id: number;
  materialId: number;
  fileUrl?: string;
  submissionText?: string;
  submissionLink?: string;
  submittedAt?: string;
  score?: number | null;
  feedback?: string | null;
  status: "PENDING" | "SUBMITTED" | "GRADED";
}

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"resources" | "assignments">(
    "resources"
  );

  const [selectedFiles, setSelectedFiles] = useState<{
    [key: number]: UploadFile | null;
  }>({});
  const [submissionTexts, setSubmissionTexts] = useState<{
    [key: number]: string;
  }>({});
  const [submissionLinks, setSubmissionLinks] = useState<{
    [key: number]: string;
  }>({});

  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("studentId") || "";
  const classCourseId = localStorage.getItem("classCourseId") || "";
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://85e7dd680e50.ngrok-free.app/fapanese/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [matRes, subRes] = await Promise.all([
          axios.get(`${API_BASE}/materials/student/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/material-submissions/student/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setMaterials(matRes.data.result || []);
        setSubmissions(subRes.data.result || []);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId, token]);

  const handleSubmit = async (materialId: number) => {
    try {
      const file = selectedFiles[materialId];
      let uploadedUrl = null;

      // Nếu người dùng chọn file, upload lên Cloudinary
      if (file) {
        const formData = new FormData();
        formData.append("file", file.originFileObj as Blob);
        formData.append("folder", "fapanese/submissions"); // 👈 Folder tùy chọn trong Cloudinary

        const uploadRes = await axios.post(
          `${API_BASE}/files/upload`, // 👈 Gọi qua backend thay vì Cloudinary trực tiếp
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        uploadedUrl = uploadRes.data.result; // 👈 Lấy URL backend trả về
      }

      const payload = {
        studentId,
        materialId,
        classCourseId,
        fileUrl: uploadedUrl,
        fileType: file?.type || null,
        submissionText: submissionTexts[materialId] || "",
        submissionLink: submissionLinks[materialId] || "",
      };

      await axios.post(`${API_BASE}/material-submissions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("✅ Nộp bài thành công!");
      // reload lại submissions
      const subRes = await axios.get(
        `${API_BASE}/material-submissions/student/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmissions(subRes.data.result || []);
    } catch (err) {
      console.error(err);
      message.error("❌ Lỗi khi nộp bài. Thử lại sau.");
    }
  };

  const getSubmissionForMaterial = (
    materialId: number
  ): Submission | undefined =>
    submissions.find((s) => s.materialId === materialId);

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  const renderResourcesTab = () => {
    const resources = materials.filter((m) => m.type === "RESOURCE");
    if (resources.length === 0)
      return <Text type="secondary">Chưa có tài liệu học nào.</Text>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {resources.map((mat) => (
          <motion.div key={mat.id} whileHover={{ scale: 1.02 }}>
            <Card
              title={
                <div className="flex justify-between items-center">
                  <span>{mat.title}</span>
                  <Tag color="green">Tài liệu</Tag>
                </div>
              }
              className="shadow-md border border-gray-200"
            >
              <p className="text-gray-700 mb-2">{mat.description}</p>
              {mat.fileUrl && (
                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-700 font-medium hover:underline"
                >
                  <FileTextOutlined /> Xem tài liệu
                </a>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderAssignmentsTab = () => {
    const assignments = materials.filter((m) => m.type !== "RESOURCE");
    if (assignments.length === 0)
      return <Text type="secondary">Không có bài tập nào.</Text>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {assignments.map((mat) => {
          const submission = getSubmissionForMaterial(mat.id);

          return (
            <motion.div key={mat.id} whileHover={{ scale: 1.02 }}>
              <Card
                title={
                  <div className="flex justify-between items-center">
                    <span>{mat.title}</span>
                    <Tag color={mat.type === "ASSIGNMENT" ? "orange" : "blue"}>
                      {mat.type}
                    </Tag>
                  </div>
                }
                className="shadow-md border border-gray-200"
              >
                <p className="text-gray-700 mb-2">{mat.description}</p>
                {mat.deadline && (
                  <p className="text-sm text-gray-500 mb-3">
                    <ClockCircleOutlined /> Deadline: {formatDate(mat.deadline)}
                  </p>
                )}

                {submission ? (
                  <div className="bg-gray-50 border rounded-md p-3 mt-2">
                    <Tag
                      color={
                        submission.status === "GRADED"
                          ? "green"
                          : submission.status === "SUBMITTED"
                          ? "blue"
                          : "default"
                      }
                    >
                      {submission.status === "GRADED"
                        ? "✅ Đã chấm"
                        : submission.status === "SUBMITTED"
                        ? "🕓 Đã nộp"
                        : "⏳ Chưa nộp"}
                    </Tag>

                    <p className="text-sm text-gray-600 mt-2">
                      Nộp lúc: {formatDate(submission.submittedAt)}
                    </p>

                    {submission.fileUrl && (
                      <p className="mt-2">
                        📎{" "}
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 hover:underline"
                        >
                          Xem file đã nộp
                        </a>
                      </p>
                    )}

                    {submission.submissionLink && (
                      <p className="mt-1">
                        🔗{" "}
                        <a
                          href={submission.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {submission.submissionLink}
                        </a>
                      </p>
                    )}

                    {submission.submissionText && (
                      <p className="mt-2 bg-white p-2 rounded-md border text-sm text-gray-700">
                        ✏️ {submission.submissionText}
                      </p>
                    )}

                    {submission.score != null && (
                      <p className="mt-3 text-gray-800 font-semibold">
                        Điểm: <Text strong>{submission.score}</Text>
                      </p>
                    )}

                    {submission.feedback && (
                      <p className="mt-1 text-gray-600 italic">
                        💬 Nhận xét: {submission.feedback}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
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

                    <TextArea
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
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Title level={2} className="text-cyan-700 mb-6 text-center">
        🎓 Học liệu & Bài tập của lớp
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as "resources" | "assignments")}
        centered
        items={[
          {
            key: "resources",
            label: "📘 Tài liệu học tập",
            children: renderResourcesTab(),
          },
          {
            key: "assignments",
            label: "📝 Bài tập & Nộp bài",
            children: renderAssignmentsTab(),
          },
        ]}
      />
    </div>
  );
}
