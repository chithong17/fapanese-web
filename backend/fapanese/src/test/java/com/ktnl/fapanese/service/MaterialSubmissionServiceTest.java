package com.ktnl.fapanese.service;


import com.ktnl.fapanese.dto.request.MaterialSubmissionGradeRequest;
import com.ktnl.fapanese.dto.request.MaterialSubmissionRequest;
import com.ktnl.fapanese.dto.response.MaterialSubmissionResponse;
import com.ktnl.fapanese.entity.*;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.MaterialSubmissionMapper;
import com.ktnl.fapanese.repository.*;
import com.ktnl.fapanese.service.implementations.MaterialSubmissionService;
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
@MockitoSettings(strictness = Strictness.LENIENT) // Dùng LENIENT vì nhiều kịch bản mock
class MaterialSubmissionServiceTest {

    @Mock
    private MaterialSubmissionRepository submissionRepository;
    @Mock
    private MaterialRepository materialRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private ClassCourseRepository classCourseRepository;
    @Mock
    private MaterialSubmissionMapper mapper;

    @InjectMocks
    private MaterialSubmissionService submissionService;

    // --- Dữ liệu mẫu ---
    private Material mockMaterial;
    private Student mockStudent;
    private ClassCourse mockClassCourse;
    private MaterialSubmission mockSubmission;
    private MaterialSubmissionRequest mockRequest;
    private MaterialSubmissionGradeRequest mockGradeRequest;
    private MaterialSubmissionResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockClassCourse = new ClassCourse();
        mockClassCourse.setId(10L);

        // ClassMaterial (quan hệ giữa Material và Class)
        ClassMaterial mockClassMaterial = ClassMaterial.builder()
                .classCourse(mockClassCourse)
                .build();

        mockMaterial = new Material();
        mockMaterial.setId(1L);
        // Gán ClassMaterial vào Material để test logic "materialInClass"
        mockMaterial.setClassMaterials(Set.of(mockClassMaterial));

        mockStudent = new Student();
        mockStudent.setId("std123");

        mockRequest = MaterialSubmissionRequest.builder()
                .materialId(1L)
                .studentId("std123")
                .classCourseId(10L)
                .fileUrl("http://new.file")
                .build();

        mockGradeRequest = new MaterialSubmissionGradeRequest(9.5, "Good job");

        mockSubmission = MaterialSubmission.builder()
                .id(1L)
                .material(mockMaterial)
                .student(mockStudent)
                .classCourse(mockClassCourse)
                .status(MaterialSubmission.Status.PENDING)
                .build();

