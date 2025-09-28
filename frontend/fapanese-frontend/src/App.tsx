import React, { useRef, useState } from "react";
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



function App() {
  const alphabetRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">("hiragana");

  // State quản lý Auth Popup
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const scrollToSection = (id: string, tab?: "hiragana" | "katakana") => {
    if (id === "alphabet" && tab) {
      setActiveTab(tab);
      alphabetRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Hàm mở popup Auth
  const openAuth = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <div>
      {/* Navbar truyền hàm openAuth */}
      <Navbar scrollToSection={scrollToSection} onAuthClick={openAuth} />

      <main>
        <HeroBackground />
        <HeroBelow />
        <CoursesSection />
        <FeatureSection />
        <WhyUs />
        <Quotes />

        <div ref={alphabetRef}>
          <AlphabetLearning activeTab={activeTab} />
        </div>

        <Footer />
      </main>

      {/* Auth Popup */}
      <AuthPopup
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />

   

      
    </div>
  );
}

export default App;
