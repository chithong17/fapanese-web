import React, { useState, useEffect, useRef } from "react";

// --- START: speakingApiService Logic ---
// (Logic API của bạn, đã bao gồm xác thực)

// Cấu hình URL gốc của API (thay đổi nếu cần)
const API_BASE_URL = "http://localhost:8080/fapanese/api";

// ---- 1. HÀM TIỆN ÍCH XÁC THỰC ----

/**
 * Lấy token từ localStorage.
 * !!! QUAN TRỌNG: Thay đổi "token" thành key của bạn nếu khác.
 */
const getToken = (): string | null => {
  return localStorage.getItem("token"); 
};

/**
 * Tạo Headers cho request JSON (GET, POST JSON)
 */
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Tạo Headers cho request FormData (POST File)
 */
const getAuthHeadersForFormData = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Xử lý lỗi response chung (đặc biệt là lỗi 401)
 */
const handleResponseError = async (response: Response) => {
  if (response.status === 401) {
    // window.location.href = '/login'; // Chuyển hướng nếu cần
    throw new Error("Xác thực thất bại. Vui lòng đăng nhập lại.");
  }
  try {
    const errorData = await response.json();
    throw new Error(errorData.message || "Đã xảy ra lỗi không xác định.");
  } catch (e) {
    throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
  }
};


// ---- 2. CÁC LOẠI DỮ LIỆU (TYPES) ----

interface SpeakingQuestion {
  id: number;
  question: string;
  questionRomaji: string;
  questionMeaning: string;
  answer: string;
  answerRomaji: string;
  answerMeaning: string;
}
interface PassagePart {
  id: number;
  topic: string;
  passage: string;
}
interface PicturePart {
  id: number;
  topic: string;
  imgUrl: string;
  questions: SpeakingQuestion[];
}
interface QuestionPart {
  id: number;
  topic: string;
  questions: SpeakingQuestion[];
}
interface GeneratedTestResponse {
  passagePart: PassagePart;
  picturePart: PicturePart;
  questionPart: QuestionPart;
}
interface GradingPayload {
  passageTranscript: string;
  passageOriginal: string;
  pictureQuestion: string;
  pictureAnswerTranscript: string;
  pictureAnswerSample: string;
  q1Question: string;
  q1AnswerTranscript: string;
  q1AnswerSample: string;
  q2Question: string;
  q2AnswerTranscript: string;
  q2AnswerSample: string;
}
interface GradingFeedback {
  passage: string;
  picture: string;
  question1: string;
  question2: string;
  overall: string;
}
interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ---- 3. CÁC HÀM GỌI API (Đã thêm xác thực) ----

async function generateTest(
  overviewPartId: number
): Promise<GeneratedTestResponse> {
  const response = await fetch(
    `${API_BASE_URL}/speaking-exams/generate-test/${overviewPartId}`,
    {
        method: "GET",
        headers: getAuthHeaders() 
    }
  );
  if (!response.ok) {
    await handleResponseError(response);
  }
  const data: ApiResponse<GeneratedTestResponse> = await response.json();
  if (data.code !== 1000) {
    throw new Error(data.message || "Lỗi khi lấy đề thi");
  }
  return data.result;
}

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.wav");

  const response = await fetch(`${API_BASE_URL}/interview/stt`, {
    method: "POST",
    headers: getAuthHeadersForFormData(), 
    body: formData,
  });

  if (!response.ok) {
    await handleResponseError(response);
  }
  const data = await response.json(); 
  return data.text || "";
}

