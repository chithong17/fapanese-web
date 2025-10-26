import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Đọc token/role và đánh dấu xong
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    setToken(t);
    setRole(r);

    // Delay 100ms để tránh race condition khi navigate nhanh
    const timeout = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Đang xác thực quyền truy cập...
      </div>
    );
  }

  if (!token) {
    console.warn("🚫 Không có token, quay về trang chủ");
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role || "")) {
    console.warn("⛔ Không có quyền:", role);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
