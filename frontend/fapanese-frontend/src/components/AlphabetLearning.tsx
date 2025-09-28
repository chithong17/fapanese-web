import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

interface Kana {
  symbol: string;
  romaji: string;
}

interface AlphabetLearningProps {
  activeTab: "hiragana" | "katakana";
}

const hiragana: Kana[] = [
  { symbol: "あ", romaji: "a" },
  { symbol: "い", romaji: "i" },
  { symbol: "う", romaji: "u" },
  { symbol: "え", romaji: "e" },
  { symbol: "お", romaji: "o" },

  { symbol: "か", romaji: "ka" },
  { symbol: "き", romaji: "ki" },
  { symbol: "く", romaji: "ku" },
  { symbol: "け", romaji: "ke" },
  { symbol: "こ", romaji: "ko" },

  { symbol: "さ", romaji: "sa" },
  { symbol: "し", romaji: "shi" },
  { symbol: "す", romaji: "su" },
  { symbol: "せ", romaji: "se" },
  { symbol: "そ", romaji: "so" },

  { symbol: "た", romaji: "ta" },
  { symbol: "ち", romaji: "chi" },
  { symbol: "つ", romaji: "tsu" },
  { symbol: "て", romaji: "te" },
  { symbol: "と", romaji: "to" },

  { symbol: "な", romaji: "na" },
  { symbol: "に", romaji: "ni" },
  { symbol: "ぬ", romaji: "nu" },
  { symbol: "ね", romaji: "ne" },
  { symbol: "の", romaji: "no" },

  { symbol: "は", romaji: "ha" },
  { symbol: "ひ", romaji: "hi" },
  { symbol: "ふ", romaji: "fu" },
  { symbol: "へ", romaji: "he" },
  { symbol: "ほ", romaji: "ho" },

  { symbol: "ま", romaji: "ma" },
  { symbol: "み", romaji: "mi" },
  { symbol: "む", romaji: "mu" },
  { symbol: "め", romaji: "me" },
  { symbol: "も", romaji: "mo" },

  { symbol: "や", romaji: "ya" },
  { symbol: "ゆ", romaji: "yu" },
  { symbol: "よ", romaji: "yo" },

  { symbol: "ら", romaji: "ra" },
  { symbol: "り", romaji: "ri" },
  { symbol: "る", romaji: "ru" },
  { symbol: "れ", romaji: "re" },
  { symbol: "ろ", romaji: "ro" },

  { symbol: "わ", romaji: "wa" },
  { symbol: "を", romaji: "wo" },
  { symbol: "ん", romaji: "n" },
];


const katakana: Kana[] = [
  { symbol: "ア", romaji: "a" },
  { symbol: "イ", romaji: "i" },
  { symbol: "ウ", romaji: "u" },
  { symbol: "エ", romaji: "e" },
  { symbol: "オ", romaji: "o" },

  { symbol: "カ", romaji: "ka" },
  { symbol: "キ", romaji: "ki" },
  { symbol: "ク", romaji: "ku" },
  { symbol: "ケ", romaji: "ke" },
  { symbol: "コ", romaji: "ko" },

  { symbol: "サ", romaji: "sa" },
  { symbol: "シ", romaji: "shi" },
  { symbol: "ス", romaji: "su" },
  { symbol: "セ", romaji: "se" },
  { symbol: "ソ", romaji: "so" },

  { symbol: "タ", romaji: "ta" },
  { symbol: "チ", romaji: "chi" },
  { symbol: "ツ", romaji: "tsu" },
  { symbol: "テ", romaji: "te" },
  { symbol: "ト", romaji: "to" },

  { symbol: "ナ", romaji: "na" },
  { symbol: "ニ", romaji: "ni" },
  { symbol: "ヌ", romaji: "nu" },
  { symbol: "ネ", romaji: "ne" },
  { symbol: "ノ", romaji: "no" },

  { symbol: "ハ", romaji: "ha" },
  { symbol: "ヒ", romaji: "hi" },
  { symbol: "フ", romaji: "fu" },
  { symbol: "ヘ", romaji: "he" },
  { symbol: "ホ", romaji: "ho" },

  { symbol: "マ", romaji: "ma" },
  { symbol: "ミ", romaji: "mi" },
  { symbol: "ム", romaji: "mu" },
  { symbol: "メ", romaji: "me" },
  { symbol: "モ", romaji: "mo" },

  { symbol: "ヤ", romaji: "ya" },
  { symbol: "ユ", romaji: "yu" },
  { symbol: "ヨ", romaji: "yo" },

  { symbol: "ラ", romaji: "ra" },
  { symbol: "リ", romaji: "ri" },
  { symbol: "ル", romaji: "ru" },
  { symbol: "レ", romaji: "re" },
  { symbol: "ロ", romaji: "ro" },

  { symbol: "ワ", romaji: "wa" },
  { symbol: "ヲ", romaji: "wo" },
  { symbol: "ン", romaji: "n" },
];

