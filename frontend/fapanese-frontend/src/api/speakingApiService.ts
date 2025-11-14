// Cấu hình URL gốc của API (thay đổi nếu cần)
const API_BASE_URL = "http://localhost:8080/fapanese/api";

// ---- 1. HÀM TIỆN ÍCH XÁC THỰC ----

/**
 * Lấy token từ localStorage.
 * !!! QUAN TRỌNG: Thay đổi "user_token" thành key của bạn nếu khác.
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
 * (Không set Content-Type, browser sẽ tự làm)
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
    // Xử lý lỗi xác thực, ví dụ: redirect về trang login
    // window.location.href = '/login'; 
    throw new Error("Xác thực thất bại. Vui lòng đăng nhập lại.");
  }
  // Thử đọc lỗi JSON từ body
  try {
    const errorData = await response.json();
    throw new Error(errorData.message || "Đã xảy ra lỗi không xác định.");
  } catch (e) {
    // Nếu body không có JSON, ném lỗi theo status
    throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
  }
};

// ---- 2. CÁC KIỂU DỮ LIỆU (TYPES) ----

// (Giữ nguyên các interface của bạn)
export interface SpeakingQuestion {
  id: number;
  question: string;
  questionRomaji: string;
  questionMeaning: string;
  answer: string;
  answerRomaji: string;
  answerMeaning: string;
}

export interface PassagePart {
  id: number;
  topic: string;
  passage: string;
}

export interface PicturePart {
  id: number;
  topic: string;
  imgUrl: string;
  questions: SpeakingQuestion[];
}

export interface QuestionPart {
  id: number;
  topic: string;
  questions: SpeakingQuestion[];
}

export interface GeneratedTestResponse {
  passagePart: PassagePart;
  picturePart: PicturePart;
  questionPart: QuestionPart;
}

export interface GradingPayload {
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

export interface GradingFeedback {
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

// ---- 3. CÁC HÀM GỌI API (Đã cập nhật xác thực) ----

/**
 * 1. Lấy đề thi ngẫu nhiên
 * GET /api/speaking-exams/generate-test/{overviewPartId}
 */
export async function generateTest(
  overviewPartId: number
): Promise<GeneratedTestResponse> {
  const response = await fetch(
    `${API_BASE_URL}/speaking-exams/generate-test/${overviewPartId}`,
    {
      method: "GET",
      headers: getAuthHeaders(), // <-- Đã thêm xác thực
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

/**
 * 2. Gửi audio lên để gỡ băng (Speech-to-Text)
 * POST /api/interview/stt
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.wav");

  const response = await fetch(`${API_BASE_URL}/interview/stt`, {
    method: "POST",
    headers: getAuthHeadersForFormData(), // <-- Đã thêm xác thực
    body: formData,
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  const data = await response.json();
  return data.text || "";
}

/**
 * 3. Gửi bài làm lên để chấm điểm (API MỚI)
 * POST /api/speaking-exams/grade-speaking-test
 */
export async function gradeSpeakingTest(
  payload: GradingPayload
): Promise<GradingFeedback> {
  const response = await fetch(
    `${API_BASE_URL}/interview/grade-speaking-test`,
    {
      method: "POST",
      headers: getAuthHeaders(), // <-- Đã thêm xác thực
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    await handleResponseError(response);
  }

  const data: ApiResponse<GradingFeedback> = await response.json();
  if (data.code !== 1000) {
    throw new Error(data.message || "Lỗi khi chấm điểm");
  }
  return data.result;
}

/**
 * 4. Lấy âm thanh (Text-to-Speech) - Dùng cho các câu hỏi
 * POST /api/interview/tts
 */
export async function textToSpeech(text: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/interview/tts/1`, {
    method: "POST",
    headers: getAuthHeaders(), // <-- Đã thêm xác thực
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  return response.blob();
}