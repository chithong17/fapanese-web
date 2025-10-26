import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";

const TeacherLessonContentPage: React.FC = () => {
  const { courseCode, lessonId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "vocab" | "grammar" | "question_vocab" | "question_grammar"
  >("vocab");
  const [lessonParts, setLessonParts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const token = localStorage.getItem("token") || "";
  const API_BASE = "http://localhost:8080/fapanese/api";

  // ================= FETCH LESSON PARTS =================
  useEffect(() => {
    const fetchLessonParts = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(
          `${API_BASE}/lesson-parts/by-lesson/${lessonId}`,
          { headers }
        );
        setLessonParts(res.data.result || []);
      } catch (err) {
        console.error("❌ Không thể tải lesson parts:", err);
      }
    };
    fetchLessonParts();
  }, [lessonId]);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      if (!lessonParts.length) return;
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      let url = "";
      if (activeTab === "vocab")
        url = `${API_BASE}/vocabularies/by-lesson-part/${lessonParts[0]?.id}`;
      if (activeTab === "grammar")
        url = `${API_BASE}/grammars/by-lesson-part/${lessonParts[1]?.id}`;
      if (activeTab === "question_vocab")
        url = `${API_BASE}/questions/by-lesson-part/${lessonParts[0]?.id}`;
      if (activeTab === "question_grammar")
        url = `${API_BASE}/questions/by-lesson-part/${lessonParts[1]?.id}`;

      if (!url) return;
      const res = await axios.get(url, { headers });
      const data = res.data.result ?? res.data;
      setItems(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("❌ Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, lessonParts]);

  // ================= AUTO DEFAULT FORM TYPE =================
  useEffect(() => {
    if (showModal && !form.questionType) {
      setForm((prev: any) => ({
        ...prev,
        questionType: "MULTIPLE_CHOICE",
      }));
    }
  }, [showModal]);

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      let partId =
        activeTab === "vocab" || activeTab === "question_vocab"
          ? lessonParts[0]?.id
          : lessonParts[1]?.id;

      if (!partId) {
        alert("Không xác định được lessonPartId!");
        return;
      }

      // ----- VOCAB -----
      if (activeTab === "vocab") {
        if (editing)
          await axios.put(`${API_BASE}/vocabularies/${editing.id}`, form, {
            headers,
          });
        else
          await axios.post(
            `${API_BASE}/vocabularies`,
            { ...form, lessonPartId: partId },
            { headers }
          );
      }

      // ----- GRAMMAR -----
      if (activeTab === "grammar") {
        const body = editing
          ? {
              title: form.title,
              explanation: form.explanation,
              details: [
                {
                  id: form.details?.[0]?.id || null,
                  structure: form.structure,
                  meaning: form.meaning,
                  exampleSentence: form.exampleSentence,
                  exampleMeaning: form.exampleMeaning,
                },
              ],
            }
          : {
              lessonPartId: partId,
              title: form.title,
              explanation: form.explanation,
              details: [
                {
                  structure: form.structure || "",
                  meaning: form.meaning || "",
                  exampleSentence: form.exampleSentence || "",
                  exampleMeaning: form.exampleMeaning || "",
                },
              ],
            };

        if (editing)
          await axios.put(`${API_BASE}/grammars/${editing.id}`, body, {
            headers,
          });
        else
          await axios.post(`${API_BASE}/grammars`, body, {
            headers,
          });
      }

      // ----- QUESTION -----
      if (activeTab === "question_vocab" || activeTab === "question_grammar") {
        const body = {
          lessonPartId: partId,
          content: form.content || "",
          questionType: form.questionType || "MULTIPLE_CHOICE",
          category: activeTab === "question_vocab" ? "VOCABULARY" : "GRAMMAR",
          correctAnswer: form.correctAnswer || "",
          optionA: form.optionA || null,
          optionB: form.optionB || null,
          optionC: form.optionC || null,
          optionD: form.optionD || null,
          fillAnswer: form.fillAnswer || null,
        };

        if (editing)
          await axios.put(`${API_BASE}/questions/${editing.id}`, body, {
            headers,
          });
        else await axios.post(`${API_BASE}/questions`, body, { headers });
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("❌ Lỗi lưu:", err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa mục này?")) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const endpoint =
        activeTab === "vocab"
          ? "vocabularies"
          : activeTab === "grammar"
          ? "grammars"
          : "questions";

      await axios.delete(`${API_BASE}/${endpoint}/${id}`, { headers });

      fetchData();
    } catch (err) {
      console.error("❌ Lỗi xóa:", err);
    }
  };

  // ================= FORM =================
  const renderForm = () => {
    // Helper function to create labeled input/textarea
    const LabeledInput = ({ id, label, value, onChange, type = "text", required = false, rows = undefined, ...props }: any) => (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'textarea' ? (
          <textarea
            id={id}
            value={value || ""}
            onChange={onChange}
            className="w-full border p-2 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 min-h-[80px]" // Added focus styles & min-height
            required={required}
            rows={rows}
            {...props}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value || ""}
            onChange={onChange}
            className="w-full border p-2 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" // Added focus styles
            required={required}
            {...props}
          />
        )}
      </div>
    );

    switch (activeTab) {
      case "vocab":
        return (
          <>
            <LabeledInput id="wordKana" label="Kana" value={form.wordKana} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, wordKana: e.target.value })} />
            <LabeledInput id="wordKanji" label="Kanji" value={form.wordKanji} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, wordKanji: e.target.value })} />
            <LabeledInput id="meaning" label="Ý nghĩa" value={form.meaning} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, meaning: e.target.value })} required />
            <LabeledInput id="romaji" label="Romaji" value={form.romaji} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, romaji: e.target.value })} />
          </>
        );
      case "grammar":
        return (
          <>
            <LabeledInput id="title" label="Tiêu đề ngữ pháp" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} required />
            <LabeledInput id="structure" label="Cấu trúc" value={form.structure} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, structure: e.target.value })} />
            <LabeledInput id="meaning" label="Ý nghĩa cấu trúc" value={form.meaning} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, meaning: e.target.value })} type="textarea" />
            <LabeledInput id="explanation" label="Giải thích thêm" value={form.explanation} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, explanation: e.target.value })} type="textarea" />
            <LabeledInput id="exampleSentence" label="Câu ví dụ" value={form.exampleSentence} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, exampleSentence: e.target.value })} type="textarea" />
            <LabeledInput id="exampleMeaning" label="Nghĩa câu ví dụ" value={form.exampleMeaning} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, exampleMeaning: e.target.value })} type="textarea" />
          </>
        );
      case "question_vocab":
      case "question_grammar":
        return (
          <>
            {/* Question Type Select */}
            <div>
                 <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi (*)</label>
                 <select
                     id="questionType"
                     value={form.questionType || "MULTIPLE_CHOICE"}
                     onChange={(e) => {
                       const type = e.target.value;
                       // Reset form based on type (Logic from original code)
                       let updatedForm = { ...form, questionType: type };
                       if (type === "MULTIPLE_CHOICE") {
                           updatedForm = { ...updatedForm, fillAnswer: null, correctAnswer: "", optionA: "", optionB: "", optionC: "", optionD: "" };
                       } else if (type === "FILL") {
                           updatedForm = { ...updatedForm, correctAnswer: "", optionA: null, optionB: null, optionC: null, optionD: null };
                       } else if (type === "TRUE_FALSE") {
                           updatedForm = { ...updatedForm, correctAnswer: "True", fillAnswer: null, optionA: null, optionB: null, optionC: null, optionD: null };
                       }
                       setForm(updatedForm);
                     }}
                     className="w-full border p-2 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500"
                 >
                     <option value="MULTIPLE_CHOICE">Trắc nghiệm 4 lựa chọn</option>
                     <option value="FILL">Điền từ / cụm</option>
                     <option value="TRUE_FALSE">Đúng / Sai</option>
                 </select>
            </div>

             {/* Content */}
             <LabeledInput id="content" label="Nội dung câu hỏi" value={form.content} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, content: e.target.value })} type="textarea" required/>

            {/* Fields for MULTIPLE_CHOICE */}
            {form.questionType === "MULTIPLE_CHOICE" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                 <LabeledInput id="correctAnswerMC" label="Đáp án đúng (Nhập giống hệt 1 trong các lựa chọn)" value={form.correctAnswer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, correctAnswer: e.target.value })} required/>
                 {["A", "B", "C", "D"].map((opt) => (
                    <LabeledInput key={opt} id={`option${opt}`} label={`Lựa chọn ${opt}`} value={form[`option${opt}`]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [`option${opt}`]: e.target.value })} />
                 ))}
              </motion.div>
            )}

            {/* Fields for FILL */}
            {form.questionType === "FILL" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                     <LabeledInput id="correctAnswerFill" label="Đáp án đúng (Câu/từ hoàn chỉnh)" value={form.correctAnswer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, correctAnswer: e.target.value })} required/>
                    <LabeledInput id="fillAnswer" label="Từ/cụm cần điền (fillAnswer)" value={form.fillAnswer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, fillAnswer: e.target.value })} />
                    <p className="text-xs text-gray-500 -mt-2">Thường dùng khi 'Đáp án đúng' là câu hoàn chỉnh.</p>
                </motion.div>
            )}

            {/* Fields for TRUE_FALSE */}
            {form.questionType === "TRUE_FALSE" && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <label htmlFor="correctAnswerTF" className="block text-sm font-medium text-gray-700 mb-1">Đáp án đúng (*)</label>
                     <select
                        id="correctAnswerTF"
                        value={form.correctAnswer || "True"}
                        onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                        className="w-full border p-2 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500"
                     >
                         <option value="True">Đúng (True)</option>
                         <option value="False">Sai (False)</option>
                     </select>
                </motion.div>
            )}
          </>
        );
        default:
             return <p>Loại không xác định.</p> // Thêm default case
    }
  };

  // ================= TABLE =================
  const renderActionButtons = (item: any) => (
    <td className="space-x-2 text-center">
      <button
        onClick={() => {
          setEditing(item);

          if (activeTab === "grammar") {
            const d = item.details?.[0] || {};
            setForm({
              id: item.id,
              title: item.title || "",
              explanation: item.explanation || "",
              structure: d.structure || "",
              meaning: d.meaning || "",
              exampleSentence: d.exampleSentence || "",
              exampleMeaning: d.exampleMeaning || "",
              details: item.details || [],
            });
          } else if (activeTab === "vocab") {
            setForm({
              id: item.id,
              wordKana: item.wordKana || "",
              wordKanji: item.wordKanji || "",
              meaning: item.meaning || "",
              romaji: item.romaji || "",
            });
          } else {
            setForm({
              id: item.id,
              content: item.content || "",
              questionType: item.questionType || "MULTIPLE_CHOICE",
              correctAnswer: item.correctAnswer || "",
              optionA: item.optionA || "",
              optionB: item.optionB || "",
              optionC: item.optionC || "",
              optionD: item.optionD || "",
              fillAnswer: item.fillAnswer || "",
            });
          }

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

  const renderTable = () => {
    if (loading) return <div>Đang tải...</div>;
    if (!items || items.length === 0) return <div>Không có dữ liệu.</div>;

    if (activeTab === "vocab")
      return (
        <table className="w-full border border-gray-300">
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
              <tr key={v.id}>
                <td className="border p-2">{v.wordKana}</td>
                <td className="border p-2">{v.wordKanji}</td>
                <td className="border p-2 whitespace-pre-line">{v.meaning}</td>
                <td className="border p-2">{v.romaji}</td>
                {renderActionButtons(v)}
              </tr>
            ))}
          </tbody>
        </table>
      );

    if (activeTab === "grammar")
      return (
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th>Tiêu đề</th>
              <th>Cấu trúc</th>
              <th>Giải thích</th>
              <th>Ví dụ</th>
              <th>Nghĩa ví dụ</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((g) => (
              <tr key={g.id} className="align-top">
                <td className="border p-2">{g.title}</td>
                <td className="border p-2 whitespace-pre-line">
                  {g.details?.map((d: any, i: number) => (
                    <div key={i} className="mb-2">
                      <div className="font-medium text-gray-800">
                        {d.structure || "—"}
                      </div>
                      {d.meaning && (
                        <div className="text-gray-500 text-sm italic mt-1 whitespace-pre-line">
                          {d.meaning}
                        </div>
                      )}
                    </div>
                  ))}
                </td>
                <td className="border p-2 whitespace-pre-line">
                  {g.explanation}
                </td>
                <td className="border p-2 whitespace-pre-line">
                  {g.details?.map((d: any) => d.exampleSentence).join("\n")}
                </td>
                <td className="border p-2 whitespace-pre-line">
                  {g.details?.map((d: any) => d.exampleMeaning).join("\n")}
                </td>
                {renderActionButtons(g)}
              </tr>
            ))}
          </tbody>
        </table>
      );

    if (activeTab === "question_vocab" || activeTab === "question_grammar")
      return (
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th>Câu hỏi</th>
              <th>Loại</th>
              <th>Đáp án đúng</th>
              <th>Các lựa chọn</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((q) => (
              <tr key={q.id}>
                <td className="border p-2">{q.content}</td>
                <td className="border p-2">{q.questionType}</td>
                <td className="border p-2">
                  {q.correctAnswer || q.fillAnswer}
                </td>
                <td className="border p-2">
                  {q.questionType === "MULTIPLE_CHOICE" ? (
                    ["A", "B", "C", "D"].map((opt) => (
                      <div key={opt}>
                        <strong>{opt}:</strong> {q[`option${opt}`]}
                      </div>
                    ))
                  ) : q.questionType === "TRUE_FALSE" ? (
                    <div>
                      <strong>Đúng/Sai:</strong>{" "}
                      {q.correctAnswer === "True" ? "Đúng" : "Sai"}
                    </div>
                  ) : (
                    <i>— (Điền từ)</i>
                  )}
                </td>
                {renderActionButtons(q)}
              </tr>
            ))}
          </tbody>
        </table>
      );
  };

  // ================= UI =================
  return (
    // <div className="pt-5 p-10 min-h-screen bg-gray-50">
    <div className="">

      {/* --- ✅ THAY THẾ HEADER CŨ BẰNG ĐOẠN NÀY --- */}
      <div className="flex justify-between items-center mb-10">
         {/* Nút Quay lại Khóa học (Teacher context) */}
         <Link
           to={`/teacher/courses/${courseCode}`} // Link back to the teacher's course lesson list
           className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 transition-colors"
         >
           <IoMdArrowBack className="h-6 w-6" />
           <span className="text-lg font-medium">Quay lại Khóa học</span>
         </Link>
      </div>

       <h1 className="text-3xl font-bold text-gray-800 mb-8"> {/* Moved Title Below Back Button */}
           Quản lý Nội dung Bài học {lessonId}
       </h1>
       {/* --- KẾT THÚC THAY THẾ --- */}

      <div className="flex gap-3 mb-8 flex-wrap">
        {[
          { key: "vocab", label: "Từ vựng" },
          { key: "grammar", label: "Ngữ pháp" },
          { key: "question_vocab", label: "Câu hỏi - Từ vựng" },
          { key: "question_grammar", label: "Câu hỏi - Ngữ pháp" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key as any);
              setEditing(null);
              setForm({});
            }}
            className={`px-5 py-2 rounded-full font-semibold ${
              activeTab === t.key
                ? "bg-cyan-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {activeTab === "vocab"
            ? "Danh sách từ vựng"
            : activeTab === "grammar"
            ? "Danh sách ngữ pháp"
            : activeTab === "question_vocab"
            ? "Câu hỏi kiểm tra từ vựng"
            : "Câu hỏi kiểm tra ngữ pháp"}
        </h2>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ questionType: "MULTIPLE_CHOICE" }); // ✅ thêm sẵn
            setShowModal(true);
          }}
          className="bg-cyan-600 text-white px-4 py-2 rounded-full flex items-center gap-2"
        >
          <AiOutlinePlus /> Thêm mới
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
        {renderTable()}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 w-[480px]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold mb-4">
              {editing ? "Chỉnh sửa" : "Thêm mới"}{" "}
              {activeTab.includes("vocab")
                ? "từ vựng"
                : activeTab.includes("grammar") &&
                  !activeTab.includes("question")
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
