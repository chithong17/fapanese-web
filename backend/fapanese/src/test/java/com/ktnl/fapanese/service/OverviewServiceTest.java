package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.OverviewRequest;
import com.ktnl.fapanese.dto.response.OverviewResponse;
import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.entity.Overview;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.OverviewMapper;
import com.ktnl.fapanese.repository.CourseRepository;
import com.ktnl.fapanese.repository.OverviewRepository;
import com.ktnl.fapanese.service.implementations.OverviewService;
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
import java.util.Collections;
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
class OverviewServiceTest {

    @Mock
    private OverviewRepository overviewRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private OverviewMapper overviewMapper;

    @InjectMocks
    private OverviewService overviewService;

    // --- Dữ liệu mẫu ---
    private OverviewRequest mockRequest;
    private Course mockCourse; // Cha
    private Course mockNewCourse; // Cha mới (để update)
    private Overview mockOverview; // Con
    private OverviewResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockCourse = new Course();
        // ID sẽ được set trong từng kịch bản test

        mockNewCourse = new Course();
        mockNewCourse.setId(20L); // ID của cha mới

        mockOverview = new Overview();
        mockOverview.setId(1L);
        mockOverview.setCourse(mockCourse); // Gán cha

        // Giả lập DTO
        // (Bạn có thể cần sửa lại 'new' nếu constructor DTO của bạn khác)
        mockRequest = new OverviewRequest();
        mockRequest.setOverviewTitle("Test Overview");
        // courseId sẽ được set trong từng kịch bản

