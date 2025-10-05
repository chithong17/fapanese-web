import { useRef, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Flashcards from "./components/Flashcards";
import Navbar from "./components/Navbar";
import HeroBackground from "./components/HeroBackground";
import HeroBelow from "./components/HeroBelow";
import CoursesSection from "./components/CoursesSection";
import FeatureSection from "./components/FeatureSection";
import WhyUs from "./components/WhyUs";
import Footer from "./components/Footer";
import Quotes from "./components/Quotes";
import AlphabetLearning from "./components/AlphabetLearning";
import AuthPopup from "./components/AuthPopup";
import BottomNav from "./components/BottomNav";
import JPD113 from "./pages/courses/JPD113";
import JPD123 from "./pages/courses/JPD123";
import JPD133 from "./pages/courses/JPD133";
import HeroQr from "./components/HeroQr";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AboutUs from "./pages/AboutUs";
import ProfilePage from "./pages/ProfilePage";

// Component quản lý Loading khi route thay đổi
const LoadingWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000); // giả lập delay load
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <CircularProgress />
        </div>
      )}
      <div className={loading ? "opacity-50 pointer-events-none" : ""}>{children}</div>
    </>
  );
};

function App() {
  const alphabetRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">("hiragana");

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
    setIsAuthOpen(true);
  };

  const flashcardData = [
    {
      title: "Bảng chữ cái",
      description: "Học Hiragana và Katakana cơ bản với ví dụ và bài tập.",
    },
    {
      title: "Ngữ pháp",
      description:
        "Tìm hiểu các quy tắc ngữ pháp cơ bản, trợ từ và câu đơn giản.",
    },
    {
      title: "Từ vựng",
      description:
        "Mở rộng vốn từ qua các chủ đề hằng ngày và tình huống giao tiếp.",
    },
    {
      title: "Speaking",
      description: "Luyện tập phản xạ, phát âm và giao tiếp tự nhiên.",
    },
  ];

  return (
    <Router>
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

      <LoadingWrapper>
        <Routes>
          <Route
            path="/"
            element={
              <main className="relative z-0 overflow-visible">
                <BottomNav scrollToSection={scrollToSection} />
                <HeroBackground />
                <HeroBelow />
                <CoursesSection />
                <FeatureSection />
                <WhyUs />
                <Quotes />
                <section className="py-16 bg-gray-100">
                  <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
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
                <Footer />
              </main>
            }
          />
          <Route path="/courses/JPD113" element={<JPD113 />} />
          <Route path="/courses/JPD123" element={<JPD123 />} />
          <Route path="/courses/JPD133" element={<JPD133 />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </LoadingWrapper>
    </Router>
  );
}

export default App;
