import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Đọc token/role ngay lập tức, không cần delay
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    setToken(t);
    setRole(r);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Đang xác thực quyền truy cập...
      </div>
    );
  }

  if (!token) return <Navigate to="/" replace />;

  if (!allowedRoles.includes(role || "")) {
    console.warn("⛔ Không có quyền:", role);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
