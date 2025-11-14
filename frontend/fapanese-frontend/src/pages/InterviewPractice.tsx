import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CircularProgress from "@mui/material/CircularProgress";
// Icons
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PersonIcon from "@mui/icons-material/Person";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import GavelIcon from '@mui/icons-material/Gavel';
// Đã xóa import các icon RecordVoiceOverIcon, AutoFixHighIcon, GradeIcon

// --- Component Card cho giới thiệu (NỀN TRẮNG SẠCH) ---
const IntroFeatureCard: React.FC<{
    // Đã xóa prop 'icon'
    title: string;
    description: string;
    delay: number;
}> = ({ title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: delay, type: "spring", stiffness: 150 }}
        // Nền trắng, shadow nhẹ, bo góc đẹp
        className="flex flex-col items-center text-center p-6 bg-white/90 border border-gray-100 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
    >
        {/* Đã xóa phần hiển thị icon */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
);

// --- Component Card cho phản hồi (NỀN TRẮNG/GRADIENT SẠCH) ---
const ResultCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    content: string;
    audioElement?: React.ReactNode;
    color: 'blue' | 'cyan';
}> = ({ icon, title, content, audioElement, color }) => {
    const primaryColor = 'text-cyan-600'; 
    const borderColor = color === 'blue' ? 'border-blue-200' : 'border-cyan-300';
    const shadowColor = color === 'blue' ? 'shadow-blue-300/30' : 'shadow-cyan-300/30';
    // Sử dụng màu nền gradient nhẹ cho AI, trắng cho User
    const bgColor = color === 'blue' ? 'bg-white/95' : 'bg-gradient-to-br from-cyan-50 to-blue-50';


    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className={`${bgColor} rounded-[2rem] border ${borderColor} shadow-2xl ${shadowColor} p-8 lg:p-10 relative overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-lg backdrop-blur-sm`}
        >
            <div className="flex items-center mb-6 border-b pb-4 border-gray-100">
                <div className={`${primaryColor} mr-3 text-3xl`}>{icon}</div>
                <h3 className="text-2xl font-extrabold text-gray-800">{title}</h3>
            </div>
            
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg mb-6 border-l-4 pl-4 border-dashed border-opacity-50 border-cyan-400">
                {content}
            </p>

            {audioElement && (
                <div className="mt-6 pt-5 border-t border-gray-200">
                    {audioElement}
                </div>
            )}
        </motion.div>
    );
};

