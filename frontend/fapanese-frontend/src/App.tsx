import { useRef, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

// --- IMPORTS CÁC COMPONENTS VÀ PAGES ---
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
import TeacherManageOverviewSpeakingQuestionsPage from "./pages/dashboard/TeacherManageOverviewSpeakingQuestionsPage";
import TeacherManageSpeakingItemsPage from "./pages/dashboard/TeacherManageSpeakingItemsPage";
import TeacherManageSpeakingQuestionsPage from "./pages/dashboard/TeacherManageSpeakingQuestionsPage";
import TeacherManageExamQuestionsPage from "./pages/dashboard/TeacherManageExamQuestionsPage";
import TeacherEditQuestionPage from "./pages/dashboard/TeacherEditQuestionPage";
import TeacherQuestionBankPage from "./pages/dashboard/TeacherQuestionBankPage";
import TeacherPanelLayout from "./pages/dashboard/TeacherPanelLayout"; // Layout cha
import TeacherMaterialsPage from "./pages/dashboard/TeacherMaterialsPage";
import StudentPanelLayout from "./pages/student-page/StudentPanelLayout";
import StudentMaterialsPage from "./pages/student-page/StudentMaterialsPage";
import axios from "axios";
import TeacherClassesPage from "./pages/dashboard/TeacherClassesPage";
import TeacherClassDetailPage from "./pages/dashboard/TeacherClassDetailPage";
import InterviewPractice from "./pages/InterviewPractice";

import FloatingActionButton from "./components/FloatingActionButton";

function AppWrapper() {
  return (
    <Router>
            <App />   {" "}
    </Router>
  );
}

// 👉 useLocation chỉ được phép dùng bên trong Router
function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isTeacherPage = location.pathname.startsWith("/teacher");
  const hideNavbar = isAdminPage || isTeacherPage;

  const alphabetRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">(
    "hiragana"
  );
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loadingPopup, setLoadingPopup] = useState(false); // Định nghĩa link "HỌC NGAY!"

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

  useEffect(() => {
    const fetchProfileAndClass = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return; // 1️⃣ Lấy thông tin người dùng

        const res = await axios.get(
          "http://localhost:8080/fapanese/api/users/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const user = res.data.result;
        if (user && user.role === "STUDENT") {
          localStorage.setItem("studentId", user.id); // 2️⃣ Sau khi có studentId -> gọi API lấy lớp

          const classRes = await axios.get(
            `http://localhost:8080/fapanese/api/classes/student/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const classes = classRes.data.result || [];
          if (classes.length > 0) {
            // ✅ Lưu class đầu tiên vào localStorage
            localStorage.setItem("classCourseId", classes[0].id);
          } else {
            console.warn("Sinh viên chưa được phân vào lớp nào.");
          }
        }
      } catch (err) {
        console.error("Không thể lấy thông tin profile hoặc lớp học", err);
      }
    };

    fetchProfileAndClass();
  }, []);

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
           {" "}
      {!hideNavbar && (
        <>
                   {" "}
          {loadingPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
                            <CircularProgress />           {" "}
            </div>
          )}
                   {" "}
          <Navbar
            scrollToSection={scrollToSection}
            onAuthClick={openAuth}
            userDropdownOpen={userDropdownOpen}
            setUserDropdownOpen={setUserDropdownOpen}
          />
                   {" "}
          <AuthPopup
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialTab={authTab}
          />
                 {" "}
        </>
      )}
           {" "}
      <Routes>
               {" "}
        <Route
          path="/"
          element={
            <main className="relative z-0 overflow-visible">
                            <BottomNav scrollToSection={scrollToSection} />     
                      {/* 2. TÍCH HỢP FloatingActionButton TẠI ĐÂY */}
                           {" "}
              <FloatingActionButton
              />
                            <HeroBackground />
                            <HeroBelow />
                            <FeatureSection />
                            <WhyUs />
                            <Quotes />             {" "}
              <section className="py-16 bg-gray-100">
                               {" "}
                <div className="max-w-6xl mx-auto px-6">
                                   {" "}
                  <h2 className="text-3xl font-bold text-center mb-8">
                                        GIỚI THIỆU CHỨC NĂNG FLASHCARDS        
                               {" "}
                    <span className="text-[#80D9E6] font-extrabold">
                                            GIÚP BẠN HỌC TẬP HIỆU QUẢ          
                               {" "}
                    </span>
                                     {" "}
                  </h2>
                                    <Flashcards cards={flashcardData} />       
                         {" "}
                </div>
                             {" "}
              </section>
                           {" "}
              <div ref={alphabetRef}>
                                <AlphabetLearning activeTab={activeTab} />     
                       {" "}
              </div>
                            <HeroQr />           {" "}
            </main>
          }
        />
               {" "}
        {/* --- 🌟 ROUTE GIẢNG VIÊN (SỬ DỤNG LAYOUT LỒNG NHAU) 🌟 --- */}       {" "}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["LECTURER", "ADMIN"]}>
                            <TeacherPanelLayout />{" "}
              {/* <-- Component Layout cha */}           {" "}
            </ProtectedRoute>
          }
        >
                   {" "}
          {/* 1. Các trang con sẽ render vào <Outlet /> của TeacherPanelLayout */}
                    <Route index element={<TeacherDashboard />} />
                    <Route path="courses" element={<TeacherCoursesPage />} />
                   {" "}
          <Route path="courses/:courseCode" element={<TeacherLessonsPage />} />
                   {" "}
          <Route
            path="courses/:courseCode/lessons/:lessonId/parts/:lessonPartId/manage"
            element={<TeacherLessonContentPage />}
          />
                   {" "}
          <Route path="question-bank" element={<TeacherQuestionBankPage />} />
                   {" "}
          <Route
            path="questions/:questionId/edit"
            element={<TeacherEditQuestionPage />}
          />
                   {" "}
          <Route
            path="courses/:courseCode/overviews/:overviewId/manage-parts"
            element={<TeacherOverviewPartsPage />}
          />
                   {" "}
          <Route
            path="courses/:courseCode/overviews/:overviewId/parts/:partId/manage-content"
            element={<TeacherManageOverviewContentPage />}
          />
                   {" "}
          <Route
            path="courses/:courseCode/overviews/:overviewId/parts/:partId/manage-content/speaking/:speakingExamId/items"
            element={<TeacherManageSpeakingItemsPage />}
          />
                   {" "}
          <Route
            path="courses/:courseCode/overviews/:overviewId/parts/:partId/manage-content/speaking/:speakingExamId/item/:speakingId/questions"
            element={<TeacherManageSpeakingQuestionsPage />}
          />
                   {" "}
          <Route
            path="courses/:courseCode/overviews/:overviewId/parts/:partId/manage-content/exam/:examId/questions"
            element={<TeacherManageExamQuestionsPage />}
          />
          {/* ✅ CÁC ROUTES ĐÃ ĐƯỢC DI CHUYỂN VÀO TRONG LAYOUT */}
                   {" "}
          <Route path="materials" element={<TeacherMaterialsPage />} />
                    <Route path="classes" element={<TeacherClassesPage />} />
                   {" "}
          <Route
            path="classes/:classId/details"
            element={<TeacherClassDetailPage />}
          />
                 {" "}
        </Route>
                {/* --- ROUTE HỌC SINH --- */}       {" "}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                            <StudentPanelLayout />           {" "}
            </ProtectedRoute>
          }
        >
                    <Route index element={<div>Trang chủ học sinh</div>} />
                   {" "}
          <Route path="materials" element={<StudentMaterialsPage />} />       {" "}
        </Route>
                {/* --- ROUTE ADMIN --- */}
               {" "}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminDashBoard />           {" "}
            </ProtectedRoute>
          }
        />
                        {/* --- CÁC ROUTE KHÁC --- */}
               {" "}
        <Route path="/dashboard/student" element={<StudentDashboard />} />
                <Route path="/aboutus" element={<AboutUs />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/courses" element={<Course />} />
               {" "}
        <Route path="/courses/:courseCode" element={<CourseLessonsPage />} />
               {" "}
        <Route
          path="/lesson/:courseCode/:lessonId/:lessonPartId"
          element={<Lesson />}
        />
               {" "}
        <Route
          path="/overview/:courseCode/:overviewId/:partId"
          element={<OverviewContentPage />}
        />
               {" "}
        <Route
          path="/pending-teachers"
          element={<AdminPendingTeachersPage />}
        />
               {" "}
        <Route path="/flashcard/:lessonPartId" element={<FlashcardPage />} />
        <Route path="/interview-practice" element={<InterviewPractice />} />   
         {" "}
      </Routes>
            {!hideNavbar && <Footer />}   {" "}
    </>
  );
}

export default AppWrapper;
