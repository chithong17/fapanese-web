import React, { useEffect, useState } from "react";
import {
  getAllStudents,
  registerStudent,
  updateStudent,
  deleteStudent,
} from "../../api/student";

export default function StudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState<any | null>(null);
  const token = localStorage.getItem("token") || "";

  // 🧩 Fetch danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const data = await getAllStudents(token);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách sinh viên:", err);
      alert("Không thể tải danh sách sinh viên. Kiểm tra token hoặc quyền truy cập.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 🗑 Xóa sinh viên
  const handleDelete = async (email: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học sinh này?")) {
      try {
        await deleteStudent(email, token);
        fetchStudents();
      } catch (err) {
        console.error("❌ Lỗi khi xóa sinh viên:", err);
        alert("Không thể xóa. Có thể bạn không có quyền ADMIN.");
      }
    }
  };

  // 💾 Lưu sinh viên (tạo mới hoặc cập nhật)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("📤 Dữ liệu gửi đi:", form);
      if (form.email && students.some((s) => s.email === form.email)) {
        await updateStudent(form.email, form, token);
      } else {
        await registerStudent(form, token);
      }
      setForm(null);
      fetchStudents();
    } catch (err) {
      console.error("❌ Lỗi khi lưu sinh viên:", err);
      alert("Không thể lưu sinh viên. Kiểm tra dữ liệu nhập hoặc quyền truy cập.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">👩‍🎓 Quản lý học sinh</h2>

      {/* Nút thêm học sinh */}
      <button
        onClick={() =>
          setForm({
            firstName: "",
            lastName: "",
            email: "",
            campus: "",
            dateOfBirth: "",
          })
        }
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
      >
        + Thêm học sinh
      </button>

      {/* Form thêm / sửa */}
      {form && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 mb-6 shadow rounded-md border border-gray-200"
        >
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Họ"
              className="border p-2 flex-1 rounded"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Tên"
              className="border p-2 flex-1 rounded"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="email"
              placeholder="Email"
              className="border p-2 flex-1 rounded"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={!!students.some((s) => s.email === form.email)} // tránh đổi email khi edit
            />
            <input
              type="text"
              placeholder="Campus"
              className="border p-2 flex-1 rounded"
              value={form.campus}
              onChange={(e) => setForm({ ...form, campus: e.target.value })}
            />
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="date"
              className="border p-2 flex-1 rounded"
              value={form.dateOfBirth || ""}
              onChange={(e) =>
                setForm({ ...form, dateOfBirth: e.target.value })
              }
            />
          </div>

          <div className="mt-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="ml-3 border px-4 py-2 rounded hover:bg-gray-100"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Bảng danh sách */}
      <table className="min-w-full border bg-white shadow text-sm">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Họ tên</th>
            <th className="p-2 border">Campus</th>
            <th className="p-2 border text-center">Ngày sinh</th>
            <th className="p-2 border text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s) => (
              <tr key={s.email} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{s.email}</td>
                <td className="p-2 border">
                  {s.firstName} {s.lastName}
                </td>
                <td className="p-2 border">{s.campus || "-"}</td>
                <td className="p-2 border text-center">
                  {s.dateOfBirth || "-"}
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => setForm(s)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(s.email)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                Không có học sinh nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
