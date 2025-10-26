import { useRef, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Flashcards from "./components/Flashcards";
import Navbar from "./components/Navbar";
import HeroBackground from "./components/HeroBackground";
import HeroBelow from "./components/HeroBelow";
import FeatureSection from "./components/FeatureSection";
import WhyUs from "./components/WhyUs";
import Footer from "./components/Footer";
import Quotes from "./components/Quotes";
import AlphabetLearning from "./components/AlphabetLearning";
import AuthPopup from "./components/AuthPopup";
import BottomNav from "./components/BottomNav";
import HeroQr from "./components/HeroQr";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AboutUs from "./pages/AboutUs";
import ProfilePage from "./pages/ProfilePage";
import Course from "./pages/courses/Course";
import Lesson from "./pages/lesson/LessonContentPage";
import CourseLessonsPage from "./pages/courses/CourseLessonsPage";
import FlashcardPage from "./pages/lesson/flashcard/FlashcardPage";
import AdminDashBoard from "./pages/dashboard/AdminDashBoard";
import ProtectedRoute from "./components/ProtectedRoute";
import OverviewContentPage from "./pages/overview/OverviewContentPage";
import AdminPendingTeachersPage from "./pages/dashboard/AdminPendingTeachersPage";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import TeacherCoursesPage from "./pages/dashboard/TeacherCoursesPage";
import TeacherLessonsPage from "./pages/dashboard/TeacherLessonsPage";
import TeacherLessonContentPage from "./pages/dashboard/TeacherLessonContentPage";
import TeacherOverviewPartsPage from "./pages/dashboard/TeacherOverviewPartsPage";
import TeacherManageOverviewContentPage from "./pages/dashboard/TeacherManageOverviewContentPage";

// 1. IMPORT FloatingActionButton TẠI ĐÂY
import FloatingActionButton from "./components/FloatingActionButton";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

// 👉 useLocation chỉ được phép dùng bên trong Router
function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  const alphabetRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">(
    "hiragana"
  );
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loadingPopup, setLoadingPopup] = useState(false);

  // Định nghĩa link "HỌC NGAY!"
  const learnNowLink = "/courses";

  const scrollToSection = (id: string, tab?: "hiragana" | "katakana") => {
    if (id === "alphabet" && tab) {
      setActiveTab(tab);
      alphabetRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openAuth = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setLoadingPopup(true);
    setTimeout(() => {
      setLoadingPopup(false);
      setIsAuthOpen(true);
    }, 600);
  };

  const flashcardData = [
    { title: "Bảng chữ cái", description: "Học Hiragana và Katakana cơ bản." },
    { title: "Ngữ pháp", description: "Tìm hiểu các quy tắc ngữ pháp cơ bản." },
    {
      title: "Từ vựng",
      description: "Mở rộng vốn từ qua các chủ đề hằng ngày.",
    },
    {
      title: "Speaking",
      description: "Luyện tập phản xạ và phát âm tự nhiên.",
    },
  ];

  return (
    <>
      {!isAdminPage && (
        <>
          {loadingPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
              <CircularProgress />
            </div>
          )}
          <Navbar
            scrollToSection={scrollToSection}
            onAuthClick={openAuth}
            userDropdownOpen={userDropdownOpen}
            setUserDropdownOpen={setUserDropdownOpen}
          />
          <AuthPopup
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialTab={authTab}
          />
        </>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <main className="relative z-0 overflow-visible">
              <BottomNav scrollToSection={scrollToSection} />

              {/* 2. TÍCH HỢP FloatingActionButton TẠI ĐÂY */}
              <FloatingActionButton
                link={learnNowLink}
              // Giữ nguyên các props khác để component sử dụng hình ảnh SVG đã import
              />

              <HeroBackground />
              <HeroBelow />
              <FeatureSection />
              <WhyUs />
              <Quotes />
              <section className="py-16 bg-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                  <h2 className="text-3xl font-bold text-center mb-8">
                    GIỚI THIỆU CHỨC NĂNG FLASHCARDS{" "}
                    <span className="text-[#80D9E6] font-extrabold">
                      GIÚP BẠN HỌC TẬP HIỆU QUẢ
                    </span>
                  </h2>
                  <Flashcards cards={flashcardData} />
                </div>
              </section>
              <div ref={alphabetRef}>
                <AlphabetLearning activeTab={activeTab} />
              </div>
              <HeroQr />
            </main>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["LECTURER", "ADMIN"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute allowedRoles={["LECTURER", "ADMIN"]}>
              <TeacherCoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/courses/:courseCode"
          element={
            <ProtectedRoute allowedRoles={["LECTURER", "ADMIN"]}>
              <TeacherLessonsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/courses/:courseCode/lessons/:lessonId/parts/:lessonPartId/manage"
          element={
            <ProtectedRoute allowedRoles={["LECTURER", "ADMIN"]}>
              <TeacherLessonContentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/courses/:courseCode/overviews/:overviewId/manage-parts"
          element={
            <ProtectedRoute allowedRoles={["LECTURER", "ADMIN"]}>
              <TeacherOverviewPartsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/courses/:courseCode/overviews/:overviewId/parts/:partId/manage-content"
          element={
            <ProtectedRoute allowedRoles={["LECTURER", "ADMIN"]}>
              <TeacherManageOverviewContentPage />
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/courses" element={<Course />} />
        <Route path="/courses/:courseCode" element={<CourseLessonsPage />} />
        <Route
          path="/lesson/:courseCode/:lessonId/:lessonPartId"
          element={<Lesson />}
        />
        <Route
          path="/overview/:courseCode/:overviewId/:partId"
          element={<OverviewContentPage />}
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-teachers"
          element={<AdminPendingTeachersPage />}
        />
        <Route path="/flashcard/:lessonPartId" element={<FlashcardPage />} />
      </Routes>

      {!isAdminPage && <Footer />}
    </>
  );
}

export default AppWrapper;
