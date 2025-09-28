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

function App() {
  const alphabetRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">("hiragana");

  const scrollToSection = (id: string, tab?: "hiragana" | "katakana") => {
    if (id === "alphabet" && tab) {
      setActiveTab(tab);
      alphabetRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div>
      <Navbar scrollToSection={scrollToSection} />
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
    </div>
  );
}

export default App;
