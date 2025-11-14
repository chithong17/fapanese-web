package com.ktnl.fapanese.service;


import com.ktnl.fapanese.dto.request.MiddleExamRequest;
import com.ktnl.fapanese.dto.response.MiddleExamResponse;
import com.ktnl.fapanese.entity.MiddleExam;
import com.ktnl.fapanese.entity.OverviewPart;
import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.MiddleExamMapper;
import com.ktnl.fapanese.repository.MiddleExamRepository;
import com.ktnl.fapanese.repository.OverviewPartRepository;
import com.ktnl.fapanese.repository.QuestionRepository;
import com.ktnl.fapanese.service.implementations.MiddleExamService;
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

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MiddleExamServiceTest {

    @Mock
    private MiddleExamRepository middleExamRepository;
    @Mock
    private OverviewPartRepository overviewPartRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private MiddleExamMapper middleExamMapper;

    @InjectMocks
    private MiddleExamService middleExamService;

    // --- Dữ liệu mẫu ---
    private MiddleExamRequest mockRequest;
    private MiddleExam mockExam;
    private MiddleExamResponse mockResponse;
    private OverviewPart mockOverviewPart;
    private OverviewPart mockNewOverviewPart;
    private Set<Question> mockQuestionSet;
    private Set<Long> mockQuestionIds;

    @BeforeEach
    void setUp() {
        mockOverviewPart = new OverviewPart();
        mockOverviewPart.setId(10L);

        mockNewOverviewPart = new OverviewPart(); // Dùng cho test update
        mockNewOverviewPart.setId(20L);

        mockQuestionIds = Set.of(100L, 101L);
        mockQuestionSet = new HashSet<>();
        mockQuestionSet.add(Question.builder().id(100L).build());

        // Giả định MiddleExamRequest DTO
        // (Bạn có thể cần sửa lại 'new' nếu constructor khác)
        mockRequest = new MiddleExamRequest();
        mockRequest.setOverviewPartId(10L);
        mockRequest.setQuestionIds(mockQuestionIds);

        mockExam = new MiddleExam();
        mockExam.setId(1L);
        mockExam.setOverviewPart(mockOverviewPart);
        mockExam.setQuestions(mockQuestionSet);

        // Giả định MiddleExamResponse DTO
        mockResponse = new MiddleExamResponse();
        mockResponse.setId(1L);
    }

    // --- 1. getAllMiddleExams ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/middleexam/get_all_middle_exams_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getAllMiddleExams")
    void getAllMiddleExams_Scenarios(String testName, int repoReturnsSize) {
        // Arrange
        List<MiddleExam> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockExam)
                .collect(Collectors.toList());
        List<MiddleExamResponse> mockResponseList = Collections.nCopies(repoReturnsSize, mockResponse);

        when(middleExamRepository.findAll()).thenReturn(mockList);
        when(middleExamMapper.toMiddleExamResponseList(mockList)).thenReturn(mockResponseList);

        // Act
        List<MiddleExamResponse> result = middleExamService.getAllMiddleExams();

        // Assert
        assertNotNull(result);
        assertEquals(repoReturnsSize, result.size());
        verify(middleExamRepository, times(1)).findAll();
    }

    // --- 2. getMiddleExamById ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/middleexam/get_middle_exam_by_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getMiddleExamById")
    void getMiddleExamById_Scenarios(String testName, Long examId, boolean mockExamFound,
                                     boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockExamFound) {
            when(middleExamRepository.findById(examId)).thenReturn(Optional.of(mockExam));
            when(middleExamMapper.toMiddleExamResponse(mockExam)).thenReturn(mockResponse);
        } else {
            when(middleExamRepository.findById(examId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> middleExamService.getMiddleExamById(examId));
            assertEquals(code, e.getErrorCode());
        } else {
            MiddleExamResponse result = middleExamService.getMiddleExamById(examId);
            assertNotNull(result);
            assertEquals(mockResponse.getId(), result.getId());
        }
        verify(middleExamRepository, times(1)).findById(examId);
    }

    // --- 3. createMiddleExam ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/middleexam/create_middle_exam_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản createMiddleExam")
    void createMiddleExam_Scenarios(String testName, Long overviewPartId, boolean mockPartFound,
                                    String questionIdsType, boolean expectException, String expectedErrorCodeString) {
        // Arrange
        mockRequest.setOverviewPartId(overviewPartId);

        // Mock 3 kịch bản của questionIds
        if ("NULL".equals(questionIdsType)) {
            mockRequest.setQuestionIds(null);
        } else if ("EMPTY".equals(questionIdsType)) {
            mockRequest.setQuestionIds(Collections.emptySet());
        } else {
            mockRequest.setQuestionIds(mockQuestionIds); // VALID
        }

        if (mockPartFound) {
            when(overviewPartRepository.findById(overviewPartId)).thenReturn(Optional.of(mockOverviewPart));
        } else {
            when(overviewPartRepository.findById(overviewPartId)).thenReturn(Optional.empty());
        }

        MiddleExam examToSave = new MiddleExam();
        when(middleExamMapper.toMiddleExam(mockRequest)).thenReturn(examToSave);
        when(questionRepository.findAllById(mockQuestionIds)).thenReturn(List.copyOf(mockQuestionSet));
        when(middleExamRepository.save(examToSave)).thenReturn(mockExam);
        when(middleExamMapper.toMiddleExamResponse(mockExam)).thenReturn(mockResponse);

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> middleExamService.createMiddleExam(mockRequest));
            assertEquals(code, e.getErrorCode());
            verify(middleExamRepository, never()).save(any());
        } else {
            MiddleExamResponse result = middleExamService.createMiddleExam(mockRequest);
            assertNotNull(result);

            // Kiểm tra quan hệ đã được set
            assertEquals(mockOverviewPart, examToSave.getOverviewPart());
            if ("VALID".equals(questionIdsType)) {
                verify(questionRepository, times(1)).findAllById(mockQuestionIds);
                assertNotNull(examToSave.getQuestions());
            } else {
                verify(questionRepository, never()).findAllById(any());
                assertTrue(examToSave.getQuestions().isEmpty()); // Quan trọng: service không set new HashSet()
            }
            verify(middleExamRepository, times(1)).save(examToSave);
        }
    }

    // --- 4. updateMiddleExam ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/middleexam/update_middle_exam_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản updateMiddleExam")
    void updateMiddleExam_Scenarios(String testName, Long examId, boolean mockExamFound,
                                    Long currentPartId, Long newPartId, boolean mockNewPartFound,
                                    String questionIdsType, boolean expectException, String expectedErrorCodeString) {
        // Arrange
        mockOverviewPart.setId(currentPartId); // Set ID part cũ
        mockRequest.setOverviewPartId(newPartId);

        if ("NULL".equals(questionIdsType)) {
            mockRequest.setQuestionIds(null);
        } else {
            mockRequest.setQuestionIds(mockQuestionIds); // VALID
        }

        if (mockExamFound) {
            when(middleExamRepository.findById(examId)).thenReturn(Optional.of(mockExam));
        } else {
            when(middleExamRepository.findById(examId)).thenReturn(Optional.empty());
        }

        boolean changingPart = !currentPartId.equals(newPartId);

        if (changingPart) {
            if (mockNewPartFound) {
                when(overviewPartRepository.findById(newPartId)).thenReturn(Optional.of(mockNewOverviewPart));
            } else {
                when(overviewPartRepository.findById(newPartId)).thenReturn(Optional.empty());
            }
        }

        if (!expectException) {
            when(questionRepository.findAllById(mockQuestionIds)).thenReturn(List.copyOf(mockQuestionSet));
            when(middleExamRepository.save(mockExam)).thenReturn(mockExam);
            when(middleExamMapper.toMiddleExamResponse(mockExam)).thenReturn(mockResponse);
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> middleExamService.updateMiddleExam(examId, mockRequest));
            assertEquals(code, e.getErrorCode());
            verify(middleExamRepository, never()).save(any());
        } else {
            MiddleExamResponse result = middleExamService.updateMiddleExam(examId, mockRequest);
            assertNotNull(result);

            verify(middleExamMapper, times(1)).updateMiddleExam(mockExam, mockRequest);

            if (changingPart) {
                verify(overviewPartRepository, times(1)).findById(newPartId);
                assertEquals(mockNewOverviewPart, mockExam.getOverviewPart()); // Đã gán part mới
            } else {
                verify(overviewPartRepository, never()).findById(anyLong());
            }

            if ("VALID".equals(questionIdsType)) {
                verify(questionRepository, times(1)).findAllById(mockQuestionIds);
                assertNotNull(mockExam.getQuestions());
            } else {
                verify(questionRepository, never()).findAllById(any());
            }

            verify(middleExamRepository, times(1)).save(mockExam);
        }
    }

    // --- 5. deleteMiddleExam ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/middleexam/delete_middle_exam_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản deleteMiddleExam")
    void deleteMiddleExam_Scenarios(String testName, Long examId, boolean mockExamFound,
                                    boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockExamFound) {
            when(middleExamRepository.findById(examId)).thenReturn(Optional.of(mockExam));
        } else {
            when(middleExamRepository.findById(examId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> middleExamService.deleteMiddleExam(examId));
            assertEquals(code, e.getErrorCode());
            verify(middleExamRepository, never()).delete(any());
        } else {
            middleExamService.deleteMiddleExam(examId);
            verify(middleExamRepository, times(1)).delete(mockExam);
        }
    }

    // --- 6. getAllMiddleExamsByOverviewPartId ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/middleexam/get_all_by_part_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getAllMiddleExamsByOverviewPartId")
    void getAllMiddleExamsByOverviewPartId_Scenarios(String testName, Long partId, boolean mockPartExists,
                                                     int repoReturnsSize, boolean expectException, String expectedErrorCodeString) {
        // Arrange
        when(overviewPartRepository.existsById(partId)).thenReturn(mockPartExists);

        List<MiddleExam> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockExam)
                .collect(Collectors.toList());
        List<MiddleExamResponse> mockResponseList = Collections.nCopies(repoReturnsSize, mockResponse);

        when(middleExamRepository.findByOverviewPartId(partId)).thenReturn(mockList);
        when(middleExamMapper.toMiddleExamResponseList(mockList)).thenReturn(mockResponseList);

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> middleExamService.getAllMiddleExamsByOverviewPartId(partId));
            assertEquals(code, e.getErrorCode());
            verify(middleExamRepository, never()).findByOverviewPartId(anyLong());
        } else {
            List<MiddleExamResponse> result = middleExamService.getAllMiddleExamsByOverviewPartId(partId);
            assertNotNull(result);
            assertEquals(repoReturnsSize, result.size());
            verify(middleExamRepository, times(1)).findByOverviewPartId(partId);
        }
    }
}
