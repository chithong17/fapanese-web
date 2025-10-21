import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ❌ Chưa đăng nhập
  if (!token) return <Navigate to="/" replace />;

  // ⚠️ Không có quyền
  if (!allowedRoles.includes(role || "")) {
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/" replace />;
  }

  // ✅ Được phép truy cập
  return <>{children}</>;
}
