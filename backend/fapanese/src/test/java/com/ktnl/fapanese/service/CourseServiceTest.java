package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.CourseRequest;
import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.CourseMapper;
import com.ktnl.fapanese.repository.CourseRepository;
import com.ktnl.fapanese.service.implementations.CourseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.ArgumentCaptor;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT) // Tránh lỗi UnnecessaryStubbingException
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CourseMapper courseMapper;

    @InjectMocks
    private CourseService courseService;

    // Dữ liệu mock
    private Course mockCourse;
    private CourseResponse mockCourseResponse;

    @BeforeEach
    void setUp() {
        mockCourse = Course.builder()
                .id(1L)
                .courseName("Japanese N5")
                .code("N5")
                .description("Basic Japanese course")
                .build();

        mockCourseResponse = CourseResponse.builder()
                .id(1L)
                .courseName("Japanese N5")
                .code("N5")
                .description("Basic Japanese course")
                .build();
    }


    // --- 1. Tests cho createCourse ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/course/create_course_scenarios.csv", numLinesToSkip = 1, nullValues = {""})
    @DisplayName("Data-driven: Kịch bản createCourse")
    void createCourse_Scenarios(String testName, String courseName, boolean expectException, String expectedErrorCodeString) {
        // Arrange
        CourseRequest request = CourseRequest.builder().courseName(courseName).code("N5").build();

        // Dùng ArgumentCaptor để bắt chính xác đối tượng được truyền vào mapper
        Course courseToMap = Course.builder().courseName(courseName).code("N5").build();

        when(courseMapper.toCourse(request)).thenReturn(courseToMap);

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> courseService.createCourse(request));
            assertEquals(expectedErrorCode, e.getErrorCode());
            verify(courseRepository, never()).save(any());
        } else {
            // Kịch bản SUCCESS
            when(courseRepository.save(courseToMap)).thenReturn(mockCourse);
            when(courseMapper.toCourseResponse(mockCourse)).thenReturn(mockCourseResponse);

            CourseResponse response = courseService.createCourse(request);

            assertNotNull(response);
            assertEquals(mockCourseResponse.getId(), response.getId());
            assertEquals(mockCourseResponse.getCourseName(), response.getCourseName());
            verify(courseRepository, times(1)).save(courseToMap);
        }
    }

    // --- 2. Tests cho getAllCourses ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/course/get_all_courses_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getAllCourses")
    void getAllCourses_Scenarios(String testName, int repoReturnsSize) {
        // Arrange
        List<Course> list = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockCourse)
                .collect(Collectors.toList());
        when(courseRepository.findAll()).thenReturn(list);
        when(courseMapper.toCourseResponse(mockCourse)).thenReturn(mockCourseResponse);

        // Act
        List<CourseResponse> responses = courseService.getAllCourses();

        // Assert
        assertNotNull(responses);
        assertEquals(repoReturnsSize, responses.size());
        verify(courseMapper, times(repoReturnsSize)).toCourseResponse(any(Course.class));
    }

    // --- 3. Tests cho getCourseById ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/course/get_course_by_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getCourseById")
    void getCourseById_Scenarios(String testName, Long courseId, boolean mockCourseFound,
                                 boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockCourseFound) {
            when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
        } else {
            when(courseRepository.findById(courseId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> courseService.getCourseById(courseId));
            assertEquals(expectedErrorCode, e.getErrorCode());
        } else {
            when(courseMapper.toCourseResponse(mockCourse)).thenReturn(mockCourseResponse);
            CourseResponse response = courseService.getCourseById(courseId);
            assertNotNull(response);
            assertEquals(mockCourseResponse.getId(), response.getId());
        }
    }

    // --- 4. Tests cho updateCourse ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/course/update_course_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản updateCourse")
    void updateCourse_Scenarios(String testName, Long courseId, boolean mockCourseFound,
                                boolean expectException, String expectedErrorCodeString) {
        // Arrange
        CourseRequest request = CourseRequest.builder().courseName("Updated Name").build();

        if (mockCourseFound) {
            when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
        } else {
            when(courseRepository.findById(courseId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> courseService.updateCourse(courseId, request));
            assertEquals(expectedErrorCode, e.getErrorCode());
            verify(courseMapper, never()).updateCourse(any(), any());
            verify(courseRepository, never()).save(any());
        } else {
            // Kịch bản SUCCESS
            doNothing().when(courseMapper).updateCourse(mockCourse, request);
            when(courseRepository.save(mockCourse)).thenReturn(mockCourse);
            when(courseMapper.toCourseResponse(mockCourse)).thenReturn(mockCourseResponse);

            CourseResponse response = courseService.updateCourse(courseId, request);

            assertNotNull(response);
            verify(courseMapper, times(1)).updateCourse(mockCourse, request);
            verify(courseRepository, times(1)).save(mockCourse);
        }
    }

    // --- 5. Tests cho deleteCourse ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/course/delete_course_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản deleteCourse")
    void deleteCourse_Scenarios(String testName, Long courseId, boolean mockCourseExists,
                                boolean expectException, String expectedErrorCodeString) {
        // Arrange
        when(courseRepository.existsById(courseId)).thenReturn(mockCourseExists);

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> courseService.deleteCourse(courseId));
            assertEquals(expectedErrorCode, e.getErrorCode());
            verify(courseRepository, never()).deleteById(any());
        } else {
            // Kịch bản SUCCESS
            doNothing().when(courseRepository).deleteById(courseId);
            courseService.deleteCourse(courseId);
            verify(courseRepository, times(1)).deleteById(courseId);
        }
    }

    // --- 6. Tests cho findByCode ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/course/find_by_code_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản findByCode")
    void findByCode_Scenarios(String testName, String courseCode, boolean mockCourseFound) {
        // Arrange
        if (mockCourseFound) {
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.of(mockCourse));
        } else {
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.empty());
        }

        // Act
        Optional<Course> result = courseService.findByCode(courseCode);

        // Assert
        assertEquals(mockCourseFound, result.isPresent());
        if(mockCourseFound) {
            assertEquals(mockCourse.getCode(), result.get().getCode());
        }
    }
}