package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.UserAnswer;
import com.ktnl.fapanese.dto.response.QuestionCheckResponse;
import com.ktnl.fapanese.dto.response.SubmitQuizResponse;
import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.entity.enums.QuestionType;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.repository.FinalExamRepository;
import com.ktnl.fapanese.repository.MiddleExamRepository;
import com.ktnl.fapanese.repository.QuestionRepository;
import com.ktnl.fapanese.service.implementations.ExamService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT) // Cần thiết vì các kịch bản lỗi không dùng hết mock
class ExamServiceTest {

    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private FinalExamRepository finalExamQuestionRepository; // Mock dù không dùng
    @Mock
    private MiddleExamRepository middleExamQuestionRepository; // Mock dù không dùng

    @InjectMocks
    private ExamService examService;

    // --- Dữ liệu mock cho các câu hỏi ---
    private Question q1, q2, q3_case, q4_null;

    @BeforeEach
    void setUp() {
        // Giả lập các câu hỏi trong DB
        q1 = Question.builder()
                .id(1L)
                .correctAnswer("A")
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .build();

        q2 = Question.builder()
                .id(2L)
                .correctAnswer("B")
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .build();

        // Dùng cho test case-insensitive
        q3_case = Question.builder()
                .id(3L)
                .correctAnswer("CorrectAnswer") // Đáp án viết hoa
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .build();

        // Dùng cho test đáp án null
        q4_null = Question.builder()
                .id(4L)
                .correctAnswer(null) // Đáp án trong DB là null
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .build();
    }

    /**
     * Hàm helper để thiết lập mock repo và tạo danh sách câu trả lời của user
     * dựa trên kịch bản test từ file CSV.
     */
    private List<UserAnswer> setupMocksAndAnswers(String testName) {
        List<UserAnswer> userAnswers = new ArrayList<>();

        // 1. Mock các câu hỏi (mặc định là tìm thấy)
        when(questionRepository.findById(1L)).thenReturn(Optional.of(q1));
        when(questionRepository.findById(2L)).thenReturn(Optional.of(q2));
        when(questionRepository.findById(3L)).thenReturn(Optional.of(q3_case));
        when(questionRepository.findById(4L)).thenReturn(Optional.of(q4_null));

        // 2. Tạo danh sách câu trả lời của user dựa trên kịch bản
        switch (testName) {
            case "SUCCESS_ALL_CORRECT":
                userAnswers.add(new UserAnswer(1L, "A")); // Đúng
                userAnswers.add(new UserAnswer(2L, "B")); // Đúng
                break;

            case "SUCCESS_PARTIAL_CORRECT":
                userAnswers.add(new UserAnswer(1L, "A")); // Đúng
                userAnswers.add(new UserAnswer(2L, "WRONG")); // Sai
                break;

            case "SUCCESS_ALL_WRONG":
                userAnswers.add(new UserAnswer(1L, "WRONG_A")); // Sai
                userAnswers.add(new UserAnswer(2L, "WRONG_B")); // Sai
                break;

            case "SUCCESS_EMPTY_LIST":
                // userAnswers list rỗng
                break;

            case "SUCCESS_CASE_INSENSITIVE":
                userAnswers.add(new UserAnswer(3L, "correctanswer")); // User trả lời "thường"
                break;

            case "SUCCESS_CORRECT_ANSWER_IS_NULL":
                userAnswers.add(new UserAnswer(4L, "any_answer")); // User trả lời, nhưng đáp án là null
                break;

            case "FAIL_QUESTION_NOT_FOUND":
                userAnswers.add(new UserAnswer(1L, "A")); // Câu này OK
                userAnswers.add(new UserAnswer(99L, "???")); // Câu này sẽ lỗi

                // Ghi đè mock cho câu 99L
                when(questionRepository.findById(99L)).thenReturn(Optional.empty());
                break;
        }
        return userAnswers;
    }


    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/exam/check_exam_scenarios.csv", numLinesToSkip = 1, nullValues = {""})
    @DisplayName("Data-driven: Kịch bản checkAndSubmitExamAnswers")
    void checkAndSubmitExamAnswers_Scenarios(String testName, int expectedTotal, int expectedCorrect,
                                             double expectedScore, boolean expectException, String expectedErrorCodeString) {

        // Arrange
        // Gọi hàm helper để lấy danh sách UserAnswer và thiết lập mocks
        List<UserAnswer> userAnswers = setupMocksAndAnswers(testName);

        // Act & Assert
        if (expectException) {
            // Test kịch bản ném lỗi (FAIL_QUESTION_NOT_FOUND)
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);

            AppException e = assertThrows(AppException.class, () ->
                    examService.checkAndSubmitExamAnswers(userAnswers)
            );

            assertEquals(expectedErrorCode, e.getErrorCode());

        } else {
            // Test các kịch bản thành công
            SubmitQuizResponse response = examService.checkAndSubmitExamAnswers(userAnswers);

            // 1. Kiểm tra kết quả tổng quan
            assertNotNull(response);
            assertEquals(expectedTotal, response.getTotalQuestions());
            // (SỬA) Thay đổi getter
            assertEquals(expectedCorrect, response.getCorrectCount());
            // (SỬA) Thay đổi getter
            assertEquals(expectedScore, response.getScorePercentage());

            // 2. Kiểm tra chi tiết (details)
            // (SỬA) Thay đổi getter
            assertEquals(expectedTotal, response.getDetailedResults().size());

            // 3. Kiểm tra chi tiết cho các kịch bản cụ thể (Tùy chọn)
            if (testName.equals("SUCCESS_PARTIAL_CORRECT")) {
                // (SỬA) Thay đổi getter
                QuestionCheckResponse detail1 = response.getDetailedResults().get(0); // Câu 1 (Đúng)
                QuestionCheckResponse detail2 = response.getDetailedResults().get(1); // Câu 2 (Sai)

                assertTrue(detail1.isCorrect());
                assertEquals("A", detail1.getUserAnswer());
                assertEquals("A", detail1.getCorrectAnswer());

                assertFalse(detail2.isCorrect());
                assertEquals("WRONG", detail2.getUserAnswer());
                assertEquals("B", detail2.getCorrectAnswer());
            }

            if (testName.equals("SUCCESS_CASE_INSENSITIVE")) {
                // (SỬA) Thay đổi getter
                QuestionCheckResponse detail = response.getDetailedResults().get(0);
                assertTrue(detail.isCorrect()); // Phải là true
                assertEquals("correctanswer", detail.getUserAnswer());
                assertEquals("CorrectAnswer", detail.getCorrectAnswer());
            }
        }
    }
}