async function gradeSpeakingTest(
  payload: GradingPayload
): Promise<GradingFeedback> {
  const response = await fetch(`${API_BASE_URL}/interview/grade-speaking-test`, { 
    method: "POST",
    headers: getAuthHeaders(), 
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  const data: ApiResponse<GradingFeedback> = await response.json();
  if (data.code !== 1000) {
    throw new Error(data.message || "Lỗi khi chấm điểm");
  }
  return data.result;
}

async function textToSpeech(text: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/interview/tts`, {
    method: "POST",
    headers: getAuthHeaders(), 
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    await handleResponseError(response);
  }
  return response.blob(); 
}

// --- END: speakingApiService Logic ---

// (Các Icon SVG giữ nguyên)
const MicIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path> <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path> <line x1="12" y1="19" x2="12" y2="23"></line> </svg> );
const StopCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <circle cx="12" cy="12" r="10"></circle> <rect x="9" y="9" width="6" height="6"></rect> </svg> );
const LoaderIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" > <line x1="12" y1="2" x2="12" y2="6"></line> <line x1="12" y1="18" x2="12" y2="22"></line> <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line> <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line> <line x1="2" y1="12" x2="6" y2="12"></line> <line x1="18" y1="12" x2="22" y2="12"></line> <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line> <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line> </svg> );
const PlayIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <polygon points="5 3 19 12 5 21 5 3"></polygon> </svg> );
const ChevronRightIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <polyline points="9 18 15 12 9 6"></polyline> </svg> );
const AlertTriangleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"> <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path> <line x1="12" x2="12" y1="9" y2="13"></line> <line x1="12" x2="12.01" y1="17" y2="17"></line> </svg> );
const CheckCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path> <polyline points="22 4 12 14.01 9 11.01"></polyline> </svg> );
const BookOpenIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path> <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path> </svg> );
const ImageIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect> <circle cx="8.5" cy="8.5" r="1.5"></circle> <polyline points="21 15 16 10 5 21"></polyline> </svg> );
const HelpCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <circle cx="12" cy="12" r="10"></circle> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path> <line x1="12" x2="12.01" y1="17" y2="17"></line> </svg> );
const AwardIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <circle cx="12" cy="8" r="7"></circle> <polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"></polyline> </svg> );


// Trạng thái của bài thi (Đã cập nhật)
type ExamPart =
  | "idle"
  | "loadingTest"
  | "passage"
  | "picture"
  | "question1"
  | "question2"
  | "grading"
  | "REVIEW_ALL"; // <-- Chỉ còn 1 trạng thái xem lại

// Trạng thái của các chức năng
type Status = "idle" | "recording" | "transcribing" | "speaking" | "error";

// Lưu transcript
interface Transcripts {
  passage: string;
  picture: string;
  q1: string;
  q2: string;
}

// Lưu URL của file ghi âm
interface Recordings {
  passage: string; // Sẽ lưu URL (từ URL.createObjectURL)
  picture: string;
  q1: string;
  q2: string;
}

export default function SpeakingTestPage() {
  const [currentPart, setCurrentPart] = useState<ExamPart>("idle");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [testData, setTestData] = useState<GeneratedTestResponse | null>(null);
  
  const [transcripts, setTranscripts] = useState<Transcripts>({
    passage: "", picture: "", q1: "", q2: "",
  });
  
  const [recordings, setRecordings] = useState<Recordings>({
      passage: "", picture: "", q1: "", q2: "",
  });

  const [feedback, setFeedback] = useState<GradingFeedback | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // --- LOGIC KHỞI ĐỘNG VÀ DỌN DẸP ---

  const cleanupRecordings = () => {
      Object.values(recordings).forEach(url => {
          if (url) URL.revokeObjectURL(url);
      });
      setRecordings({ passage: "", picture: "", q1: "", q2: "" });
  };

  const startTest = async (overviewPartId: number = 1) => {
    setCurrentPart("loadingTest");
    setError(null);
    setTranscripts({ passage: "", picture: "", q1: "", q2: "" });
    setFeedback(null); 
    cleanupRecordings(); 

    try {
      const data = await generateTest(overviewPartId);
      setTestData(data);
      setCurrentPart("passage");
    } catch (err: any) {
      setError(err.message || "Không thể tải đề thi");
      setCurrentPart("idle");
    }
  };

  useEffect(() => {
    return () => {
        cleanupRecordings();
    };
  }, []); 

  // --- LOGIC ÂM THANH (PHÁT VÀ THU) ---

  const speakQuestion = async (text: string) => {
    if (!text) return;
    setStatus("speaking");
    setError(null); 
    try {
      const audioBlob = await textToSpeech(text);
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        setStatus("idle");
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
         setError("Không thể phát file âm thanh.");
         setStatus("idle");
      }
    } catch (err: any) {
      setError("Lỗi TTS: " + err.message);
      setStatus("idle");
    }
  };

  useEffect(() => {
    if (currentPart === "picture" && testData) {
      speakQuestion(testData.picturePart.questions[0].question);
    } else if (currentPart === "question1" && testData) {
      speakQuestion(testData.questionPart.questions[0].question);
    } else if (currentPart === "question2" && testData) {
      speakQuestion(testData.questionPart.questions[1].question);
    }
  }, [currentPart, testData]);

  const startRecording = async () => {
    if (status === "recording" || status === "speaking" || status === "transcribing") return;
    setError(null); 
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setStatus("transcribing");
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        
        const audioUrl = URL.createObjectURL(audioBlob);

        try {
          const transcript = await transcribeAudio(audioBlob);
          if (currentPart === "passage") {
            setTranscripts((prev) => ({ ...prev, passage: transcript }));
            setRecordings((prev) => ({ ...prev, passage: audioUrl })); 
          } else if (currentPart === "picture") {
            setTranscripts((prev) => ({ ...prev, picture: transcript }));
            setRecordings((prev) => ({ ...prev, picture: audioUrl })); 
          } else if (currentPart === "question1") {
            setTranscripts((prev) => ({ ...prev, q1: transcript }));
            setRecordings((prev) => ({ ...prev, q1: audioUrl })); 
          } else if (currentPart === "question2") {
            setTranscripts((prev) => ({ ...prev, q2: transcript }));
            setRecordings((prev) => ({ ...prev, q2: audioUrl })); 
          }
          setStatus("idle");
        } catch (err: any) {
          setError("Lỗi gỡ băng: " + err.message + ". Vui lòng thử ghi âm lại.");
          setStatus("error"); 
           if (currentPart === "passage") setRecordings((prev) => ({ ...prev, passage: audioUrl }));
           else if (currentPart === "picture") setRecordings((prev) => ({ ...prev, picture: audioUrl }));
           else if (currentPart === "question1") setRecordings((prev) => ({ ...prev, q1: audioUrl }));
           else if (currentPart === "question2") setRecordings((prev) => ({ ...prev, q2: audioUrl }));
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setStatus("recording");
    } catch (err) {
      setError("Không thể truy cập micro. Vui lòng cấp quyền.");
      setStatus("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // --- LOGIC LUỒNG THI (FLOW) ---

  const nextPart = () => {
    if (status !== "idle") return; 
    
    if (currentPart === "passage") setCurrentPart("picture");
    else if (currentPart === "picture") setCurrentPart("question1");
    else if (currentPart === "question1") setCurrentPart("question2");
    else if (currentPart === "question2") handleSubmitForGrading();
  };

  const handleSubmitForGrading = async () => {
    if (!testData) return;
    setCurrentPart("grading");
    setStatus("idle"); 
    setError(null);

    const payload: GradingPayload = {
      passageTranscript: transcripts.passage,
      passageOriginal: testData.passagePart.passage,
      pictureQuestion: testData.picturePart.questions[0].question,
      pictureAnswerTranscript: transcripts.picture,
      pictureAnswerSample: testData.picturePart.questions[0].answer,
      q1Question: testData.questionPart.questions[0].question,
      q1AnswerTranscript: transcripts.q1,
      q1AnswerSample: testData.questionPart.questions[0].answer,
      q2Question: testData.questionPart.questions[1].question,
      q2AnswerTranscript: transcripts.q2,
      q2AnswerSample: testData.questionPart.questions[1].answer,
    };

    try {
      const result = await gradeSpeakingTest(payload);
      setFeedback(result);
      // ** THAY ĐỔI: Chuyển đến màn hình xem lại TẤT CẢ **
      setCurrentPart("REVIEW_ALL"); 
    } catch (err: any) {
      setError("Lỗi chấm điểm: " + err.message);
      setCurrentPart("grading"); 
      setStatus("error"); 
    }
  };

  // --- CÁC COMPONENT ĐỂ RENDER ---

  const renderStartScreen = () => (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Thi mô phỏng Speaking</h1>
      <p className="mb-8 text-lg text-gray-600">
        Bài thi bao gồm 3 phần: Đọc đoạn văn, Trả lời câu hỏi tranh, và Trả lời
        câu hỏi tự do.
      </p>
       {error && currentPart === "idle" && (
         <div className="text-center text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{error}</div>
      )}
      <button
        onClick={() => startTest(1)} 
        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
      >
        Bắt đầu thi
      </button>
    </div>
  );

  const renderLoadingTest = () => (
    <div className="flex flex-col items-center justify-center">
      <LoaderIcon />
      <p className="text-lg mt-4 text-gray-700">Đang tải đề thi...</p>
    </div>
  );

  const renderGradingScreen = () => (
    <div className="flex flex-col items-center justify-center">
      {status === 'error' ? (
         <>
          <div className="text-6xl mb-4">
            <AlertTriangleIcon />
          </div>
          <p className="text-lg mt-4 text-gray-700">
            Chấm bài thất bại
          </p>
          {error && (
            <div className="text-center text-red-600 my-4 p-3 bg-red-50 rounded-lg">{error}</div>
          )}
          <button
            onClick={() => setCurrentPart("question2")} // Nút quay lại
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Quay lại Phần 3
          </button>
        </>
      ) : (
        <>
          <LoaderIcon />
          <p className="text-lg mt-4 text-gray-700">
            Đang chấm bài... Vui lòng đợi trong giây lát.
          </p>
        </>
      )}
    </div>
  );

  // (Các hàm renderPassagePart, renderPicturePart, renderQuestionPart giữ nguyên)
  const renderPassagePart = () => (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Phần 1: Đọc đoạn văn</h2>
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        <h3 className="text-xl font-semibold mb-3">
          {testData?.passagePart.topic}
        </h3>
        <p
          className="text-2xl leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
        >
          {testData?.passagePart.passage}
        </p>
      </div>
    </div>
  );
  const renderPicturePart = () => (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Phần 2: Trả lời câu hỏi tranh</h2>
      <p className="text-lg text-gray-600 mb-4">
        Nghe câu hỏi và trả lời. (Câu hỏi sẽ tự động phát)
      </p>
      <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
        <img
          src={testData?.picturePart.imgUrl}
          alt={testData?.picturePart.topic}
          className="max-w-full md:max-w-lg rounded-lg shadow-md"
        />
      </div>
    </div>
  );
  const renderQuestionPart = (part: "question1" | "question2") => (
    <div className="w-full text-center">
      <h2 className="text-2xl font-bold mb-4">
        {part === "question1"
          ? "Phần 3: Câu hỏi 1"
          : "Phần 3: Câu hỏi 2"}
      </h2>
      <p className="text-xl text-gray-700 mb-6">
        Hãy lắng nghe câu hỏi và trả lời. (Câu hỏi sẽ tự động phát)
      </p>
      <div className="text-8xl text-gray-300">
        <MicIcon />
      </div>
      <p className="text-lg text-gray-500 mt-4">
        Chuẩn bị trả lời...
      </p>
    </div>
  );

  
  /**
   * COMPONENT MỚI: Card xem lại chi tiết
   */
  const ReviewCard = ({ title, icon, audioUrl, transcript, feedbackText }: {
      title: string;
      icon: React.ReactNode;
      audioUrl: string;
      transcript: string;
      feedbackText: string | undefined;
  }) => (
      <div className="p-4 bg-white rounded-lg shadow border mb-4">
          <h4 className="text-xl font-bold text-blue-700 mb-3 flex items-center">
              {icon} <span className="ml-2">{title}</span>
          </h4>
          
          {/* 1. Audio */}
          <h5 className="text-md font-semibold text-gray-700 mb-2">Ghi âm của bạn:</h5>
          <audio controls src={audioUrl} className="w-full mb-3">
              Trình duyệt không hỗ trợ phát audio.
          </audio>
          
          {/* 2. Transcript */}
          <h5 className="text-md font-semibold text-gray-700 mb-2">Nội dung gỡ băng (STT):</h5>
          <p className="text-gray-600 italic p-3 bg-gray-50 rounded mb-3 whitespace-pre-wrap">
              {transcript || "(Không gỡ băng được nội dung)"}
          </p>
          
          {/* 3. Feedback */}
          <h5 className="text-md font-semibold text-blue-800 mb-2">Nhận xét của AI:</h5>
          <p className="text-gray-800 whitespace-pre-wrap">
              {feedbackText || "Không có nhận xét."}
          </p>
      </div>
  );

  /**
   * COMPONENT MỚI: Màn hình xem lại TOÀN BỘ
   */
  const renderAllReviews = () => (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-600 flex items-center justify-center">
        <CheckCircleIcon className="mr-3" />
        Hoàn thành bài thi!
      </h2>
      
      {/* 1. Nhận xét tổng kết */}
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 mb-6">
          <h4 className="text-2xl font-bold text-blue-800 mb-3 flex items-center">
            <AwardIcon className="mr-2" />
            Nhận xét tổng kết
          </h4>
          <p className="text-gray-800 font-medium text-lg whitespace-pre-wrap">
              {feedback?.overall || "Không có nhận xét tổng kết."}
          </p>
      </div>

      {/* 2. Các card chi tiết */}
      <ReviewCard
          title="Phần 1: Đọc đoạn văn"
          icon={<BookOpenIcon />}
          audioUrl={recordings.passage}
          transcript={transcripts.passage}
          feedbackText={feedback?.passage}
      />
      <ReviewCard
          title="Phần 2: Trả lời tranh"
          icon={<ImageIcon />}
          audioUrl={recordings.picture}
          transcript={transcripts.picture}
          feedbackText={feedback?.picture}
      />
      <ReviewCard
          title="Phần 3: Câu hỏi 1"
          icon={<HelpCircleIcon />}
          audioUrl={recordings.q1}
          transcript={transcripts.q1}
          feedbackText={feedback?.question1}
      />
      <ReviewCard
          title="Phần 3: Câu hỏi 2"
          icon={<HelpCircleIcon />}
          audioUrl={recordings.q2}
          transcript={transcripts.q2}
          feedbackText={feedback?.question2}
      />

       <div className="text-center mt-8">
        <button
          onClick={() => setCurrentPart("idle")}
          className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        >
          Thi lại
        </button>
      </div>
    </div>
  );

  // --- RENDER CHÍNH ---

  const renderMainContent = () => {
    switch (currentPart) {
      // Luồng thi
      case "idle":
        return renderStartScreen();
      case "loadingTest":
        return renderLoadingTest();
      case "passage":
        return renderPassagePart();
      case "picture":
        return renderPicturePart();
      case "question1":
        return renderQuestionPart("question1");
      case "question2":
        return renderQuestionPart("question2");
      case "grading":
        return renderGradingScreen();
      
      // Luồng xem lại (MỚI)
      case "REVIEW_ALL":
          return renderAllReviews();

      default:
        return <div>Lỗi không xác định</div>;
    }
  };

  const renderTranscript = () => {
    let text = "";
    if (currentPart === "passage") text = transcripts.passage;
    else if (currentPart === "picture") text = transcripts.picture;
    else if (currentPart === "question1") text = transcripts.q1;
    else if (currentPart === "question2") text = transcripts.q2;

    if (status === "transcribing") {
      return (
        <div className="flex items-center text-blue-600">
          <LoaderIcon />
          <span className="ml-2">Đang gỡ băng...</span>
        </div>
      );
    }
    if (text) {
      return <p className="text-gray-700 italic">"{text}"</p>;
    }
    return null;
  };

  // Vô hiệu hóa nút tiếp theo nếu chưa có transcript (hoặc đang lỗi)
  const isNextDisabled = () => {
    if (status === 'recording' || status === 'transcribing' || status === 'speaking') return true;
    if (status === 'error') return true; 

    if (currentPart === 'passage' && !transcripts.passage) return true;
    if (currentPart === 'picture' && !transcripts.picture) return true;
    if (currentPart === 'question1' && !transcripts.q1) return true;
    if (currentPart === 'question2' && !transcripts.q2) return true;
    
    return false;
  }

  // Logic vô hiệu hóa nút (Disabled when busy)
  const isBusy = status === 'recording' || status === 'transcribing' || status === 'speaking';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-6 md:p-10 min-h-[600px] flex flex-col justify-between">
        {/* Phần nội dung chính */}
        <div className="flex-grow flex items-center justify-center">
          {renderMainContent()}
        </div>

        {/* Thanh điều khiển (Chỉ hiện khi đang thi) */}
        {["passage", "picture", "question1", "question2"].includes(
          currentPart
        ) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            {/* Hiển thị transcript */}
            <div className="h-12 flex items-center justify-center">
              {renderTranscript()}
            </div>

            {/* Hiển thị lỗi */}
            {error && !isBusy && (
              <div className="text-center text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{error}</div>
            )}

            {/* Các nút điều khiển */}
            <div className="flex items-center justify-center space-x-6">
              {/* Nút Phát lại câu hỏi */}
              {(currentPart === "picture" ||
                currentPart === "question1" ||
                currentPart === "question2") && (
                <button
                  onClick={() => {
                    if (!isBusy && testData) { 
                      if (currentPart === "picture")
                        speakQuestion(testData.picturePart.questions[0].question);
                      else if (currentPart === "question1")
                        speakQuestion(testData.questionPart.questions[0].question);
                      else if (currentPart === "question2")
                        speakQuestion(testData.questionPart.questions[1].question);
                    }
                  }}
                  disabled={isBusy} 
                  className="p-4 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                  title="Phát lại câu hỏi"
                >
                  <PlayIcon />
                </button>
              )}

              {/* Nút Ghi âm / Dừng */}
              {status === "recording" ? (
                <button
                  onClick={stopRecording}
                  className="p-5 rounded-full bg-red-600 text-white shadow-lg animate-pulse"
                  title="Dừng ghi âm"
                >
                  <StopCircleIcon />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isBusy} 
                  className="p-5 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 disabled:bg-gray-400"
                  title="Bắt đầu ghi âm"
                >
                  <MicIcon />
                </button>
              )}

              {/* Nút Tiếp theo */}
              <button
                onClick={nextPart}
                disabled={isNextDisabled()} 
                className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Phần tiếp theo"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}