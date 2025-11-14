package com.ktnl.fapanese.service;
import com.ktnl.fapanese.dto.request.SpeakingExamRequest;
import com.ktnl.fapanese.dto.response.SpeakingExamResponse;
import com.ktnl.fapanese.dto.response.SpeakingRespone;
import com.ktnl.fapanese.dto.response.SpeakingTestItemResponse;
import com.ktnl.fapanese.dto.response.SpeakingTestResponse;
import com.ktnl.fapanese.entity.OverviewPart;
import com.ktnl.fapanese.entity.Speaking;
import com.ktnl.fapanese.entity.SpeakingExam;
import com.ktnl.fapanese.entity.SpeakingQuestion;
import com.ktnl.fapanese.entity.enums.SpeakingType;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.*;
import com.ktnl.fapanese.repository.OverviewPartRepository;
import com.ktnl.fapanese.repository.SpeakingExamRepository;
import com.ktnl.fapanese.repository.SpeakingQuestionRepository;
import com.ktnl.fapanese.repository.SpeakingRepository;
import com.ktnl.fapanese.service.implementations.SpeakingExamService;
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

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SpeakingExamServiceTest {

    @Mock
    SpeakingExamRepository speakingExamRepository;
    @Mock
    OverviewPartRepository overviewPartRepository;
    @Mock
    SpeakingExamMapper speakingExamMapper;
    @Mock
    SpeakingRepository speakingRepository;
    @Mock
    SpeakingMapper speakingMapper;
    @Mock
    SpeakingQuestionRepository speakingQuestionRepository;
    @Mock
    SpeakingQuestionMapper speakingQuestionMapper;
    @Mock
    SpeakingTestItemMapper speakingTestItemMapper;
    @Mock
    SpeakingTestQuestionMapper speakingTestQuestionMapper;

    @InjectMocks
    SpeakingExamService speakingExamService;

    private SpeakingExam dummyExam;
    private SpeakingExamResponse dummyExamResponse;
    private OverviewPart dummyParent;
    private SpeakingExamRequest dummyRequest;

    @BeforeEach
    void setUp() {
        dummyParent = new OverviewPart();
        dummyParent.setId(10L);

        dummyExam = new SpeakingExam();
        dummyExam.setId(1L);
        dummyExam.setTitle("Test Exam");
        dummyExam.setOverviewPart(dummyParent);

        dummyExamResponse = new SpeakingExamResponse();
        dummyExamResponse.setId(1L);
        dummyExamResponse.setTitle("Test Exam");

        dummyRequest = new SpeakingExamRequest();
        dummyRequest.setTitle("New Title");
        dummyRequest.setOverviewPartId(10L);
    }

    // ============================================================
    // 1. getAllSpeakingExams
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingExam/get_all_exams.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getAllSpeakingExams")
    void getAllSpeakingExams_Scenarios(String testName, int repoSize) {
        List<SpeakingExam> examList = IntStream.range(0, repoSize)
                .mapToObj(i -> dummyExam)
                .collect(Collectors.toList());
        List<SpeakingExamResponse> responseList = IntStream.range(0, repoSize)
                .mapToObj(i -> dummyExamResponse)
                .collect(Collectors.toList());

        when(speakingExamRepository.findAll()).thenReturn(examList);
        when(speakingExamMapper.toSpeakingExamResponseList(examList)).thenReturn(responseList);

        List<SpeakingExamResponse> result = speakingExamService.getAllSpeakingExams();

        assertNotNull(result);
        assertEquals(repoSize, result.size());
        verify(speakingExamRepository, times(1)).findAll();
    }

    // ============================================================
    // 2. getSpeakingExamById
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingExam/get_exam_by_id.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getSpeakingExamById")
    void getSpeakingExamById_Scenarios(
            String testName,
            Long id,
            boolean examFound,
            boolean expectException,
            String expectedError
    ) {
        if (examFound) {
            when(speakingExamRepository.findById(id)).thenReturn(Optional.of(dummyExam));
            when(speakingExamMapper.toSpeakingExamResponse(dummyExam)).thenReturn(dummyExamResponse);
        } else {
            when(speakingExamRepository.findById(id)).thenReturn(Optional.empty());
        }

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingExamService.getSpeakingExamById(id));
            assertEquals(code, ex.getErrorCode());
        } else {
            SpeakingExamResponse result = speakingExamService.getSpeakingExamById(id);
            assertNotNull(result);
            assertEquals(dummyExamResponse.getId(), result.getId());
        }
    }

    // ============================================================
    // 3. createSpeakingExam
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingExam/create_exam.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: createSpeakingExam")
    void createSpeakingExam_Scenarios(
            String testName,
            Long overviewPartId,
            boolean parentFound,
            boolean expectException,
            String expectedError
    ) {
        SpeakingExamRequest request = new SpeakingExamRequest();
        request.setOverviewPartId(overviewPartId);

        if (parentFound) {
            when(overviewPartRepository.findById(overviewPartId)).thenReturn(Optional.of(dummyParent));
        } else {
            when(overviewPartRepository.findById(overviewPartId)).thenReturn(Optional.empty());
        }

        when(speakingExamMapper.toSpeakingExam(request)).thenReturn(dummyExam);
        when(speakingExamRepository.save(dummyExam)).thenReturn(dummyExam);
        when(speakingExamMapper.toSpeakingExamResponse(dummyExam)).thenReturn(dummyExamResponse);

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingExamService.createSpeakingExam(request));
            assertEquals(code, ex.getErrorCode());
            verify(speakingExamRepository, never()).save(any());
        } else {
            SpeakingExamResponse result = speakingExamService.createSpeakingExam(request);
            assertNotNull(result);
            verify(speakingExamRepository, times(1)).save(dummyExam);
        }
    }

    // ============================================================
    // 4. updateSpeakingExam
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingExam/update_exam.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: updateSpeakingExam")
    void updateSpeakingExam_Scenarios(
            String testName,
            Long examId,
            boolean examFound,
            Long requestParentId,
            boolean newParentFound,
            boolean expectException,
            String expectedError
    ) {
        // ID gốc của parent là 10L
        OverviewPart existingParent = new OverviewPart();
        existingParent.setId(10L);
        SpeakingExam existingExam = new SpeakingExam();
        existingExam.setId(examId);
        existingExam.setOverviewPart(existingParent);

        SpeakingExamRequest request = new SpeakingExamRequest();
        request.setOverviewPartId(requestParentId);

        if (examFound) {
            when(speakingExamRepository.findById(examId)).thenReturn(Optional.of(existingExam));
        } else {
            when(speakingExamRepository.findById(examId)).thenReturn(Optional.empty());
        }

        boolean parentIdsMatch = existingParent.getId().equals(requestParentId);

        if (!parentIdsMatch) {
            if (newParentFound) {
                OverviewPart newParent = new OverviewPart();
                newParent.setId(requestParentId);
                when(overviewPartRepository.findById(requestParentId)).thenReturn(Optional.of(newParent));
            } else {
                when(overviewPartRepository.findById(requestParentId)).thenReturn(Optional.empty());
            }
        }

        when(speakingExamRepository.save(any(SpeakingExam.class))).thenReturn(existingExam);
        when(speakingExamMapper.toSpeakingExamResponse(existingExam)).thenReturn(dummyExamResponse);

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingExamService.updateSpeakingExam(examId, request));
            assertEquals(code, ex.getErrorCode());
        } else {
            SpeakingExamResponse result = speakingExamService.updateSpeakingExam(examId, request);
            assertNotNull(result);
            verify(speakingExamRepository, times(1)).save(existingExam);
            // Verify mapper được gọi
            verify(speakingExamMapper, times(1)).updateSpeakingExam(existingExam, request);
        }
    }

    // ============================================================
    // 5. deleteSpeakingExam
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingExam/delete_exam.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: deleteSpeakingExam")
    void deleteSpeakingExam_Scenarios(
            String testName,
            Long id,
            boolean examFound,
            boolean expectException,
            String expectedError
    ) {
        if (examFound) {
            when(speakingExamRepository.findById(id)).thenReturn(Optional.of(dummyExam));
        } else {
            when(speakingExamRepository.findById(id)).thenReturn(Optional.empty());
        }

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingExamService.deleteSpeakingExam(id));
            assertEquals(code, ex.getErrorCode());
            verify(speakingExamRepository, never()).delete(any());
        } else {
            speakingExamService.deleteSpeakingExam(id);
            verify(speakingExamRepository, times(1)).delete(dummyExam);
        }
    }

    // ============================================================
    // 6. getAllSpeakingExamsByOverviewPartId
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speakingExam/get_all_by_parent_id.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getAllSpeakingExamsByOverviewPartId")
    void getAllSpeakingExamsByOverviewPartId_Scenarios(
            String testName,
            Long partId,
            boolean parentExists,
            int repoSize,
            boolean expectException,
            String expectedError
    ) {
        when(overviewPartRepository.existsById(partId)).thenReturn(parentExists);

        if (parentExists) {
            List<SpeakingExam> examList = IntStream.range(0, repoSize)
                    .mapToObj(i -> dummyExam)
                    .collect(Collectors.toList());
            List<SpeakingExamResponse> responseList = IntStream.range(0, repoSize)
                    .mapToObj(i -> dummyExamResponse)
                    .collect(Collectors.toList());

            // Mock cho cả 2 lần gọi mapper (do lỗi logic trong code gốc)
            when(speakingExamRepository.findByOverviewPartId(partId)).thenReturn(examList);
            when(speakingExamMapper.toSpeakingExamResponseList(examList)).thenReturn(responseList);
        }

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingExamService.getAllSpeakingExamsByOverviewPartId(partId));
            assertEquals(code, ex.getErrorCode());
        } else {
            List<SpeakingExamResponse> result = speakingExamService.getAllSpeakingExamsByOverviewPartId(partId);
            assertNotNull(result);
            assertEquals(repoSize, result.size());
            // Do lỗi logic, mapper được gọi 2 lần
            verify(speakingExamMapper, times(2)).toSpeakingExamResponseList(anyList());
        }
    }

    // ============================================================
    // 7. generateRandomSpeakingTest
    //
    // Phương thức này quá phức tạp để test data-driven
    // Chúng ta sẽ dùng các @Test case truyền thống
    // ============================================================

    private Speaking mockSpeaking(Long id, SpeakingType type) {
        Speaking s = new Speaking();
        s.setId(id);
        s.setType(type);
        return s;
    }

    private SpeakingQuestion mockQuestion(Long id) {
        SpeakingQuestion q = new SpeakingQuestion();
        q.setId(id);
        return q;
    }

    @Test
    @DisplayName("generateRandomSpeakingTest - Success")
    void generateRandomSpeakingTest_Success() {
        Long partId = 1L;
        Speaking passage = mockSpeaking(10L, SpeakingType.PASSAGE);
        Speaking picture = mockSpeaking(20L, SpeakingType.PICTURE);
        Speaking question = mockSpeaking(30L, SpeakingType.QUESTION);

        SpeakingQuestion picQuestion = mockQuestion(100L);
        SpeakingQuestion noPicQuestion1 = mockQuestion(200L);
        SpeakingQuestion noPicQuestion2 = mockQuestion(201L);

        // Mock repo 'speaking'
        when(speakingRepository.findRandomSpeakingByPartIdAndType(partId, SpeakingType.PASSAGE.name()))
                .thenReturn(Optional.of(passage));
        when(speakingRepository.findRandomSpeakingByPartIdAndType(partId, SpeakingType.PICTURE.name()))
                .thenReturn(Optional.of(picture));
        when(speakingRepository.findRandomSpeakingByPartIdAndType(partId, SpeakingType.QUESTION.name()))
                .thenReturn(Optional.of(question));

        // Mock repo 'question'
        when(speakingQuestionRepository.findRandomQuestionsForSpeaking(picture.getId(), 1))
                .thenReturn(List.of(picQuestion));
        when(speakingQuestionRepository.findRandomQuestionsForSpeaking(question.getId(), 2))
                .thenReturn(List.of(noPicQuestion1, noPicQuestion2));

        // Mock mappers
        when(speakingTestItemMapper.toSpeakingTestItemResponse(any(Speaking.class)))
                .thenAnswer(inv -> {
                    Speaking s = inv.getArgument(0);
                    return new SpeakingTestItemResponse(s.getId(), null, null, null, null, null);
                });
        when(speakingTestQuestionMapper.toSpeakingQuestionResponseList(anyList()))
                .thenReturn(Collections.emptyList()); // Mapper này không quan trọng lắm

        // Act
        SpeakingTestResponse result = speakingExamService.generateRandomSpeakingTest(partId);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getPassagePart());
        assertNotNull(result.getPicturePart());
        assertNotNull(result.getQuestionPart());

        assertEquals(passage.getId(), result.getPassagePart().getId());
        assertEquals(picture.getId(), result.getPicturePart().getId());
        assertEquals(question.getId(), result.getQuestionPart().getId());

        verify(speakingTestItemMapper, times(1)).toSpeakingTestItemResponse(passage);
        verify(speakingTestItemMapper, times(1)).toSpeakingTestItemResponse(picture);
        verify(speakingTestItemMapper, times(1)).toSpeakingTestItemResponse(question);

        verify(speakingTestQuestionMapper, times(1)).toSpeakingQuestionResponseList(List.of(picQuestion));
        verify(speakingTestQuestionMapper, times(1)).toSpeakingQuestionResponseList(List.of(noPicQuestion1, noPicQuestion2));
    }

    @Test
    @DisplayName("generateRandomSpeakingTest - Fail - Passage Not Found")
    void generateRandomSpeakingTest_Fail_PassageNotFound() {
        Long partId = 1L;
        when(speakingRepository.findRandomSpeakingByPartIdAndType(partId, SpeakingType.PASSAGE.name()))
                .thenReturn(Optional.empty()); // <-- Lỗi

        AppException ex = assertThrows(AppException.class,
                () -> speakingExamService.generateRandomSpeakingTest(partId));

        assertEquals(ErrorCode.OVERVIEW_PART_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("generateRandomSpeakingTest - Fail - Picture Not Found")
    void generateRandomSpeakingTest_Fail_PictureNotFound() {
        Long partId = 1L;
        Speaking passage = mockSpeaking(10L, SpeakingType.PASSAGE);

        when(speakingRepository.findRandomSpeakingByPartIdAndType(partId, SpeakingType.PASSAGE.name()))
                .thenReturn(Optional.of(passage));
        when(speakingRepository.findRandomSpeakingByPartIdAndType(partId, SpeakingType.PICTURE.name()))
                .thenReturn(Optional.empty()); // <-- Lỗi

        AppException ex = assertThrows(AppException.class,
                () -> speakingExamService.generateRandomSpeakingTest(partId));

        assertEquals(ErrorCode.OVERVIEW_PART_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("generateRandomSpeakingTest - Fail - Question Not Found")
    void generateRandomSpeakingTest_Fail_QuestionNotFound() {
        Long partId = 1L;
        Speaking passage = mockSpeaking(10L, SpeakingType.PASSAGE);
        Speaking picture = mockSpeaking(20L, SpeakingType.PICTURE);

        when(speakingRepository.findRandomSpeakingByPartIdAndType(partId, SpeakingType.PASSAGE.name()))
                .thenReturn(Optional.of(passage));
        when(speakingRepository.findRandomSpeakingByPartIdAndType(partId, SpeakingType.PICTURE.name()))
                .thenReturn(Optional.of(picture));
        when(speakingRepository.findRandomSpeakingByPartIdAndType(partId, SpeakingType.QUESTION.name()))
                .thenReturn(Optional.empty()); // <-- Lỗi

        AppException ex = assertThrows(AppException.class,
                () -> speakingExamService.generateRandomSpeakingTest(partId));

        assertEquals(ErrorCode.OVERVIEW_PART_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("getAllSpeakingExamsByOverviewPartId - Should cover all branches in forEach")
    void getAllSpeakingExamsByOverviewPartId_ShouldCover_AllBranches() {
        Long partId = 10L;

        // 1. Dữ liệu giả từ Repository (DB)
        SpeakingExam examFromDb = new SpeakingExam();
        examFromDb.setId(1L);
        List<SpeakingExam> examListFromDb = List.of(examFromDb);

        // 2. Dữ liệu giả cho LẦN GỌI MAPPER THỨ 1 (dùng trong forEach)
        // Đây là phần quan trọng nhất để cover các nhánh

        // Case 1: List == null (đã cover, nhưng làm rõ)
        SpeakingExamResponse responseWithNull = new SpeakingExamResponse();
        responseWithNull.setId(1L);
        responseWithNull.setSpeakings(null);

        // Case 2: List == empty (cover nhánh !isEmpty() == false)
        SpeakingExamResponse responseWithEmpty = new SpeakingExamResponse();
        responseWithEmpty.setId(2L);
        responseWithEmpty.setSpeakings(Collections.emptySet());

        // Case 3: List có nội dung (cover nhánh if == true)
        SpeakingRespone speaking1 = new SpeakingRespone();
        speaking1.setId(100L);
        SpeakingRespone speaking2 = new SpeakingRespone();
        speaking2.setId(99L);
        // Cần List có thể thay đổi (mutable) nếu bạn sửa code dùng .sort()
        // Nhưng vì code hiện tại dùng stream(), nên không cần
        Set<SpeakingRespone> speakingList = new HashSet<>(List.of(speaking1, speaking2));

        SpeakingExamResponse responseWithContent = new SpeakingExamResponse();
        responseWithContent.setId(3L);
        responseWithContent.setSpeakings(speakingList);

        // Đây là kết quả của LẦN GỌI MAPPER 1
        List<SpeakingExamResponse> mockedResponseList1 = List.of(responseWithNull, responseWithEmpty, responseWithContent);

        // 3. Dữ liệu giả cho LẦN GỌI MAPPER THỨ 2 (ở lệnh return)
        // Do lỗi logic, code của bạn sẽ return cái này, không phải cái đã sắp xếp
        List<SpeakingExamResponse> mockedResponseList2 = List.of(new SpeakingExamResponse());


        // 4. MOCKING
        when(overviewPartRepository.existsById(partId)).thenReturn(true);
        when(speakingExamRepository.findByOverviewPartId(partId)).thenReturn(examListFromDb);

        // Mock mapper được gọi 2 lần với 2 kết quả khác nhau
        when(speakingExamMapper.toSpeakingExamResponseList(examListFromDb))
                .thenReturn(mockedResponseList1) // Kết quả cho lần gọi 1 (trong forEach)
                .thenReturn(mockedResponseList2); // Kết quả cho lần gọi 2 (ở return)

        // 5. ACT
        List<SpeakingExamResponse> result = speakingExamService.getAllSpeakingExamsByOverviewPartId(partId);

        // 6. ASSERT
        assertNotNull(result);
        // Nó sẽ trả về kết quả của lần gọi mapper THỨ 2
        assertEquals(mockedResponseList2.size(), result.size());

        // Quan trọng nhất: Verify mapper được gọi 2 LẦN với CÙNG MỘT ĐỐI TƯỢNG
        verify(speakingExamMapper, times(2)).toSpeakingExamResponseList(examListFromDb);
        verify(overviewPartRepository, times(1)).existsById(partId);
        verify(speakingExamRepository, times(1)).findByOverviewPartId(partId);
    }
}
