import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiHelpCircle } from 'react-icons/fi'; // Cài đặt: npm install react-icons

interface QuestionViewerProps {
  question: string;
  romaji?: string;
  meaning?: string;
  answer?: string;
  answerRomaji?: string;
  answerMeaning?: string;
  isSuggestion?: boolean; // Để đánh dấu là 'gợi ý'
}

const QuestionViewer: React.FC<QuestionViewerProps> = ({
  question, romaji, meaning, answer, answerRomaji, answerMeaning, isSuggestion
}) => {
  const [showRomaji, setShowRomaji] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="text-sm border-b pb-3 pt-2 last:border-b-0 space-y-1">
      {/* Question */}
      <p className="font-medium text-gray-800">{question}</p> {/* Style câu hỏi */}

      {/* Toggle Buttons */}
      <div className="flex flex-wrap gap-2 text-xs"> {/* Dùng flex-wrap và gap */}
        {romaji && (
          <button
            onClick={() => setShowRomaji(!showRomaji)}
            className="flex items-center px-2 py-1 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 transition"
          >
            {showRomaji ? <FiEyeOff className="mr-1" /> : <FiEye className="mr-1" />}
            Romaji
          </button>
        )}
        {meaning && (
           <button
             onClick={() => setShowMeaning(!showMeaning)}
             className="flex items-center px-2 py-1 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 transition"
           >
             {showMeaning ? <FiEyeOff className="mr-1" /> : <FiEye className="mr-1" />}
             Nghĩa
           </button>
        )}
        {answer && (
           <button
             onClick={() => setShowAnswer(!showAnswer)}
             className="flex items-center px-2 py-1 bg-blue-100 rounded text-blue-800 hover:bg-blue-200 transition"
           >
             {showAnswer ? <FiEyeOff className="mr-1" /> : <FiHelpCircle className="mr-1" />}
             Đáp án{isSuggestion && " (gợi ý)"}
           </button>
        )}
      </div>

      {/* Conditional Content */}
      {showRomaji && romaji && (
         <p className="italic text-gray-500 text-xs bg-gray-100 p-1 rounded">
            ({romaji})
         </p>
      )}
       {showMeaning && meaning && (
         <p className="text-gray-500 italic text-xs bg-yellow-100 p-1 rounded border border-yellow-200"> {/* Thêm style */}
            ({meaning})
         </p>
       )}
      {showAnswer && answer && (
        <div className="text-blue-700 mt-1 bg-blue-100 p-2 rounded text-xs space-y-1 border border-blue-200"> {/* Thêm style */}
          <p><strong>Đáp{isSuggestion && " (gợi ý)"}:</strong> {answer}</p>
          {answerRomaji && <p className="italic text-blue-600">({answerRomaji})</p>}
          {answerMeaning && <p className="italic text-blue-600">({answerMeaning})</p>}
        </div>
      )}
    </div>
  );
};

export default QuestionViewer;