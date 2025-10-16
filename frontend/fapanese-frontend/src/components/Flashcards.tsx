import React, { useState } from "react";
import ScrollReveal from "./ScrollReveal";

interface FlashcardsProps {
  cards: { title: string; description: string }[];
  className?: string; // thêm dòng này
}

const Flashcards: React.FC<FlashcardsProps> = ({ cards, className }) => {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const nextCard = () => {
    setFlipped(false);
    setCurrent((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setFlipped(false);
    setCurrent((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const card = cards[current];

  return (
    <ScrollReveal>
      {/* Dùng className ở đây để custom layout */}
      <div className={`flex flex-col items-center space-y-8 ${className}`}>
        <div
          className="relative w-96 h-64 perspective cursor-pointer"
          onClick={() => setFlipped(!flipped)}
        >
          <div
            className={`relative w-full h-full rounded-3xl shadow-2xl transition-transform duration-700 transform-style-preserve-3d ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Front */}
            <div className="absolute w-full h-full bg-gradient-to-br from-gray-400 to-white rounded-3xl shadow-lg flex flex-col justify-center p-6 backface-hidden">
              <h3 className="text-2xl font-bold text-gray-900">{card.title}</h3>
              <p className="mt-2 text-gray-700 text-center text-sm">
                Click để xem chi tiết
              </p>
              <div className="absolute bottom-4 right-4 bg-gray-200/70 px-3 py-1 rounded-lg text-gray-800 font-semibold text-sm">
                Fap 先生
              </div>
            </div>

            {/* Back */}
            <div className="absolute w-full h-full bg-gradient-to-br from-gray-200 to-white rounded-3xl shadow-lg flex flex-col justify-center p-6 rotate-y-180 backface-hidden">
              <h3 className="text-2xl font-bold text-gray-900">{card.title}</h3>
              <p className="mt-2 text-gray-800 text-center">{card.description}</p>
              <div className="absolute bottom-4 right-4 bg-gray-200/70 px-3 py-1 rounded-lg text-gray-800 font-semibold text-sm">
                Fap 先生
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4">
          <button
            onClick={prevCard}
            className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
          >
            Prev
          </button>
          <button
            onClick={nextCard}
            className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
          >
            Next
          </button>
        </div>
      </div>
    </ScrollReveal>
  );
};


export default Flashcards;
