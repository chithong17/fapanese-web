package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.VocabularyRequest;
import com.ktnl.fapanese.dto.response.VocabularyResponse;
import com.ktnl.fapanese.entity.LessonPart;
import com.ktnl.fapanese.entity.Vocabulary;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.VocabularyMapper;
import com.ktnl.fapanese.repository.LessonPartRepository;
import com.ktnl.fapanese.repository.VocabularyRepository;
import com.ktnl.fapanese.service.implementations.VocabularyService;
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
@MockitoSettings(strictness = Strictness.LENIENT) // Tắt cảnh báo UnnecessaryStubbingException
class VocabularyServiceTest {

    @Mock
    private VocabularyRepository vocabularyRepository;
    @Mock
    private LessonPartRepository lessonPartRepository;
    @Mock
    private VocabularyMapper vocabularyMapper;

    @InjectMocks
    private VocabularyService vocabularyService;

    // Dữ liệu giả (dummy data)
    private LessonPart dummyLessonPart;
    private Vocabulary dummyVocabulary;
    private VocabularyRequest dummyRequest;
    private VocabularyResponse dummyResponse;

    @BeforeEach
    void setUp() {
        dummyLessonPart = new LessonPart();
        dummyLessonPart.setId(10L);

        dummyVocabulary = new Vocabulary();
        dummyVocabulary.setId(1L);
        dummyVocabulary.setWordKana("こんにちは");
        dummyVocabulary.setLessonPart(dummyLessonPart);

        dummyRequest = new VocabularyRequest();
        dummyRequest.setLessonPartId(10L);
        dummyRequest.setWordKana("Test Word");

        dummyResponse = new VocabularyResponse();
        dummyResponse.setId(1L);
        dummyResponse.setWordKana("Test Response");

        // Mocks chung
        when(vocabularyRepository.save(any(Vocabulary.class))).thenAnswer(inv -> inv.getArgument(0));
        when(vocabularyMapper.toVocabularyResponse(any(Vocabulary.class))).thenReturn(dummyResponse);
        when(vocabularyMapper.toVocabulary(any(VocabularyRequest.class))).thenReturn(dummyVocabulary);
        when(vocabularyMapper.toVocabularyResponseList(anyList())).thenReturn(List.of(dummyResponse));
    }

