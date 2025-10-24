import React, { useEffect, useState } from "react";
import { getPendingTeachers, approveTeacher, rejectTeacher } from "../../api/adminApi";
import { motion } from "framer-motion";
import NotificationModal from "../../components/NotificationModal"; // ✅ import modal của bạn
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";

interface Teacher {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  expertise?: string;
  bio?: string;
  dateOfBirth?: string;
}

const AdminPendingTeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await getPendingTeachers();
      setTeachers(data || []);
    } catch {
      setModalMessage("❌ Không thể tải danh sách giáo viên!");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveTeacher(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setModalMessage("✅ Đã phê duyệt giáo viên thành công!");
    } catch {
      setModalMessage("⚠️ Phê duyệt thất bại. Vui lòng thử lại!");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectTeacher(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setModalMessage("🚫 Đã từ chối giáo viên này.");
    } catch {
      setModalMessage("⚠️ Từ chối thất bại. Vui lòng thử lại!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600 text-lg">
        Đang tải danh sách...
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-140px)] bg-white border border-gray-100 rounded-2xl shadow-xl p-8">
      <motion.h1
        className="text-2xl sm:text-3xl font-bold text-cyan-600 mb-6 border-b pb-3 flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🧑‍🏫 Duyệt giáo viên
      </motion.h1>

      {teachers.length === 0 ? (
        <motion.div
          className="flex flex-col justify-center items-center text-gray-500 h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-xl font-medium">🎉 Không có giáo viên nào chờ duyệt</p>
          <p className="text-sm text-gray-400 mt-1">Tất cả đã được xử lý.</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {teachers.map((t) => (
            <motion.div
              key={t.id}
              className="p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {t.firstName} {t.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {t.email}
                </p>
                {t.expertise && (
                  <p className="text-sm text-gray-600">
                    <strong>Chuyên môn:</strong> {t.expertise}
                  </p>
                )}
                {t.bio && (
                  <p className="text-sm italic text-gray-500 mt-1 line-clamp-2">
                    “{t.bio}”
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-5">
                <motion.button
                  onClick={() => handleApprove(t.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-full font-semibold text-white
                  bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 shadow-md"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IoMdCheckmarkCircle className="text-lg" /> Duyệt
                </motion.button>

                <motion.button
                  onClick={() => handleReject(t.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-full font-semibold text-white
                  bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 shadow-md"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IoMdCloseCircle className="text-lg" /> Từ chối
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ✅ Modal thông báo dùng lại NotificationModal */}
      {modalMessage && (
        <NotificationModal message={modalMessage} onClose={() => setModalMessage(null)} />
      )}
    </div>
  );
};

export default AdminPendingTeachersPage;
