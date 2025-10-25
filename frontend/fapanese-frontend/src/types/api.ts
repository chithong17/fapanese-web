// Định nghĩa cấu trúc chung cho mọi phản hồi API từ Backend
export interface ApiResponse<T> {
  code: number; // Mã trạng thái tùy chỉnh (ví dụ: 1000 cho thành công)
  message: string; // Thông báo từ Backend
  result: T; // Dữ liệu thực tế (payload)
}

// === Định nghĩa kiểu dữ liệu cho Vocabulary ===
export interface VocabularyResponse {
  id: number;
  lessonPartId: number; // Liên kết với LessonPart
  wordKana: string;
  wordKanji?: string; // Optional vì có thể null
  romaji?: string;   // Optional
  meaning: string;
  wordType?: string; // Optional
}

// === Định nghĩa kiểu dữ liệu cho Course ===
export interface CourseResponse {
  id: number;
  courseName: string;
  description: string;
  imgUrl: string; // Tên từ Backend là imgUrl
  price: string;
  level: string;
  code: string;
  title: string;
  duration: string;
  // Không bao gồm 'lessons' hay 'overviews' ở đây trừ khi API trả về
}

// === Định nghĩa kiểu dữ liệu cho Grammar (bao gồm Detail) ===
export interface GrammarDetailResponse {
  id: number;
  structure: string;
  meaning: string;
  exampleSentence?: string; // Đổi tên khớp Entity (nếu cần)
  exampleMeaning?: string; // Đổi tên khớp Entity (nếu cần)
}

export interface GrammarResponse {
  id: number;
  lessonPartId: number; // Liên kết với LessonPart
  title: string;
  explanation: string;
  details: GrammarDetailResponse[]; // Danh sách chi tiết lồng nhau
}

// === Định nghĩa kiểu dữ liệu cho Question ===
// (Dùng cho API CRUD Question, trả về cho Admin/Lecturer)
export interface QuestionResponse {
  id: number;
  content: string;
  category: string; // Hoặc Enum nếu bạn dùng Enum ở Frontend
  questionType: string; // Hoặc Enum
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string; // Chỉ hiển thị cho Admin/Lecturer
  fillAnswer?: string;    // Chỉ hiển thị cho Admin/Lecturer
  // Không có lessonId hay courseId theo cấu trúc mới nhất
}

// === Định nghĩa kiểu dữ liệu cho API Chấm điểm ===
// Dữ liệu gửi lên từ Frontend
export interface UserAnswer {
  questionId: number;
  userAnswer: string;
}

// Chi tiết kết quả cho từng câu hỏi
export interface QuestionCheckResponse {
  questionId: number;
  questionType: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer?: string; // Đáp án đúng
}

// Kết quả tổng hợp trả về từ API /submit
export interface SubmitQuizResponse {
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  detailedResults: QuestionCheckResponse[]; // Danh sách chi tiết
}

// === Định nghĩa kiểu dữ liệu cho Authentication ===
export interface AuthenticationResponse {
  token: string;
  isAuthenticated: boolean;
  // Thêm các trường khác nếu API login trả về (ví dụ: user info)
}

// Bạn có thể thêm các interface khác ở đây khi xây dựng thêm API
// Ví dụ: LessonResponse, LessonPartResponse, UserResponse, etc.