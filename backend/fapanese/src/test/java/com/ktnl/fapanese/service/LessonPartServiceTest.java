package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.response.LessonPartSimpleResponse;
import com.ktnl.fapanese.entity.LessonPart;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.LessonPartMapper;
import com.ktnl.fapanese.repository.LessonPartRepository;
import com.ktnl.fapanese.repository.LessonRepository;
import com.ktnl.fapanese.service.implementations.LessonPartService;
import com.ktnl.fapanese.service.interfaces.ILessonPartService;
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
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
// Dùng LENIENT để tránh lỗi UnnecessaryStubbingException khi mock repoReturnsSize = 0
@MockitoSettings(strictness = Strictness.LENIENT)
public class LessonPartServiceTest {

    @Mock
    private LessonPartRepository lessonPartRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonPartMapper lessonPartMapper;

    @InjectMocks
    private LessonPartService lessonPartService;

    // Dữ liệu mock
    private LessonPart mockLessonPart;
    private LessonPartSimpleResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockLessonPart = new LessonPart();
        mockLessonPart.setId(1L);
        mockLessonPart.setTitle("Part 1");

        mockResponse = new LessonPartSimpleResponse();
        mockResponse.setId(1L);
        mockResponse.setTitle("Part 1");
    }

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/lessonpart/get_parts_by_lesson_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getLessonPartsByLesson")
    void getLessonPartsByLesson_Scenarios(String testName, Long lessonId, boolean mockLessonExists,
                                          int repoReturnsSize, boolean expectException, String expectedErrorCodeString) {

        // --- ARRANGE (Given) ---

        // 1. Mock Lesson Repository
        when(lessonRepository.existsById(lessonId)).thenReturn(mockLessonExists);

        // 2. Mock LessonPart Repository (chỉ khi lesson tồn tại)
        List<LessonPart> mockPartsList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockLessonPart)
                .collect(Collectors.toList());
        when(lessonPartRepository.findByLessonId(lessonId)).thenReturn(mockPartsList);

        // 3. Mock Mapper (chỉ khi lesson tồn tại)
        List<LessonPartSimpleResponse> mockResponseList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockResponse)
                .collect(Collectors.toList());
        when(lessonPartMapper.toLessonPartSimpleResponseList(mockPartsList)).thenReturn(mockResponseList);


        // --- ACT & ASSERT (When & Then) ---
        if (expectException) {
            // Kịch bản THẤT BẠI (Lesson not found)
            ErrorCode expectedCode = ErrorCode.valueOf(expectedErrorCodeString);

            AppException exception = assertThrows(AppException.class, () -> {
                lessonPartService.getLessonPartsByLesson(lessonId);
            });

            assertEquals(expectedCode, exception.getErrorCode());

            // Đảm bảo không gọi các repo/mapper khác
            verify(lessonPartRepository, never()).findByLessonId(any());
            verify(lessonPartMapper, never()).toLessonPartSimpleResponseList(any());
        } else {
            // Kịch bản THÀNH CÔNG
            List<LessonPartSimpleResponse> result = lessonPartService.getLessonPartsByLesson(lessonId);

            assertNotNull(result);
            assertEquals(repoReturnsSize, result.size());

            // Đảm bảo các hàm đã được gọi đúng
            verify(lessonRepository, times(1)).existsById(lessonId);
            verify(lessonPartRepository, times(1)).findByLessonId(lessonId);
            verify(lessonPartMapper, times(1)).toLessonPartSimpleResponseList(mockPartsList);
        }
    }
}