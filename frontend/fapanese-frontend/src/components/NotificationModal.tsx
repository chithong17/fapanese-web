import React from "react";

interface NotificationModalProps {
  message: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  message,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white text-black rounded-2xl shadow-2xl p-8 w-[90%] max-w-md transform transition-all duration-300 scale-100 animate-fadeIn">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Thông báo</h2>
        </div>
        <p className="mb-8 text-gray-600 leading-relaxed text-base">
          {message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;