// --- Component Chính ---
const InterviewPractice: React.FC = () => {
    const [recording, setRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userText, setUserText] = useState("");
    const [aiText, setAiText] = useState("");
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState(true); 

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const resetState = useCallback(() => {
        setUserText("");
        setAiText("");
        setAudioUrl(null);
        setUserAudioUrl(null);
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            
            resetState(); 
            setInitialLoad(false); 

            recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            
            recorder.onstop = async () => {
                setLoading(true);
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                
                const userUrl = URL.createObjectURL(blob);
                setUserAudioUrl(userUrl); 
                
                const formData = new FormData();
                formData.append("audio", blob, "input.webm");

                try {
                    const res = await fetch("http://localhost:8080/fapanese/api/interview/interact", {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) {
                        throw new Error(`HTTP Error: ${res.status}`);
                    }
                    
                    const data = await res.json();
                    
                    setUserText(data.userText || "Không nhận dạng được giọng nói.");
                    setAiText(data.aiText || "Không nhận được phản hồi từ AI.");
                    
                    if (data.audioBase64) {
                        const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
                        const audioBlob = new Blob([bytes], { type: "audio/wav" });
                        setAudioUrl(URL.createObjectURL(audioBlob));
                    }
                    
                } catch (error) {
                    console.error("Fetch/Processing Error:", error);
                    setUserText("Lỗi: Không thể kết nối hoặc xử lý dữ liệu. Vui lòng kiểm tra server.");
                    setAiText("Lỗi server. Không thể đưa ra nhận xét.");
                } finally {
                    setLoading(false);
                }
            };

            recorder.start();
            setRecording(true);
        } catch (error) {
            console.error("Microphone Access Error:", error);
            alert("Không thể truy cập Microphone. Vui lòng cấp quyền trong cài đặt trình duyệt!");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };
    
    useEffect(() => {
        if (!loading && aiText && audioUrl && audioRef.current && !recording) {
            const playTimeout = setTimeout(() => {
                audioRef.current?.play().catch(e => console.error("Autoplay failed:", e));
            }, 300);
            return () => clearTimeout(playTimeout);
        }
    }, [aiText, audioUrl, loading, recording]);


    const renderAudioPlayer = (url: string | null, isAI: boolean) => {
        if (!url) return null;
        const icon = isAI ? <VolumeUpIcon className="text-cyan-600 text-xl" /> : <HeadsetMicIcon className="text-blue-500 text-xl" />;
        const label = isAI ? "Nghe nhận xét:" : "Nghe lại bản gốc:";
        const audioClass = isAI ? "bg-cyan-100" : "bg-blue-100";

        return (
            <div className="flex items-center gap-3">
                {icon}
                <p className="text-sm font-semibold text-gray-600">{label}</p>
                <audio 
                    ref={isAI ? audioRef : null} 
                    controls 
                    src={url} 
                    className={`flex-grow rounded-full h-10 shadow-inner ${audioClass} transition-all`} 
                />
            </div>
        );
    };

    const showResults = !loading && (userText || aiText) && !initialLoad;

    return (
        // NỀN CHÍNH: GRADIENT ĐỘNG VÀ SẠCH SẼ
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden p-4 md:p-8">
            {/* Lớp nền ảo ảnh 3D */}
            <motion.div
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(circle at 10% 90%, rgba(59,130,246,0.1), transparent 75%), radial-gradient(circle at 90% 10%, rgba(6,182,212,0.15), transparent 65%)",
                }}
                animate={{
                    opacity: [1, 0.9, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* CARD CHÍNH - GLASSMORPHISM */}
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, type: "spring", stiffness: 50 }}
                className="w-full max-w-7xl bg-white/70 backdrop-blur-md border border-white/80 shadow-4xl shadow-cyan-300/30 rounded-[1.5rem] p-6 md:p-12 transition-al drop-shadow-md"
            >
                {/* Header và Controls (Giữ nguyên) */}
                <div className="flex flex-col lg:flex-row justify-between items-center mb-10 md:mb-12 pt-15">
                    <div className="text-center lg:text-left mb-6 lg:mb-0">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#80D9E6] to-[#1abcca] drop-shadow-md ">
                            Fapanese AI Interview
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Luyện tập kỹ năng phỏng vấn chuyên nghiệp cùng Giám khảo AI</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Buttons (Giữ nguyên màu đồng bộ) */}
                        {!recording ? (
                            <motion.button
                                key="start"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(6, 182, 212, 0.6)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={startRecording}
                                disabled={loading}
                                className="px-10 py-4 rounded-full bg-gradient-to-r from-[#80D9E6] to-[#A4EBF2] text-white font-bold text-lg shadow-xl shadow-cyan-500/40 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <MicIcon /> BẮT ĐẦU PHẢN HỒI
                            </motion.button>
                        ) : (
                            <motion.button
                                key="stop"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(2, 132, 199, 0.6)" }} 
                                whileTap={{ scale: 0.98 }}
                                onClick={stopRecording}
                                className="px-10 py-4 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-lg shadow-xl shadow-blue-500/40 transition-all flex items-center gap-2"
                            >
                                <StopIcon /> DỪNG GHI ÂM
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
                
                <hr className="my-8 border-gray-200" />
                
                {/* PHẦN GIAO DIỆN KHỞI ĐẦU CHUYÊN NGHIỆP */}
                <AnimatePresence mode="wait">
                    {initialLoad && !loading && (
                        <motion.div
                            key="intro-screen"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-8">
                                Quy trình luyện tập chuyên nghiệp
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
                                {/* ĐÃ XÓA ICON TRONG INTRO FEATURE CARDS */}
                                <IntroFeatureCard
                                    title="1. Ghi âm giọng nói"
                                    description="Hệ thống lắng nghe phản hồi của bạn về câu hỏi phỏng vấn hiện tại bằng công nghệ nhận dạng giọng nói tiên tiến."
                                    delay={0.1}
                                />
                                <IntroFeatureCard
                                    title="2. Phân tích ngữ cảnh"
                                    description="AI phân tích ngữ pháp, từ vựng, độ lưu loát và sự phù hợp ngữ cảnh của câu trả lời bạn vừa cung cấp."
                                    delay={0.25}
                                />
                                <IntroFeatureCard
                                    title="3. Nhận phản hồi chuyên sâu"
                                    description="Nhận văn bản phản hồi song ngữ (Nhật/Việt) và audio nhận xét từ giám khảo AI để cải thiện ngay lập tức."
                                    delay={0.4}
                                />
                            </div>

                            {/* THẺ MẸO VỚI NỀN SẠCH */}
                            <p className="text-center text-gray-600 italic mt-8 p-4 bg-white/70 rounded-xl max-w-3xl mx-auto border border-blue-100 shadow-inner flex items-center justify-center gap-2 backdrop-blur-sm">
                                <LightbulbIcon className="text-yellow-500" /> 
                            Sẵn sàng? Nhấn nút trên để bắt đầu. Hãy thể hiện khả năng tốt nhất của bạn!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Trạng thái xử lý */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            key="loading-state"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            // THẺ LOADING VỚI NỀN SẠCH
                            className="flex flex-col items-center text-gray-600 my-10 p-10 rounded-3xl bg-white/90 shadow-2xl border border-cyan-100"
                        >
                            <CircularProgress style={{ color: "#06b6d4" }} size={70} thickness={5} />
                            <p className="mt-6 text-xl font-semibold italic text-cyan-700 animate-pulse">
                                AI đang phân tích & tạo nhận xét song ngữ... Xin chờ giây lát!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Kết quả */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div 
                            key="results-grid"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mt-12"
                        >
                            {/* ResultCard đã có nền sạch */}
                            <ResultCard
                                icon={<PersonIcon />}
                                title="Phản hồi của bạn (Đã chuyển đổi văn bản)"
                                content={userText}
                                color="blue"
                                audioElement={renderAudioPlayer(userAudioUrl, false)}
                            />

                            <ResultCard
                                icon={<GavelIcon />}
                                title="Nhận xét và Đánh giá từ Giám khảo AI"
                                content={aiText}
                                color="cyan"
                                audioElement={renderAudioPlayer(audioUrl, true)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default InterviewPractice;