    // ============================================================
    // 1. createVocabulary
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/vocabulary/create_vocabulary.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: createVocabulary")
    void createVocabulary_Scenarios(
            String testName,
            Long lessonPartId,
            boolean lessonPartFound,
            boolean expectException,
            String expectedError
    ) {
        // 1. --- ARRANGE ---
        VocabularyRequest request = new VocabularyRequest();
        request.setLessonPartId(lessonPartId);

        if (lessonPartFound) {
            when(lessonPartRepository.findById(lessonPartId)).thenReturn(Optional.of(dummyLessonPart));
        } else {
            when(lessonPartRepository.findById(lessonPartId)).thenReturn(Optional.empty());
        }

        // 2. --- ACT & ASSERT ---
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> vocabularyService.createVocabulary(request));
            assertEquals(code, ex.getErrorCode());
            verify(vocabularyRepository, never()).save(any());
        } else {
            VocabularyResponse result = vocabularyService.createVocabulary(request);
            assertNotNull(result);
            verify(vocabularyRepository, times(1)).save(any(Vocabulary.class));
        }
    }

    // ============================================================
    // 2. getAllVocabularies
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/vocabulary/get_all_vocabularies.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getAllVocabularies")
    void getAllVocabularies_Scenarios(String testName, int repoSize) {
        List<Vocabulary> list = IntStream.range(0, repoSize)
                .mapToObj(i -> dummyVocabulary)
                .collect(Collectors.toList());
        when(vocabularyRepository.findAll()).thenReturn(list);

        // Cần mock lại mapper cho đúng size
        List<VocabularyResponse> responseList = IntStream.range(0, repoSize)
                .mapToObj(i -> dummyResponse)
                .collect(Collectors.toList());
        when(vocabularyMapper.toVocabularyResponseList(list)).thenReturn(responseList);

        List<VocabularyResponse> result = vocabularyService.getAllVocabularies();

        assertNotNull(result);
        assertEquals(repoSize, result.size());
    }

    // ============================================================
    // 3. getVocabularyById
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/vocabulary/get_vocabulary_by_id.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getVocabularyById")
    void getVocabularyById_Scenarios(
            String testName,
            Long vocabId,
            boolean vocabFound,
            boolean expectException,
            String expectedError
    ) {
        if (vocabFound) {
            when(vocabularyRepository.findById(vocabId)).thenReturn(Optional.of(dummyVocabulary));
        } else {
            when(vocabularyRepository.findById(vocabId)).thenReturn(Optional.empty());
        }

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> vocabularyService.getVocabularyById(vocabId));
            assertEquals(code, ex.getErrorCode());
        } else {
            VocabularyResponse result = vocabularyService.getVocabularyById(vocabId);
            assertNotNull(result);
            assertEquals(dummyResponse.getId(), result.getId());
        }
    }

    // ============================================================
    // 4. updateVocabulary (Logic phức tạp)
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/vocabulary/update_vocabulary.csv",
            numLinesToSkip = 1,
            nullValues = {"null"} // Đọc chuỗi "null" thành giá trị null
    )
    @DisplayName("Data-driven: updateVocabulary")
    void updateVocabulary_Scenarios(
            String testName,
            Long vocabId,
            boolean vocabFound,
            Long requestLessonPartId,
            boolean originalLessonPartIsNull,
            boolean newLessonPartFound,
            boolean expectException,
            String expectedError
    ) {
        // 1. --- ARRANGE ---

        // Tạo 1 vocab gốc để test (ID 1L, Parent ID 10L)
        Vocabulary existingVocabulary = new Vocabulary();
        existingVocabulary.setId(vocabId);
        if (originalLessonPartIsNull) {
            existingVocabulary.setLessonPart(null);
        } else {
            existingVocabulary.setLessonPart(dummyLessonPart); // Gán parent gốc (ID 10L)
        }

        // Tạo request
        VocabularyRequest request = new VocabularyRequest();
        request.setLessonPartId(requestLessonPartId);

        // Mock tìm vocab
        if (vocabFound) {
            when(vocabularyRepository.findById(vocabId)).thenReturn(Optional.of(existingVocabulary));
        } else {
            when(vocabularyRepository.findById(vocabId)).thenReturn(Optional.empty());
        }

        // --- Logic kiểm tra xem có cần tìm LessonPart mới không ---
        boolean parentIdChanged = false;
        if (requestLessonPartId != null) {
            if (originalLessonPartIsNull) {
                parentIdChanged = true; // (null -> 20L)
            } else if (!requestLessonPartId.equals(existingVocabulary.getLessonPart().getId())) {
                parentIdChanged = true; // (10L -> 20L)
            }
        }
        // (Nếu requestLessonPartId == null -> false)
        // (Nếu requestLessonPartId == 10L -> false)

        if (parentIdChanged) {
            if (newLessonPartFound) {
                LessonPart newLessonPart = new LessonPart();
                newLessonPart.setId(requestLessonPartId);
                when(lessonPartRepository.findById(requestLessonPartId)).thenReturn(Optional.of(newLessonPart));
            } else {
                when(lessonPartRepository.findById(requestLessonPartId)).thenReturn(Optional.empty());
            }
        }

        // 2. --- ACT & ASSERT ---
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> vocabularyService.updateVocabulary(vocabId, request));
            assertEquals(code, ex.getErrorCode());
        } else {
            VocabularyResponse result = vocabularyService.updateVocabulary(vocabId, request);
            assertNotNull(result);
            verify(vocabularyRepository, times(1)).save(existingVocabulary);
            // Verify mapper được gọi
            verify(vocabularyMapper, times(1)).updateVocabulary(existingVocabulary, request);
        }
    }

    // ============================================================
    // 5. deleteVocabulary
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/vocabulary/delete_vocabulary.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: deleteVocabulary")
    void deleteVocabulary_Scenarios(
            String testName,
            Long vocabId,
            boolean vocabExists,
            boolean expectException,
            String expectedError
    ) {
        when(vocabularyRepository.existsById(vocabId)).thenReturn(vocabExists);

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> vocabularyService.deleteVocabulary(vocabId));
            assertEquals(code, ex.getErrorCode());
            verify(vocabularyRepository, never()).deleteById(anyLong());
        } else {
            vocabularyService.deleteVocabulary(vocabId);
            verify(vocabularyRepository, times(1)).deleteById(vocabId);
        }
    }

    // ============================================================
    // 6. getVocabulariesByLessonPartId
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/vocabulary/get_vocabularies_by_lesson_part_id.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getVocabulariesByLessonPartId")
    void getVocabulariesByLessonPartId_Scenarios(String testName, Long lessonPartId, int repoSize) {
        List<Vocabulary> list = IntStream.range(0, repoSize)
                .mapToObj(i -> dummyVocabulary)
                .collect(Collectors.toList());
        when(vocabularyRepository.findByLessonPart_Id(lessonPartId)).thenReturn(list);

        // Mock lại mapper cho đúng size
        List<VocabularyResponse> responseList = IntStream.range(0, repoSize)
                .mapToObj(i -> dummyResponse)
                .collect(Collectors.toList());
        when(vocabularyMapper.toVocabularyResponseList(list)).thenReturn(responseList);

        List<VocabularyResponse> result = vocabularyService.getVocabulariesByLessonPartId(lessonPartId);

        assertNotNull(result);
        assertEquals(repoSize, result.size());
    }
}