package com.ktnl.fapanese.service;


import com.ktnl.fapanese.dto.request.LessonRequest;
import com.ktnl.fapanese.dto.response.LessonRespone;
import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.LessonMapper;
import com.ktnl.fapanese.repository.CourseRepository;
import com.ktnl.fapanese.repository.LessonRepository;

import com.ktnl.fapanese.service.implementations.LessonService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
// Dùng LENIENT để tránh lỗi UnnecessaryStubbingException khi mock repoReturnsSize = 0
@MockitoSettings(strictness = Strictness.LENIENT)
class LessonServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private CourseRepository courseRepository;

    // Không dùng @Mock cho LessonMapper vì nó được gọi tĩnh (static)

    @InjectMocks
    private LessonService lessonService;

    // --- Dữ liệu mẫu ---
    private Course mockCourse;
    private Course mockCourseOther; // Dùng để test logic "lesson not in course"
    private Lesson mockLesson;
    private Lesson mockLesson2;
    private LessonRequest mockRequest;
    private LessonRespone mockResponse;

    // --- Mocking cho phương thức Static ---
    private MockedStatic<LessonMapper> lessonMapperMockedStatic;

    @BeforeEach
    void setUp() {
        // 1. Khởi tạo đối tượng mẫu
        mockCourse = new Course();
        mockCourse.setId(1L);
        mockCourse.setCode("N5");

        mockCourseOther = new Course();
        mockCourseOther.setId(2L);
        mockCourseOther.setCode("N4"); // Dùng cho kịch bản test lỗi

        mockLesson = new Lesson();
        mockLesson.setId(1L);
        mockLesson.setLessonTitle("Lesson 1");
        mockLesson.setOrderIndex(2); // Dùng cho test sort
        mockLesson.setCourse(mockCourse); // Mặc định lesson 1 thuộc course 1

        mockLesson2 = new Lesson();
        mockLesson2.setId(2L);
        mockLesson2.setLessonTitle("Lesson 2");
        mockLesson2.setOrderIndex(1); // Dùng cho test sort
        mockLesson2.setCourse(mockCourse);

        mockCourse.setLessons(Set.of(mockLesson, mockLesson2));

        mockRequest = new LessonRequest("New Lesson", "Desc", 1, 1L);
        mockResponse = new LessonRespone(1L, "New Lesson", "Desc", 1);

        // 2. Mở mock cho phương thức static
        lessonMapperMockedStatic = mockStatic(LessonMapper.class);
    }

    @AfterEach
    void tearDown() {
        // 3. Đóng mock static sau mỗi test
        lessonMapperMockedStatic.close();
    }

    // --- 1. Test cho getAllLesson ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/lesson/get_all_lessons_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getAllLesson")
    void getAllLesson_Scenarios(String testName, int repoReturnsSize) {
        // Arrange
        List<Lesson> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockLesson)
                .collect(Collectors.toList());
        when(lessonRepository.findAll()).thenReturn(mockList);

        // Mock static mapper
        lessonMapperMockedStatic.when(() -> LessonMapper.toLessonResponse(any(Lesson.class)))
                .thenReturn(mockResponse);

        // Act
        List<LessonRespone> result = lessonService.getAllLesson();

        // Assert
        assertNotNull(result);
        assertEquals(repoReturnsSize, result.size());
        verify(lessonRepository, times(1)).findAll();
        // Kiểm tra static mapper được gọi N lần
        lessonMapperMockedStatic.verify(() -> LessonMapper.toLessonResponse(any(Lesson.class)), times(repoReturnsSize));
    }

    // --- 2. Test cho getLessonByCourseId ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/lesson/get_lesson_by_course_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getLessonByCourseId")
    void getLessonByCourseId_Scenarios(String testName, Long courseId, int repoReturnsSize) {
        // Arrange
        List<Lesson> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockLesson)
                .collect(Collectors.toList());
        when(lessonRepository.findByCourseId(courseId)).thenReturn(mockList);

        lessonMapperMockedStatic.when(() -> LessonMapper.toLessonResponse(any(Lesson.class)))
                .thenReturn(mockResponse);

        // Act
        List<LessonRespone> result = lessonService.getLessonByCourseId(courseId);

        // Assert
        assertNotNull(result);
        assertEquals(repoReturnsSize, result.size());
        verify(lessonRepository, times(1)).findByCourseId(courseId);
    }

    // --- 3. Test cho getLessonByLessonId ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/lesson/get_lesson_by_lesson_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getLessonByLessonId")
    void getLessonByLessonId_Scenarios(String testName, Long lessonId, boolean mockLessonFound,
                                       boolean expectException, String expectedErrorClass) {
        // Arrange
        if (mockLessonFound) {
            when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(mockLesson));
            lessonMapperMockedStatic.when(() -> LessonMapper.toLessonResponse(mockLesson))
                    .thenReturn(mockResponse);
        } else {
            when(lessonRepository.findById(lessonId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            // Kiểm tra đúng loại Exception
            assertThrows(RuntimeException.class, () -> {
                lessonService.getLessonByLessonId(lessonId);
            });
        } else {
            LessonRespone result = lessonService.getLessonByLessonId(lessonId);
            assertNotNull(result);
            assertEquals(mockResponse, result);
        }
        verify(lessonRepository, times(1)).findById(lessonId);
    }

    // --- 4. Test cho findByCourseCode ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/lesson/find_by_course_code_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản findByCourseCode")
    void findByCourseCode_Scenarios(String testName, String courseCode, boolean mockCourseFound,
                                    boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockCourseFound) {
            // mockLesson (index 2), mockLesson2 (index 1)
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.of(mockCourse));
        } else {
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> {
                lessonService.findByCourseCode(courseCode);
            });
            assertEquals(expectedCode, e.getErrorCode());
        } else {
            List<LessonRespone> result = lessonService.findByCourseCode(courseCode);

            assertNotNull(result);
            assertEquals(2, result.size());
            // Kiểm tra logic sắp xếp: index 1 (mockLesson2) phải đứng trước index 2 (mockLesson)
            assertEquals(1L, result.get(1).getId()); // mockLesson
            assertEquals(2L, result.get(0).getId()); // mockLesson2

            // Đảm bảo KHÔNG gọi static mapper
            lessonMapperMockedStatic.verify(() -> LessonMapper.toLessonResponse(any()), never());
        }
        verify(courseRepository, times(1)).findByCode(courseCode);
    }

    // --- 5. Test cho createLessonByCourseCode ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/lesson/create_lesson_by_course_code_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản createLessonByCourseCode")
    void createLessonByCourseCode_Scenarios(String testName, String courseCode, boolean mockCourseFound,
                                            boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockCourseFound) {
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.of(mockCourse));
            when(lessonRepository.save(any(Lesson.class))).thenReturn(mockLesson);
            lessonMapperMockedStatic.when(() -> LessonMapper.toLessonResponse(mockLesson))
                    .thenReturn(mockResponse);
        } else {
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> {
                lessonService.createLessonByCourseCode(mockRequest, courseCode);
            });
            assertEquals(expectedCode, e.getErrorCode());
            verify(lessonRepository, never()).save(any());
        } else {
            LessonRespone result = lessonService.createLessonByCourseCode(mockRequest, courseCode);
            assertNotNull(result);
            assertEquals(mockResponse, result);
            verify(courseRepository, times(1)).findByCode(courseCode);
            verify(lessonRepository, times(1)).save(any(Lesson.class));
        }
    }

    // --- 6. Test cho updateLessonByCourseCode ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/lesson/update_lesson_by_course_code_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản updateLessonByCourseCode")
    void updateLessonByCourseCode_Scenarios(String testName, String courseCode, Long lessonId,
                                            boolean mockCourseFound, boolean mockLessonFound, boolean isLessonInCourse,
                                            boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockCourseFound) {
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.of(mockCourse));
        } else {
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.empty());
        }

        if (mockLessonFound) {
            if (!isLessonInCourse) {
                // Gán lesson này cho 1 course khác (ID 2)
                mockLesson.setCourse(mockCourseOther);
            }
            when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(mockLesson));
        } else {
            when(lessonRepository.findById(lessonId)).thenReturn(Optional.empty());
        }

        // Mock save và mapper (chỉ khi thành công)
        if (!expectException) {
            when(lessonRepository.save(any(Lesson.class))).thenReturn(mockLesson);
            lessonMapperMockedStatic.when(() -> LessonMapper.toLessonResponse(mockLesson))
                    .thenReturn(mockResponse);
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> {
                lessonService.updateLessonByCourseCode(mockRequest, courseCode, lessonId);
            });
            assertEquals(expectedCode, e.getErrorCode());
            verify(lessonRepository, never()).save(any());
        } else {
            LessonRespone result = lessonService.updateLessonByCourseCode(mockRequest, courseCode, lessonId);
            assertNotNull(result);
            assertEquals(mockResponse, result);
            verify(lessonRepository, times(1)).save(any(Lesson.class));
        }
    }

    // --- 7. Test cho deleteLessonByCourseCode ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/lesson/delete_lesson_by_course_code_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản deleteLessonByCourseCode")
    void deleteLessonByCourseCode_Scenarios(String testName, String courseCode, Long lessonId,
                                            boolean mockCourseFound, boolean mockLessonFound, boolean isLessonInCourse,
                                            boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockCourseFound) {
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.of(mockCourse));
        } else {
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.empty());
        }

        if (mockLessonFound) {
            if (!isLessonInCourse) {
                mockLesson.setCourse(mockCourseOther); // Gán cho course khác
            }
            when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(mockLesson));
        } else {
            when(lessonRepository.findById(lessonId)).thenReturn(Optional.empty());
        }

        if (!expectException) {
            doNothing().when(lessonRepository).delete(mockLesson);
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> {
                lessonService.deleteLessonByCourseCode(courseCode, lessonId);
            });
            assertEquals(expectedCode, e.getErrorCode());
            verify(lessonRepository, never()).delete(any());
        } else {
            lessonService.deleteLessonByCourseCode(courseCode, lessonId);
            verify(lessonRepository, times(1)).delete(mockLesson);
        }
    }
}