interface AlphabetLearningProps {
  initialTab?: "hiragana" | "katakana"; // optional
}


const AlphabetLearning: React.FC<AlphabetLearningProps> = ({ initialTab = "hiragana" }) => {
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">(initialTab);
  const [learningMode, setLearningMode] = useState<"sequential" | "shuffle">("sequential");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentKana, setCurrentKana] = useState<Kana | null>(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [learnedKana, setLearnedKana] = useState<Kana[]>([]);

  const kanaList = activeTab === "hiragana" ? hiragana : katakana;

  useEffect(() => {
    if (learningMode === "sequential") {
      setCurrentKana(kanaList[currentIndex]);
    } else {
      const randomIndex = Math.floor(Math.random() * kanaList.length);
      setCurrentKana(kanaList[randomIndex]);
    }
    setInput("");
    setFeedback("");
  }, [currentIndex, learningMode, activeTab]);

  const handleSubmit = () => {
    if (!currentKana) return;
    if (input.toLowerCase() === currentKana.romaji.toLowerCase()) {
      setFeedback("✅ Đúng!");
      setLearnedKana((prev) => [...prev, currentKana]);
    } else {
      setFeedback(`❌ Sai! Đáp án: ${currentKana.romaji}`);
    }
    setTimeout(() => {
      setFeedback("");
      setInput("");
      if (learningMode === "sequential") {
        setCurrentIndex((prev) => (prev + 1) % kanaList.length);
      } else {
        const randomIndex = Math.floor(Math.random() * kanaList.length);
        setCurrentKana(kanaList[randomIndex]);
      }
    }, 800);
  };

 const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") handleSubmit();
};


  const progress = ((learnedKana.length / kanaList.length) * 100).toFixed(0);

  return (
    <ScrollReveal>
      <section className="w-full bg-gray-100 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tiêu đề */}
          <h2 className="text-4xl font-extrabold mb-4 text-gray-900">Học Bảng Chữ Cái</h2>
          <p className="text-gray-700 mb-8">
            Chọn bảng chữ cái và chế độ học, nhập romaji cho mỗi chữ cái để luyện tập.
          </p>

          {/* Tabs */}
          <div className="flex justify-center mb-6 space-x-4">
            {["hiragana", "katakana"].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-2 rounded-2xl font-bold ${
                  activeTab === tab ? "bg-gray-900 text-white" : "bg-white/20 text-gray-900"
                } transition`}
                onClick={() => { setActiveTab(tab as "hiragana" | "katakana"); setCurrentIndex(0); setLearnedKana([]); }}
              >
                {tab === "hiragana" ? "Hiragana" : "Katakana"}
              </button>
            ))}
          </div>

          {/* Mode */}
          <div className="flex justify-center mb-8 space-x-4">
            <button
              className={`px-6 py-2 rounded-2xl font-bold ${
                learningMode === "sequential" ? "bg-gray-900 text-white" : "bg-white/20 text-gray-900"
              } transition`}
              onClick={() => { setLearningMode("sequential"); setCurrentIndex(0); setLearnedKana([]); }}
            >
              Theo thứ tự
            </button>
            <button
              className={`px-6 py-2 rounded-2xl font-bold ${
                learningMode === "shuffle" ? "bg-gray-900 text-white" : "bg-white/20 text-gray-900"
              } transition`}
              onClick={() => { setLearningMode("shuffle"); setLearnedKana([]); }}
            >
              Trộn lẫn
            </button>
          </div>

          {/* Progress */}
          <div className="mb-6 w-full bg-white/30 rounded-full h-3 mx-auto overflow-hidden">
            <div
              className="bg-gray-900 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className=" mb-6 text-gray-700 font-medium">{learnedKana.length} / {kanaList.length} chữ cái đã học</p>

          {/* Chữ cái lớn */}
          {currentKana && (
            <motion.div
              key={currentKana.symbol}
              className="mb-6 p-8 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-6xl font-extrabold text-gray-900">{currentKana.symbol}</span>
            </motion.div>
          )}

          {/* Input */}
          <div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập romaji..."
              className="px-6 py-3 rounded-xl border border-gray-300 shadow-md text-center text-xl mb-3 w-64"
            />
            <div>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-700 transition"
              >
                Kiểm tra
              </button>
            </div>
            {feedback && (
              <motion.p
                className={`mt-3 text-lg font-semibold ${
                  feedback.includes("") ? "text-green-500" : "text-red-500"
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {feedback}
              </motion.p>
            )}
          </div>

          {/* Mini grid tất cả chữ cái */}
          <div className="grid grid-cols-10 gap-2 mt-10">
            {kanaList.map((k, idx) => (
              <div
                key={idx}
                className={`text-xl p-2 rounded text-center ${
                  learnedKana.includes(k) ? "bg-green-100 text-green-700" : "bg-white/10 text-gray-800"
                }`}
              >
                {k.symbol}
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
};

export default AlphabetLearning;
