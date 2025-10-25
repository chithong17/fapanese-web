import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const TeacherLessonContentPage: React.FC = () => {
  const { courseCode, lessonId, lessonPartId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"vocab" | "grammar" | "question">(
    "vocab"
  );
  const [lessonParts, setLessonParts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const token = localStorage.getItem("token") || "";

  const API_BASE = "http://localhost:8080/fapanese/api";

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      let res;

      if (activeTab === "vocab")
        res = await axios.get(
          `${API_BASE}/vocabularies/by-lesson-part/${lessonPartId}`,
          { headers }
        );
      if (activeTab === "grammar")
        res = await axios.get(
          `${API_BASE}/grammars/by-lesson-part/${lessonPartId}`,
          { headers }
        );
      console.log("📘 grammar response:", res?.data);
      if (activeTab === "question")
        res = await axios.get(
          `${API_BASE}/questions/by-lesson-part/${lessonPartId}`,
          { headers }
        );

      if (res && res.data) {
        setItems(Array.isArray(res.data) ? res.data : res.data.result || []);
      }
    } catch (err) {
      console.error("❌ Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, lessonPartId]);

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === "vocab") {
        if (editing) {
          // cập nhật
          await axios.put(`${API_BASE}/vocabularies/${editing.id}`, form, {
            headers,
          });
        } else {
          // thêm mới – thêm lessonPartId vào body
          await axios.post(
            `${API_BASE}/vocabularies`,
            { ...form, lessonPartId: lessonPartId }, // 👈 thêm dòng này
            { headers }
          );
        }
      }

      if (activeTab === "grammar") {
        if (editing) {
          await axios.put(`${API_BASE}/grammars/${editing.id}`, form, {
            headers,
          });
        } else {
          await axios.post(
            `${API_BASE}/grammars`,
            { ...form, lessonPartId: lessonPartId },
            { headers }
          );
        }
      }

      if (activeTab === "question") {
        if (editing)
          await axios.put(`${API_BASE}/questions/${editing.id}`, form, {
            headers,
          });
        else
          await axios.post(
            `${API_BASE}/questions`,
            { ...form, lessonPartId: lessonPartId },
            { headers }
          );
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("❌ Lỗi lưu:", err);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa mục này?")) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        `${API_BASE}/${
          activeTab === "vocab" ? "vocabularies" : activeTab + "s"
        }/${id}`,
        { headers }
      );
      fetchData();
    } catch (err) {
      console.error("❌ Lỗi xóa:", err);
    }
  };

  useEffect(() => {
    const fetchLessonParts = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }; // 👈 thêm dòng này
        const res = await axios.get(
          `http://localhost:8080/fapanese/api/lesson-parts/by-lesson/${lessonId}`,
          { headers }
        );
        console.log("📦 lessonParts từ API:", res.data.result);
        setLessonParts(res.data.result || []);
      } catch (err) {
        console.error("❌ Không thể tải lesson parts:", err);
      }
    };
    fetchLessonParts();
  }, [lessonId]);

  const handleTabChange = (tab: "vocab" | "grammar" | "question") => {
    console.log("🧭 Changing tab:", tab, lessonParts);

    if (!lessonParts?.length) return;

    let targetPartId: any = lessonPartId;

    if (tab === "vocab" && lessonParts[0]) targetPartId = lessonParts[0].id;
    if (tab === "grammar" && lessonParts[1]) targetPartId = lessonParts[1].id;

    if (!targetPartId) {
      console.warn("⚠️ Không có partId hợp lệ, bỏ qua navigate.");
      return;
    }

    // 👉 Đợi 1 tick để router update an toàn
    setTimeout(() => {


      if (!targetPartId || targetPartId === "undefined") {
        return;
      }

      navigate(
        `/teacher/courses/${courseCode}/lessons/${lessonId}/parts/${targetPartId}/manage`
      );
    }, 0);

    setActiveTab(tab);
    setEditing(null);
    setForm({});
  };

  useEffect(() => {
    if (lessonParts.length >= 2) {
      if (lessonPartId == lessonParts[0].id.toString()) setActiveTab("vocab");
      else if (lessonPartId == lessonParts[1].id.toString())
        setActiveTab("grammar");
    }
  }, [lessonPartId, lessonParts]);

  // ---------------- FORM ----------------
  const renderForm = () => {
    switch (activeTab) {
      case "vocab":
        return (
          <>
            <input
              placeholder="Kana"
              value={form.wordKana || ""}
              onChange={(e) => setForm({ ...form, wordKana: e.target.value })}
              className="border p-2 w-full"
            />
            <input
              placeholder="Kanji"
              value={form.wordKanji || ""}
              onChange={(e) => setForm({ ...form, wordKanji: e.target.value })}
              className="border p-2 w-full"
            />
            <input
              placeholder="Ý nghĩa"
              value={form.meaning || ""}
              onChange={(e) => setForm({ ...form, meaning: e.target.value })}
              className="border p-2 w-full"
            />
            <input
              placeholder="Romaji"
              value={form.romaji || ""}
              onChange={(e) => setForm({ ...form, romaji: e.target.value })}
              className="border p-2 w-full"
            />
          </>
        );
      case "grammar":
        return (
          <>
            <input
              placeholder="Tiêu đề"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border p-2 w-full"
            />
            <input
              placeholder="Cấu trúc"
              value={form.structure || ""}
              onChange={(e) => setForm({ ...form, structure: e.target.value })}
              className="border p-2 w-full"
            />
            <textarea
              placeholder="Giải thích"
              value={form.explanation || ""}
              onChange={(e) =>
                setForm({ ...form, explanation: e.target.value })
              }
              className="border p-2 w-full min-h-[100px]"
            />
            <textarea
              placeholder="Ví dụ"
              value={form.exampleSentence || ""}
              onChange={(e) =>
                setForm({ ...form, exampleSentence: e.target.value })
              }
              className="border p-2 w-full min-h-[100px]"
            />
          </>
        );
      case "question":
        return (
          <>
            <input
              placeholder="Câu hỏi"
              value={form.content || ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="border p-2 w-full"
            />
            <input
              placeholder="Đáp án đúng"
              value={form.correctAnswer || ""}
              onChange={(e) =>
                setForm({ ...form, correctAnswer: e.target.value })
              }
              className="border p-2 w-full"
            />
            <input
              placeholder="A"
              value={form.optionA || ""}
              onChange={(e) => setForm({ ...form, optionA: e.target.value })}
              className="border p-2 w-full"
            />
            <input
              placeholder="B"
              value={form.optionB || ""}
              onChange={(e) => setForm({ ...form, optionB: e.target.value })}
              className="border p-2 w-full"
            />
            <input
              placeholder="C"
              value={form.optionC || ""}
              onChange={(e) => setForm({ ...form, optionC: e.target.value })}
              className="border p-2 w-full"
            />
            <input
              placeholder="D"
              value={form.optionD || ""}
              onChange={(e) => setForm({ ...form, optionD: e.target.value })}
              className="border p-2 w-full"
            />
          </>
        );
    }
  };

  // ---------------- TABLE ----------------
  const renderTable = () => {
    if (loading) return <div>Đang tải...</div>;
    if (items.length === 0) return <div>Không có dữ liệu.</div>;

    const renderActionButtons = (item: any) => (
      <td className="space-x-2 text-center">
        <button
          onClick={() => {
            setEditing(item);
            setForm(item);
            setShowModal(true);
          }}
          className="text-yellow-600"
        >
          <AiOutlineEdit />
        </button>
        <button onClick={() => handleDelete(item.id)} className="text-red-600">
          <AiOutlineDelete />
        </button>
      </td>
    );

    if (activeTab === "vocab")
      return (
        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th>Kana</th>
              <th>Kanji</th>
              <th>Ý nghĩa</th>
              <th>Romaji</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id} className="border-t">
                <td>{v.wordKana}</td>
                <td>{v.wordKanji}</td>
                <td>{v.meaning}</td>
                <td>{v.romaji}</td>
                {renderActionButtons(v)}
              </tr>
            ))}
          </tbody>
        </table>
      );

    if (activeTab === "grammar")
      return (
        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th>Tiêu đề</th>
              <th>Cấu trúc</th>
              <th>Ví dụ</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((g) => (
              <tr key={g.id} className="border-t">
                <td>{g.title}</td>
                <td>{g.structure}</td>
                <td>{g.exampleSentence}</td>
                {renderActionButtons(g)}
              </tr>
            ))}
          </tbody>
        </table>
      );

    if (activeTab === "question")
      return (
        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th>Câu hỏi</th>
              <th>Đáp án</th>
              <th>A</th>
              <th>B</th>
              <th>C</th>
              <th>D</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((q) => (
              <tr key={q.id} className="border-t">
                <td>{q.content}</td>
                <td>{q.correctAnswer}</td>
                <td>{q.optionA}</td>
                <td>{q.optionB}</td>
                <td>{q.optionC}</td>
                <td>{q.optionD}</td>
                {renderActionButtons(q)}
              </tr>
            ))}
          </tbody>
        </table>
      );
  };

  // ---------------- UI ----------------
  return (
    <div className="pt-24 p-10 min-h-screen bg-gray-50">
      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        {["vocab", "grammar", "question"].map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t as any)}
            className={`px-6 py-2 rounded-full font-semibold ${
              activeTab === t
                ? "bg-cyan-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            {t === "vocab"
              ? "Từ vựng"
              : t === "grammar"
              ? "Ngữ pháp"
              : "Câu hỏi"}
          </button>
        ))}
      </div>

      {/* Header + Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {activeTab === "vocab"
            ? "Danh sách từ vựng"
            : activeTab === "grammar"
            ? "Danh sách ngữ pháp"
            : "Danh sách câu hỏi"}
        </h2>
        <button
          onClick={() => {
            setEditing(null);
            setForm({});
            setShowModal(true);
          }}
          className="bg-cyan-600 text-white px-4 py-2 rounded-full flex items-center gap-2"
        >
          <AiOutlinePlus /> Thêm mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
        {renderTable()}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 w-[480px]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold mb-4">
              {editing ? "Chỉnh sửa" : "Thêm mới"}{" "}
              {activeTab === "vocab"
                ? "từ vựng"
                : activeTab === "grammar"
                ? "ngữ pháp"
                : "câu hỏi"}
            </h3>

            <div className="space-y-3">{renderForm()}</div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-full"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-cyan-600 text-white rounded-full"
              >
                Lưu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherLessonContentPage;
