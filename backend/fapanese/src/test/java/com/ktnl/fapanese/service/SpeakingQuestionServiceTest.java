package com.ktnl.fapanese.service;
import com.ktnl.fapanese.dto.request.SpeakingQuestionRequest;
import com.ktnl.fapanese.dto.response.SpeakingQuestionResponse;
import com.ktnl.fapanese.entity.Speaking;
import com.ktnl.fapanese.entity.SpeakingQuestion;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.SpeakingQuestionMapper;
import com.ktnl.fapanese.repository.SpeakingQuestionRepository;
import com.ktnl.fapanese.repository.SpeakingRepository;
import com.ktnl.fapanese.service.implementations.SpeakingQuestionService;
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

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SpeakingQuestionServiceTest {

    @Mock
    SpeakingQuestionRepository speakingQuestionRepository;
    @Mock
    SpeakingRepository speakingRepository;
    @Mock
    SpeakingQuestionMapper speakingQuestionMapper;

    @InjectMocks
    SpeakingQuestionService speakingQuestionService;

    private Speaking dummyParent;
    private SpeakingQuestion dummyQuestion;
    private SpeakingQuestionRequest dummyRequest;
    private SpeakingQuestionResponse dummyResponse;

    @BeforeEach
    void setUp() {
        dummyParent = new Speaking();
        dummyParent.setId(10L);

        dummyQuestion = new SpeakingQuestion();
        dummyQuestion.setId(1L);
        dummyQuestion.setQuestion("Test Question");
        dummyQuestion.setSpeaking(dummyParent);

        dummyRequest = new SpeakingQuestionRequest();
        dummyRequest.setSpeakingId(10L);
        dummyRequest.setQuestion("Test Request");

        dummyResponse = new SpeakingQuestionResponse();
        dummyResponse.setId(1L);
        dummyResponse.setQuestion("Test Response");
    }

    // ============================================================
    // 1. createQuestion
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingquestion/create_question.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: createQuestion")
    void createQuestion_Scenarios(
            String testName,
            Long speakingId,
            boolean parentFound,
            boolean expectException,
            String expectedError
    ) {
        SpeakingQuestionRequest request = new SpeakingQuestionRequest();
        request.setSpeakingId(speakingId);

        if (parentFound) {
            when(speakingRepository.findById(speakingId)).thenReturn(Optional.of(dummyParent));
        } else {
            when(speakingRepository.findById(speakingId)).thenReturn(Optional.empty());
        }

        when(speakingQuestionMapper.toSpeakingQuestion(request)).thenReturn(dummyQuestion);
        when(speakingQuestionRepository.save(dummyQuestion)).thenReturn(dummyQuestion);
        when(speakingQuestionMapper.toSpeakingQuestionResponse(dummyQuestion)).thenReturn(dummyResponse);

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingQuestionService.createQuestion(request));
            assertEquals(code, ex.getErrorCode());
            verify(speakingQuestionRepository, never()).save(any());
        } else {
            SpeakingQuestionResponse result = speakingQuestionService.createQuestion(request);
            assertNotNull(result);
            assertEquals(dummyResponse.getId(), result.getId());
            verify(speakingQuestionRepository, times(1)).save(dummyQuestion);
        }
    }

    // ============================================================
    // 2. getQuestionById
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingquestion/get_question_by_id.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getQuestionById")
    void getQuestionById_Scenarios(
            String testName,
            Long questionId,
            boolean questionFound,
            boolean expectException,
            String expectedError
    ) {
        if (questionFound) {
            when(speakingQuestionRepository.findById(questionId)).thenReturn(Optional.of(dummyQuestion));
            when(speakingQuestionMapper.toSpeakingQuestionResponse(dummyQuestion)).thenReturn(dummyResponse);
        } else {
            when(speakingQuestionRepository.findById(questionId)).thenReturn(Optional.empty());
        }

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingQuestionService.getQuestionById(questionId));
            assertEquals(code, ex.getErrorCode());
        } else {
            SpeakingQuestionResponse result = speakingQuestionService.getQuestionById(questionId);
            assertNotNull(result);
            assertEquals(dummyResponse.getId(), result.getId());
        }
    }

    // ============================================================
    // 3. getAllQuestions
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingquestion/get_all_questions.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getAllQuestions")
    void getAllQuestions_Scenarios(String testName, int repoSize) {
        List<SpeakingQuestion> list = IntStream.range(0, repoSize)
                .mapToObj(i -> dummyQuestion)
                .collect(Collectors.toList());

        when(speakingQuestionRepository.findAll()).thenReturn(list);
        when(speakingQuestionMapper.toSpeakingQuestionResponse(any(SpeakingQuestion.class)))
                .thenReturn(dummyResponse);

        List<SpeakingQuestionResponse> result = speakingQuestionService.getAllQuestions();

        assertNotNull(result);
        assertEquals(repoSize, result.size());
        verify(speakingQuestionMapper, times(repoSize)).toSpeakingQuestionResponse(any());
    }

    // ============================================================
    // 4. getQuestionsBySpeakingId
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingquestion/get_questions_by_speaking_id.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getQuestionsBySpeakingId")
    void getQuestionsBySpeakingId_Scenarios(
            String testName,
            Long speakingId,
            boolean parentExists,
            int repoSize,
            boolean expectException,
            String expectedError
    ) {
        when(speakingRepository.existsById(speakingId)).thenReturn(parentExists);

        if (parentExists) {
            List<SpeakingQuestion> list = IntStream.range(0, repoSize)
                    .mapToObj(i -> dummyQuestion)
                    .collect(Collectors.toList());
            when(speakingQuestionRepository.findBySpeakingId(speakingId)).thenReturn(list);
            when(speakingQuestionMapper.toSpeakingQuestionResponse(any(SpeakingQuestion.class)))
                    .thenReturn(dummyResponse);
        }

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingQuestionService.getQuestionsBySpeakingId(speakingId));
            assertEquals(code, ex.getErrorCode());
        } else {
            List<SpeakingQuestionResponse> result = speakingQuestionService.getQuestionsBySpeakingId(speakingId);
            assertNotNull(result);
            assertEquals(repoSize, result.size());
            verify(speakingQuestionMapper, times(repoSize)).toSpeakingQuestionResponse(any());
        }
    }

    // ============================================================
    // 5. updateQuestion
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingquestion/update_question.csv",
            numLinesToSkip = 1,
            nullValues = {"null"} // Dùng để test requestParentId là null
    )
    @DisplayName("Data-driven: updateQuestion")
    void updateQuestion_Scenarios(
            String testName,
            Long questionId,
            boolean questionFound,
            Long requestParentId,
            boolean newParentFound,
            boolean expectException,
            String expectedError
    ) {
        // Setup: Câu hỏi gốc có ID 1L và parent ID 10L
        SpeakingQuestion existingQuestion = new SpeakingQuestion();
        existingQuestion.setId(questionId);
        existingQuestion.setSpeaking(dummyParent); // Parent gốc là 10L

        SpeakingQuestionRequest request = new SpeakingQuestionRequest();
        request.setSpeakingId(requestParentId);

        if (questionFound) {
            when(speakingQuestionRepository.findById(questionId)).thenReturn(Optional.of(existingQuestion));
        } else {
            when(speakingQuestionRepository.findById(questionId)).thenReturn(Optional.empty());
        }

        // Kiểm tra logic if: (requestParentId != null && !requestParentId.equals(10L))
        boolean parentIdChanged = (requestParentId != null && !requestParentId.equals(dummyParent.getId()));

        if (parentIdChanged) {
            if (newParentFound) {
                Speaking newParent = new Speaking();
                newParent.setId(requestParentId);
                when(speakingRepository.findById(requestParentId)).thenReturn(Optional.of(newParent));
            } else {
                when(speakingRepository.findById(requestParentId)).thenReturn(Optional.empty());
            }
        }

        when(speakingQuestionRepository.save(any(SpeakingQuestion.class))).thenReturn(existingQuestion);
        when(speakingQuestionMapper.toSpeakingQuestionResponse(existingQuestion)).thenReturn(dummyResponse);

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingQuestionService.updateQuestion(questionId, request));
            assertEquals(code, ex.getErrorCode());
        } else {
            SpeakingQuestionResponse result = speakingQuestionService.updateQuestion(questionId, request);
            assertNotNull(result);
            verify(speakingQuestionRepository, times(1)).save(existingQuestion);
            // Verify mapper được gọi
            verify(speakingQuestionMapper, times(1)).updateSpeakingQuestion(existingQuestion, request);
        }
    }

    // ============================================================
    // 6. deleteQuestion
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingquestion/delete_question.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: deleteQuestion")
    void deleteQuestion_Scenarios(
            String testName,
            Long questionId,
            boolean questionExists,
            boolean expectException,
            String expectedError
    ) {
        when(speakingQuestionRepository.existsById(questionId)).thenReturn(questionExists);

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingQuestionService.deleteQuestion(questionId));
            assertEquals(code, ex.getErrorCode());
            verify(speakingQuestionRepository, never()).deleteById(anyLong());
        } else {
            speakingQuestionService.deleteQuestion(questionId);
            verify(speakingQuestionRepository, times(1)).deleteById(questionId);
        }
    }
}
