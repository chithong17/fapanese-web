package com.ktnl.fapanese.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.request.UserAnswer;
import com.ktnl.fapanese.dto.response.QuestionResponse;
import com.ktnl.fapanese.dto.response.SubmitQuizResponse;
import com.ktnl.fapanese.entity.LessonPart;
import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.entity.enums.QuestionCategory;
import com.ktnl.fapanese.entity.enums.QuestionType;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.QuestionMapper;
import com.ktnl.fapanese.repository.LessonPartRepository;
import com.ktnl.fapanese.repository.LessonRepository;
import com.ktnl.fapanese.repository.QuestionRepository;
import com.ktnl.fapanese.service.implementations.QuestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import com.fasterxml.jackson.core.type.TypeReference;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class QuestionServiceTest {

    @Mock
    QuestionRepository questionRepository;

    @Mock
    LessonRepository lessonRepository;

    @Mock
    LessonPartRepository lessonPartRepository;

    @Mock
    QuestionMapper questionMapper;

    @InjectMocks
    QuestionService questionService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    Question question;
    QuestionResponse response;
    LessonPart lessonPart;

    @BeforeEach
    void setup() {
        lessonPart = new LessonPart();
        lessonPart.setId(10L);

        question = new Question();
        question.setId(1L);
        question.setCorrectAnswer("A");
        question.setFillAnswer("Tokyo");
        question.setQuestionType(QuestionType.MULTIPLE_CHOICE);
        question.setLessonPart(lessonPart);

        response = new QuestionResponse();
        response.setId(1L);
    }

    // ============================================================
    // CREATE
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/question/create_question_scenarios.csv",
            numLinesToSkip = 1,
            nullValues = {""}
    )
    @DisplayName("Data-driven: createQuestion")
    void createQuestion_Scenarios(
            String testName,
            boolean lessonPartExists,
            Long lessonPartId,
            boolean isNullLessonPartId,
            boolean expectException,
            String expectedErrorCodeString
    ) {
        QuestionRequest request = new QuestionRequest();
        if (!isNullLessonPartId) {
            request.setLessonPartId(lessonPartId);
        }

        if (!isNullLessonPartId && lessonPartExists) {
            when(lessonPartRepository.findById(lessonPartId))
                    .thenReturn(Optional.of(lessonPart));
        } else if (!isNullLessonPartId) {
            when(lessonPartRepository.findById(lessonPartId))
                    .thenReturn(Optional.empty());
        }

        when(questionMapper.toQuestion(request)).thenReturn(question);
        when(questionRepository.save(question)).thenReturn(question);
        when(questionMapper.toQuestionResponse(question)).thenReturn(response);

        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException ex = assertThrows(AppException.class,
                    () -> questionService.createQuestion(request));
            assertEquals(expectedErrorCode, ex.getErrorCode());
            verify(questionRepository, never()).save(any());
        } else {
            QuestionResponse result = questionService.createQuestion(request);
            assertNotNull(result);
            assertEquals(response.getId(), result.getId());
            verify(questionRepository, times(1)).save(question);
        }
    }

    // ============================================================
    // GET ALL
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/question/get_all_questions_scenarios.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getAllQuestions")
    void getAllQuestions_Scenarios(String testName, int repoSize) {
        List<Question> list = IntStream.range(0, repoSize)
                .mapToObj(i -> question)
                .collect(Collectors.toList());

        when(questionRepository.findAll()).thenReturn(list);
        when(questionMapper.toQuestionResponse(any(Question.class)))
                .thenReturn(response);

        List<QuestionResponse> result = questionService.getAllQuestions();

        assertNotNull(result);
        assertEquals(repoSize, result.size());
        verify(questionMapper, times(repoSize))
                .toQuestionResponse(any(Question.class));
    }

    // ============================================================
    // GET BY ID
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/question/get_question_by_id_scenarios.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getQuestionById")
    void getQuestionById_Scenarios(
            String testName,
            Long id,
            boolean found,
            boolean expectException,
            String expectedErrorCodeString
    ) {
        if (found) {
            when(questionRepository.findById(id))
                    .thenReturn(Optional.of(question));
            when(questionMapper.toQuestionResponse(question))
                    .thenReturn(response);
        } else {
            when(questionRepository.findById(id))
                    .thenReturn(Optional.empty());
        }

        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException ex = assertThrows(AppException.class,
                    () -> questionService.getQuestionById(id));
            assertEquals(expectedErrorCode, ex.getErrorCode());
        } else {
            QuestionResponse result = questionService.getQuestionById(id);
            assertNotNull(result);
            assertEquals(response.getId(), result.getId());
        }
    }

    // ============================================================
    // UPDATE
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/question/update_question_scenarios.csv",
            numLinesToSkip = 1,
            nullValues = {""}
    )
    @DisplayName("Data-driven: updateQuestion")
    void updateQuestion_Scenarios(
            String testName,
            Long id,
            boolean lessonPartExists,
            Long lessonPartId,
            boolean questionFound,
            boolean expectException,
            String expectedErrorCodeString
    ) {
        QuestionRequest request = new QuestionRequest();
        request.setLessonPartId(lessonPartId);

        if (questionFound) {
            when(questionRepository.findById(id))
                    .thenReturn(Optional.of(question));
        } else {
            when(questionRepository.findById(id))
                    .thenReturn(Optional.empty());
        }

        if (lessonPartId != null) {
            if (lessonPartExists) {
                when(lessonPartRepository.findById(lessonPartId))
                        .thenReturn(Optional.of(lessonPart));
            } else {
                when(lessonPartRepository.findById(lessonPartId))
                        .thenReturn(Optional.empty());
            }
        }

        when(questionRepository.save(question)).thenReturn(question);
        when(questionMapper.toQuestionResponse(question)).thenReturn(response);

        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException ex = assertThrows(AppException.class,
                    () -> questionService.updateQuestion(id, request));
            assertEquals(expectedErrorCode, ex.getErrorCode());
        } else {
            QuestionResponse result = questionService.updateQuestion(id, request);
            assertNotNull(result);
            assertEquals(response.getId(), result.getId());
            verify(questionRepository, times(1)).save(question);
        }
    }

    // ============================================================
    // DELETE
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/question/delete_question_scenarios.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: deleteQuestion")
    void deleteQuestion_Scenarios(
            String testName,
            Long id,
            boolean exists,
            boolean expectException,
            String expectedErrorCodeString
    ) {
        when(questionRepository.existsById(id)).thenReturn(exists);

        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException ex = assertThrows(AppException.class,
                    () -> questionService.deleteQuestion(id));
            assertEquals(expectedErrorCode, ex.getErrorCode());
            verify(questionRepository, never()).deleteById(anyLong());
        } else {
            questionService.deleteQuestion(id);
            verify(questionRepository, times(1)).deleteById(id);
        }
    }

    // ============================================================
    // GET BY TYPE
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/question/get_questions_by_type_scenarios.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getQuestionsByType")
    void getQuestionsByType_Scenarios(
            String testName,
            int listSize,
            boolean expectException,
            String expectedErrorCodeString
    ) {
        List<Question> list = IntStream.range(0, listSize)
                .mapToObj(i -> question)
                .collect(Collectors.toList());

        when(questionRepository.findByQuestionType(QuestionType.MULTIPLE_CHOICE))
                .thenReturn(list);
        when(questionMapper.toQuestionResponseList(list))
                .thenReturn(Collections.singletonList(response));

        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException ex = assertThrows(AppException.class,
                    () -> questionService.getQuestionsByType(QuestionType.MULTIPLE_CHOICE));
            assertEquals(expectedErrorCode, ex.getErrorCode());
        } else {
            var result = questionService.getQuestionsByType(QuestionType.MULTIPLE_CHOICE);
            assertNotNull(result);
        }
    }

    // ============================================================
    // GET BY CATEGORY
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/question/get_questions_by_category_scenarios.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getQuestionsByCategory")
    void getQuestionsByCategory_Scenarios(
            String testName,
            int listSize,
            boolean expectException,
            String expectedErrorCodeString
    ) {
        List<Question> list = IntStream.range(0, listSize)
                .mapToObj(i -> question)
                .collect(Collectors.toList());

        when(questionRepository.findByCategory(QuestionCategory.GRAMMAR))
                .thenReturn(list);
        when(questionMapper.toQuestionResponseList(list))
                .thenReturn(Collections.singletonList(response));

        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException ex = assertThrows(AppException.class,
                    () -> questionService.getQuestionsByCategory(QuestionCategory.GRAMMAR));
            assertEquals(expectedErrorCode, ex.getErrorCode());
        } else {
            var result = questionService.getQuestionsByCategory(QuestionCategory.GRAMMAR);
            assertNotNull(result);
        }
    }

    // ============================================================
    // GET BY LESSON PART
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/question/get_questions_by_lesson_part_scenarios.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getQuestionsByLessonPart")
    void getQuestionsByLessonPart_Scenarios(String testName, int listSize) {
        List<Question> list = IntStream.range(0, listSize)
                .mapToObj(i -> question)
                .collect(Collectors.toList());

        when(questionRepository.findByLessonPart_Id(10L))
                .thenReturn(list);
        when(questionMapper.toQuestionResponseList(list))
                .thenReturn(Collections.nCopies(listSize, response));

        var result = questionService.getQuestionsByLessonPart(10L);
        assertNotNull(result);
        assertEquals(listSize, result.size());
    }

    // ============================================================
    // CHECK AND SUBMIT ANSWERS (big boy)
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/question/check_and_submit_answers_scenarios.csv",
            numLinesToSkip = 1,
            nullValues = {""}
    )
    @DisplayName("Data-driven: checkAndSubmitAnswers")
    void checkAndSubmitAnswers_Scenarios(
            String testName,
            String userAnswersJson,
            String questionsJson,
            int expectedCorrect,
            int expectedTotal,
            boolean expectException,
            String expectedErrorCodeString
    ) throws Exception {

        List<UserAnswer> userAnswers = buildUserAnswersFromJson(userAnswersJson);
        List<Question> questionsInDb = buildQuestionsFromJson(questionsJson);

        // Map<QuestionId, Question> để findById
        Map<Long, Question> questionMap = questionsInDb.stream()
                .collect(Collectors.toMap(Question::getId, q -> q, (a, b) -> a));

        when(questionRepository.findById(anyLong()))
                .thenAnswer(invocation -> {
                    Long id = invocation.getArgument(0);
                    return Optional.ofNullable(questionMap.get(id));
                });

        when(questionRepository.countByLessonPartId(anyLong()))
                .thenAnswer(invocation -> {
                    Long lpId = invocation.getArgument(0);

                    long count = questionsInDb.stream()
                            .filter(q -> q.getLessonPart() != null
                                    && lpId.equals(q.getLessonPart().getId()))
                            .count();

                    return (int) count; // ⭐ Cast về Integer đúng signature repo
                });


        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException ex = assertThrows(AppException.class,
                    () -> questionService.checkAndSubmitAnswers(userAnswers));
            assertEquals(expectedErrorCode, ex.getErrorCode());
        } else {
            SubmitQuizResponse result =
                    questionService.checkAndSubmitAnswers(userAnswers);

            assertNotNull(result);
            assertEquals(expectedCorrect, result.getCorrectCount());
            assertEquals(expectedTotal, result.getTotalQuestions());
        }
    }

    // ============================================================
    // Helper methods for JSON parsing
    // ============================================================

    private List<UserAnswer> buildUserAnswersFromJson(String json) throws Exception {
        if (json == null || json.trim().isEmpty() || "[]".equals(json.trim())) {
            return new ArrayList<>();
        }
        String normalized = json.replace('\'', '"');
        List<Map<String, Object>> rawList = objectMapper.readValue(
                normalized,
                new TypeReference<List<Map<String, Object>>>() {}
        );

        List<UserAnswer> result = new ArrayList<>();
        for (Map<String, Object> map : rawList) {
            UserAnswer ua = new UserAnswer();
            Number idNum = (Number) map.get("id");
            ua.setQuestionId(idNum == null ? null : idNum.longValue());
            ua.setUserAnswer((String) map.get("ans"));
            result.add(ua);
        }
        return result;
    }

    private List<Question> buildQuestionsFromJson(String json) throws Exception {
        if (json == null || json.trim().isEmpty() || "[]".equals(json.trim())) {
            return new ArrayList<>();
        }
        String normalized = json.replace('\'', '"');
        List<Map<String, Object>> rawList = objectMapper.readValue(
                normalized,
                new TypeReference<List<Map<String, Object>>>() {}
        );

        List<Question> result = new ArrayList<>();
        for (Map<String, Object> map : rawList) {
            Question q = new Question();

            Number idNum = (Number) map.get("id");
            if (idNum != null) {
                q.setId(idNum.longValue());
            }

            String typeStr = (String) map.get("type");
            if (typeStr != null) {
                QuestionType qt = QuestionType.valueOf(typeStr);
                q.setQuestionType(qt);
            }

            String correct = (String) map.get("correct");
            if (correct != null) {
                if (q.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                    q.setCorrectAnswer(correct);
                } else if (q.getQuestionType() == QuestionType.FILL) {
                    q.setFillAnswer(correct);
                }
            }

            Number lpIdNum = (Number) map.get("lessonPartId");
            if (lpIdNum != null) {
                LessonPart lp = new LessonPart();
                lp.setId(lpIdNum.longValue());
                q.setLessonPart(lp);
            }

            result.add(q);
        }
        return result;
    }

    @Test
    @DisplayName("checkAndSubmitAnswers – null userAnswers → INVALID_INPUT")
    void checkAndSubmitAnswers_ShouldThrow_WhenUserAnswersNull() {
        AppException ex = assertThrows(
                AppException.class,
                () -> questionService.checkAndSubmitAnswers(null)
        );
        assertEquals(ErrorCode.INVALID_INPUT, ex.getErrorCode());
    }

    @Test
    @DisplayName("LessonPartNull fallback → count=0 but no exception")
    void checkAndSubmitAnswers_LessonPartNull_ShouldFallback() {

        // LessonPart always exists (không để null)
        LessonPart lp = new LessonPart();
        lp.setId(10L);

        Question q = new Question();
        q.setId(1L);
        q.setLessonPart(lp);
        q.setQuestionType(QuestionType.FILL);
        q.setFillAnswer("Tokyo");

        UserAnswer ua = new UserAnswer();
        ua.setQuestionId(1L);
        ua.setUserAnswer("Osaka");

        // Repo mocks
        when(questionRepository.findById(1L)).thenReturn(Optional.of(q));

        // fallback: giả lập repo trả 0 → để test nhánh else
        when(questionRepository.countByLessonPartId(10L)).thenReturn(0);

        SubmitQuizResponse result =
                questionService.checkAndSubmitAnswers(List.of(ua));

        assertNotNull(result);
        assertEquals(0, result.getCorrectCount());
        assertEquals(0, result.getTotalQuestions()); // fallback case
    }

    @Test
    @DisplayName("UnknownType → should treat as incorrect but not throw")
    void checkAndSubmitAnswers_UnknownType_ShouldBeIncorrect() {

        // Fake lesson part
        LessonPart lp = new LessonPart();
        lp.setId(10L);

        // Fake question
        Question q = new Question();
        q.setId(1L);
        q.setLessonPart(lp);
        q.setQuestionType(QuestionType.MULTIPLE_CHOICE); // không để null
        q.setCorrectAnswer("CORRECT_VALUE_THAT_NEVER_MATCH");

        // Fake user answer
        UserAnswer ua = new UserAnswer();
        ua.setQuestionId(1L);
        ua.setUserAnswer("something-else");

        // Repo behavior
        when(questionRepository.findById(1L)).thenReturn(Optional.of(q));
        when(questionRepository.countByLessonPartId(10L)).thenReturn(1);

        SubmitQuizResponse result =
                questionService.checkAndSubmitAnswers(List.of(ua));

        assertNotNull(result);
        assertEquals(0, result.getCorrectCount());
        assertEquals(1, result.getTotalQuestions());
    }


}
