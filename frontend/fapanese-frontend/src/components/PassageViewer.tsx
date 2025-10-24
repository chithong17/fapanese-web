import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Cài đặt: npm install react-icons

interface PassageViewerProps {
  passage: string;
  romaji?: string;
  meaning?: string;
}

const PassageViewer: React.FC<PassageViewerProps> = ({ passage, romaji, meaning }) => {
  const [showRomaji, setShowRomaji] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  return (
    <div className="space-y-2">
      {/* Passage */}
      <p className="text-lg leading-relaxed bg-blue-50 p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
        {passage}
      </p>

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
      </div>

      {/* Conditional Content */}
      {showRomaji && romaji && (
        <p className="italic text-gray-500 text-sm bg-gray-100 p-2 rounded">
          {romaji}
        </p>
      )}
      {showMeaning && meaning && (
        <p className="text-sm text-gray-600 bg-yellow-100 p-2 rounded border border-yellow-200"> {/* Thêm style */}
          <strong>Nghĩa:</strong> {meaning}
        </p>
      )}
    </div>
  );
};

export default PassageViewer;