        mockResponse = new MaterialSubmissionResponse();
        mockResponse.setId(1L);
    }

    // --- 1. Test cho submit ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/submission/submit_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản submit")
    void submit_Scenarios(String testName, Long materialId, String studentId, Long classId,
                          boolean mockMaterialFound, boolean mockStudentFound, boolean mockClassFound,
                          String materialType, boolean materialInClass, boolean isResubmit,
                          boolean expectException, String expectedErrorCodeString) {

        // --- ARRANGE (Given) ---

        // 1. Mock các lệnh find
        if (mockMaterialFound) {
            when(materialRepository.findById(materialId)).thenReturn(Optional.of(mockMaterial));
        } else {
            when(materialRepository.findById(materialId)).thenReturn(Optional.empty());
        }

        if (mockStudentFound) {
            when(studentRepository.findById(studentId)).thenReturn(Optional.of(mockStudent));
        } else {
            when(studentRepository.findById(studentId)).thenReturn(Optional.empty());
        }

        if (mockClassFound) {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.of(mockClassCourse));
        } else {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.empty());
        }

        // 2. Mock logic nghiệp vụ
        mockMaterial.setType(Material.MaterialType.valueOf(materialType));

        if (!materialInClass) {
            // Ghi đè mock từ setUp, trả về Set rỗng
            mockMaterial.setClassMaterials(Collections.emptySet());
        }

        if (isResubmit) {
            // Kịch bản nộp lại: tìm thấy bài nộp cũ
            when(submissionRepository.findByStudent_IdAndMaterial_Id(studentId, materialId))
                    .thenReturn(Optional.of(mockSubmission));
        } else {
            // Kịch bản nộp lần đầu
            when(submissionRepository.findByStudent_IdAndMaterial_Id(studentId, materialId))
                    .thenReturn(Optional.empty());
        }

        // 3. Mock save và map (chỉ khi thành công)
        when(submissionRepository.save(any(MaterialSubmission.class))).thenReturn(mockSubmission);
        when(mapper.toResponse(any(MaterialSubmission.class))).thenReturn(mockResponse);

        // --- ACT & ASSERT (When & Then) ---
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> {
                submissionService.submit(mockRequest);
            });
            assertEquals(code, e.getErrorCode());
            verify(submissionRepository, never()).save(any());
        } else {
            // Kịch bản thành công
            ArgumentCaptor<MaterialSubmission> submissionCaptor = ArgumentCaptor.forClass(MaterialSubmission.class);

            MaterialSubmissionResponse result = submissionService.submit(mockRequest);
            assertNotNull(result);

            // Bắt đối tượng được save
            verify(submissionRepository, times(1)).save(submissionCaptor.capture());
            MaterialSubmission savedSubmission = submissionCaptor.getValue();

            // Kiểm tra các trường đã được cập nhật
            assertNotNull(savedSubmission.getSubmittedAt());
            assertEquals(MaterialSubmission.Status.SUBMITTED, savedSubmission.getStatus());
            assertEquals("http://new.file", savedSubmission.getFileUrl());

            if (isResubmit) {
                // Đảm bảo đã cập nhật trên object cũ
                assertEquals(mockSubmission, savedSubmission);
                assertEquals(1L, savedSubmission.getId()); // ID cũ
            } else {
                // Đảm bảo là object mới (ID có thể là null trước khi save)
                assertNotEquals(mockSubmission, savedSubmission);
            }
        }
    }

    // --- 2. Test cho grade ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/submission/grade_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản grade")
    void grade_Scenarios(String testName, Long submissionId, boolean mockSubmissionFound,
                         boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockSubmissionFound) {
            when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(mockSubmission));
        } else {
            when(submissionRepository.findById(submissionId)).thenReturn(Optional.empty());
        }

        when(submissionRepository.save(any(MaterialSubmission.class))).thenReturn(mockSubmission);
        when(mapper.toResponse(any(MaterialSubmission.class))).thenReturn(mockResponse);

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> {
                submissionService.grade(submissionId, mockGradeRequest);
            });
            assertEquals(code, e.getErrorCode());
            verify(submissionRepository, never()).save(any());
        } else {
            ArgumentCaptor<MaterialSubmission> captor = ArgumentCaptor.forClass(MaterialSubmission.class);
            MaterialSubmissionResponse result = submissionService.grade(submissionId, mockGradeRequest);

            assertNotNull(result);
            verify(submissionRepository, times(1)).save(captor.capture());

            // Kiểm tra các trường đã được set
            MaterialSubmission saved = captor.getValue();
            assertEquals(MaterialSubmission.Status.GRADED, saved.getStatus());
            assertEquals(9.5f, saved.getScore());
            assertEquals("Good job", saved.getFeedback());
        }
    }

    // --- 3. Test cho getByMaterial ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/submission/get_by_material_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getByMaterial")
    void getByMaterial_Scenarios(String testName, Long materialId, int repoReturnsSize) {
        // Arrange
        List<MaterialSubmission> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> new MaterialSubmission())
                .collect(Collectors.toList());
        List<MaterialSubmissionResponse> mockResponseList = Collections.nCopies(repoReturnsSize, new MaterialSubmissionResponse());

        when(submissionRepository.findByMaterial_Id(materialId)).thenReturn(mockList);
        when(mapper.toResponseList(mockList)).thenReturn(mockResponseList);

        // Act
        List<MaterialSubmissionResponse> result = submissionService.getByMaterial(materialId);

        // Assert
        assertNotNull(result);
        assertEquals(repoReturnsSize, result.size());
        verify(submissionRepository, times(1)).findByMaterial_Id(materialId);
        verify(mapper, times(1)).toResponseList(mockList);
    }

    // --- 4. Test cho getByStudent ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/submission/get_by_student_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getByStudent")
    void getByStudent_Scenarios(String testName, String studentId, int repoReturnsSize) {
        // Arrange
        List<MaterialSubmission> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> new MaterialSubmission())
                .collect(Collectors.toList());
        List<MaterialSubmissionResponse> mockResponseList = Collections.nCopies(repoReturnsSize, new MaterialSubmissionResponse());

        when(submissionRepository.findByStudent_IdOrderBySubmittedAtDesc(studentId)).thenReturn(mockList);
        when(mapper.toResponseList(mockList)).thenReturn(mockResponseList);

        // Act
        List<MaterialSubmissionResponse> result = submissionService.getByStudent(studentId);

        // Assert
        assertNotNull(result);
        assertEquals(repoReturnsSize, result.size());
        verify(submissionRepository, times(1)).findByStudent_IdOrderBySubmittedAtDesc(studentId);
        verify(mapper, times(1)).toResponseList(mockList);
    }

    // --- 5. Test cho getByClassCourse ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/submission/get_by_class_course_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getByClassCourse")
    void getByClassCourse_Scenarios(String testName, Long classId, int repoReturnsSize) {
        // Arrange
        List<MaterialSubmission> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> new MaterialSubmission())
                .collect(Collectors.toList());
        List<MaterialSubmissionResponse> mockResponseList = Collections.nCopies(repoReturnsSize, new MaterialSubmissionResponse());

        when(submissionRepository.findByClassCourse_Id(classId)).thenReturn(mockList);
        when(mapper.toResponseList(mockList)).thenReturn(mockResponseList);

        // Act
        List<MaterialSubmissionResponse> result = submissionService.getByClassCourse(classId);

        // Assert
        assertNotNull(result);
        assertEquals(repoReturnsSize, result.size());
        verify(submissionRepository, times(1)).findByClassCourse_Id(classId);
        verify(mapper, times(1)).toResponseList(mockList);
    }
}