        mockResponse = new OverviewResponse();
        mockResponse.setId(1L);
        mockResponse.setOverviewTitle("Test Overview");
    }

    // --- 1. getAllOverviews ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overview/get_all_overviews_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getAllOverviews")
    void getAllOverviews_Scenarios(String testName, int repoReturnsSize) {
        // Arrange
        List<Overview> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockOverview)
                .collect(Collectors.toList());
        List<OverviewResponse> mockResponseList = Collections.nCopies(repoReturnsSize, mockResponse);

        when(overviewRepository.findAll()).thenReturn(mockList);
        when(overviewMapper.toOverviewResponseList(mockList)).thenReturn(mockResponseList);

        // Act
        List<OverviewResponse> result = overviewService.getAllOverviews();

        // Assert
        assertNotNull(result);
        assertEquals(repoReturnsSize, result.size());
        verify(overviewRepository, times(1)).findAll();
    }

    // --- 2. getOverviewById ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overview/get_overview_by_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getOverviewById")
    void getOverviewById_Scenarios(String testName, Long overviewId, boolean mockOverviewFound,
                                   boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockOverviewFound) {
            when(overviewRepository.findById(overviewId)).thenReturn(Optional.of(mockOverview));
            when(overviewMapper.toOverviewResponse(mockOverview)).thenReturn(mockResponse);
        } else {
            when(overviewRepository.findById(overviewId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> overviewService.getOverviewById(overviewId));
            assertEquals(code, e.getErrorCode());
        } else {
            OverviewResponse result = overviewService.getOverviewById(overviewId);
            assertNotNull(result);
            assertEquals(mockResponse.getId(), result.getId());
        }
        verify(overviewRepository, times(1)).findById(overviewId);
    }

    // --- 3. createOverview ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overview/create_overview_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản createOverview")
    void createOverview_Scenarios(String testName, Long courseId, boolean mockCourseFound,
                                  boolean expectException, String expectedErrorCodeString) {
        // Arrange
        mockRequest.setCourseId(courseId);

        if (mockCourseFound) {
            mockCourse.setId(courseId); // Gán ID cho cha
            when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
        } else {
            when(courseRepository.findById(courseId)).thenReturn(Optional.empty());
        }

        Overview overviewToSave = new Overview(); // Entity rỗng
        when(overviewMapper.toOverview(mockRequest)).thenReturn(overviewToSave);
        when(overviewRepository.save(overviewToSave)).thenReturn(mockOverview);
        when(overviewMapper.toOverviewResponse(mockOverview)).thenReturn(mockResponse);

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> overviewService.createOverview(mockRequest));
            assertEquals(code, e.getErrorCode());
            verify(overviewRepository, never()).save(any());
        } else {
            OverviewResponse result = overviewService.createOverview(mockRequest);
            assertNotNull(result);
            // Kiểm tra quan hệ cha-con đã được gán
            assertEquals(mockCourse, overviewToSave.getCourse());
            verify(overviewRepository, times(1)).save(overviewToSave);
        }
    }

    // --- 4. updateOverview ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overview/update_overview_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản updateOverview")
    void updateOverview_Scenarios(String testName, Long overviewId, boolean mockOverviewFound,
                                  Long currentCourseId, Long newCourseId, boolean mockNewCourseFound,
                                  boolean expectException, String expectedErrorCodeString) {
        // Arrange
        mockRequest.setCourseId(newCourseId);

        // Mock cha cũ
        mockCourse.setId(currentCourseId);
        mockOverview.setCourse(mockCourse); // Gán cha cũ vào overview

        if (mockOverviewFound) {
            when(overviewRepository.findById(overviewId)).thenReturn(Optional.of(mockOverview));
        } else {
            when(overviewRepository.findById(overviewId)).thenReturn(Optional.empty());
        }

        boolean changingCourse = !currentCourseId.equals(newCourseId);

        if (changingCourse) {
            if (mockNewCourseFound) {
                mockNewCourse.setId(newCourseId); // Gán ID cho cha mới
                when(courseRepository.findById(newCourseId)).thenReturn(Optional.of(mockNewCourse));
            } else {
                when(courseRepository.findById(newCourseId)).thenReturn(Optional.empty());
            }
        }

        if (!expectException) {
            when(overviewRepository.save(mockOverview)).thenReturn(mockOverview);
            when(overviewMapper.toOverviewResponse(mockOverview)).thenReturn(mockResponse);
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> overviewService.updateOverview(overviewId, mockRequest));
            assertEquals(code, e.getErrorCode());
            verify(overviewRepository, never()).save(any());
        } else {
            OverviewResponse result = overviewService.updateOverview(overviewId, mockRequest);
            assertNotNull(result);

            verify(overviewMapper, times(1)).updateOverview(mockOverview, mockRequest);

            if (changingCourse) {
                verify(courseRepository, times(1)).findById(newCourseId);
                assertEquals(mockNewCourse, mockOverview.getCourse()); // Đã gán cha mới
            } else {
                verify(courseRepository, never()).findById(anyLong());
                assertEquals(mockCourse, mockOverview.getCourse()); // Vẫn là cha cũ
            }

            verify(overviewRepository, times(1)).save(mockOverview);
        }
    }

    // --- 5. deleteOverview ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overview/delete_overview_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản deleteOverview")
    void deleteOverview_Scenarios(String testName, Long overviewId, boolean mockOverviewFound,
                                  boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockOverviewFound) {
            when(overviewRepository.findById(overviewId)).thenReturn(Optional.of(mockOverview));
        } else {
            when(overviewRepository.findById(overviewId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> overviewService.deleteOverview(overviewId));
            assertEquals(code, e.getErrorCode());
            verify(overviewRepository, never()).delete(any());
        } else {
            overviewService.deleteOverview(overviewId);
            verify(overviewRepository, times(1)).delete(mockOverview);
        }
    }

    // --- 6. getAllOverviewsByCourseCode ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overview/get_all_overviews_by_course_code_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getAllOverviewsByCourseCode")
    void getAllOverviewsByCourseCode_Scenarios(String testName, String courseCode, boolean mockCourseFound,
                                               int numOverviewsInSet, boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockCourseFound) {
            // Tạo mock Set<Overview>
            Set<Overview> mockSet = IntStream.range(0, numOverviewsInSet)
                    .mapToObj(i -> new Overview()) // Tạo đối tượng mới
                    .collect(Collectors.toSet());
            mockCourse.setOverviews(mockSet);
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.of(mockCourse));

            // Mock mapper (chú ý: service convert Set -> ArrayList)
            when(overviewMapper.toOverviewResponseList(any(ArrayList.class)))
                    .thenReturn(Collections.nCopies(numOverviewsInSet, mockResponse));
        } else {
            when(courseRepository.findByCode(courseCode)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> overviewService.getAllOverviewsByCourseCode(courseCode));
            assertEquals(code, e.getErrorCode());
        } else {
            List<OverviewResponse> result = overviewService.getAllOverviewsByCourseCode(courseCode);
            assertNotNull(result);
            assertEquals(numOverviewsInSet, result.size());
            verify(overviewMapper, times(1)).toOverviewResponseList(any(ArrayList.class));
        }
        verify(courseRepository, times(1)).findByCode(courseCode);
    }
}