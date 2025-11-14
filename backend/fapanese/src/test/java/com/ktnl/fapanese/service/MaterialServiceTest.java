package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.MaterialRequest;
import com.ktnl.fapanese.dto.response.ClassMaterialResponse;
import com.ktnl.fapanese.dto.response.MaterialResponse;
import com.ktnl.fapanese.entity.*;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.ClassMaterialMapper;
import com.ktnl.fapanese.mapper.MaterialMapper;
import com.ktnl.fapanese.repository.*;
import com.ktnl.fapanese.service.implementations.MaterialService;
import com.ktnl.fapanese.service.interfaces.IFileUploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MaterialServiceTest {

    @Mock
    private MaterialRepository materialRepository;
    @Mock
    private LecturerRepository lecturerRepository;
    @Mock
    private MaterialMapper materialMapper;
    @Mock
    private ClassCourseRepository classCourseRepository;
    @Mock
    private ClassMaterialRepository classMaterialRepository;
    @Mock
    private ClassMaterialMapper classMaterialMapper;
    @Mock
    private IFileUploadService iFileUploadService;
    @Mock
    private StudentClassRepository studentClassRepository;

    @InjectMocks
    private MaterialService materialService;

    // --- Dữ liệu mẫu ---
    private Material mockMaterial;
    private MaterialResponse mockMaterialResponse;
    private MaterialRequest mockMaterialRequest;
    private Lecturer mockLecturer;
    private Lecturer mockNewLecturer;
    private ClassCourse mockClassCourse;
    private ClassMaterial mockClassMaterial;
    private ClassMaterialId mockClassMaterialId;
    private Student mockStudent;

    @BeforeEach
    void setUp() {
        mockLecturer = new Lecturer();
        mockLecturer.setId(String.valueOf(10L));

        mockNewLecturer = new Lecturer();
        mockNewLecturer.setId(String.valueOf(20L));

        mockStudent = new Student();
        mockStudent.setId("std123");

        mockMaterialRequest = new MaterialRequest();
        mockMaterialRequest.setLecturerId(String.valueOf(10L));
        mockMaterialRequest.setTitle("Test Material");

        mockMaterial = new Material();
        mockMaterial.setId(1L);
        mockMaterial.setTitle("Test Material");
        mockMaterial.setLecturer(mockLecturer);
        mockMaterial.setClassMaterials(new HashSet<>()); // Khởi tạo để tránh NPE

        mockMaterialResponse = new MaterialResponse();
        mockMaterialResponse.setId(1L);
        mockMaterialResponse.setTitle("Test Material");

        mockClassCourse = new ClassCourse();
        mockClassCourse.setId(10L);

        mockClassMaterialId = new ClassMaterialId(10L, 1L);
        mockClassMaterial = ClassMaterial.builder()
                .id(mockClassMaterialId)
                .material(mockMaterial)
                .classCourse(mockClassCourse)
                .build();
    }

    // --- 1. getAllMaterials ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/material/get_all_materials_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getAllMaterials")
    void getAllMaterials_Scenarios(String testName, int repoReturnsSize) {
        // Arrange
        List<Material> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockMaterial)
                .collect(Collectors.toList());
        when(materialRepository.findAll()).thenReturn(mockList);
        when(materialMapper.toMaterialResponseList(mockList)).thenReturn(Collections.nCopies(repoReturnsSize, mockMaterialResponse));

        // Act
        List<MaterialResponse> result = materialService.getAllMaterials();

        // Assert
        assertNotNull(result);
        assertEquals(repoReturnsSize, result.size());
        verify(materialRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("updateMaterial - When LecturerId is Null - Should Not Change Lecturer")
    void updateMaterial_WhenLecturerIdIsNull_ShouldNotChangeLecturer() {
        // --- GIVEN ---
        // Yêu cầu update không chứa lecturerId
        mockMaterialRequest.setLecturerId(null);

        // 'mockMaterial' (từ setUp) đã có 'mockLecturer' (ID 10)
        when(materialRepository.findById(1L)).thenReturn(Optional.of(mockMaterial));
        when(materialRepository.save(mockMaterial)).thenReturn(mockMaterial);
        when(materialMapper.toMaterialResponse(mockMaterial)).thenReturn(mockMaterialResponse);

        // --- WHEN ---
        materialService.updateMaterial(1L, mockMaterialRequest);

        // --- THEN ---
        // Đảm bảo khối 'if' đã bị bỏ qua
        verify(lecturerRepository, never()).findById(String.valueOf(ArgumentMatchers.anyLong()));

        // Đảm bảo lecturer vẫn là người cũ
        assertEquals(mockLecturer, mockMaterial.getLecturer());
        verify(materialRepository, times(1)).save(mockMaterial);
    }

    // --- 2. getMaterialById ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/material/get_material_by_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getMaterialById")
    void getMaterialById_Scenarios(String testName, Long materialId, boolean mockMaterialFound,
                                   boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockMaterialFound) {
            when(materialRepository.findById(materialId)).thenReturn(Optional.of(mockMaterial));
            when(materialMapper.toMaterialResponse(mockMaterial)).thenReturn(mockMaterialResponse);
        } else {
            when(materialRepository.findById(materialId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> materialService.getMaterialById(materialId));
            assertEquals(code, e.getErrorCode());
        } else {
            MaterialResponse result = materialService.getMaterialById(materialId);
            assertNotNull(result);
            assertEquals(mockMaterialResponse.getId(), result.getId());
        }
        verify(materialRepository, times(1)).findById(materialId);
    }

    // --- 3. createMaterial ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/material/create_material_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản createMaterial")
    void createMaterial_Scenarios(String testName, String lecturerId, boolean mockLecturerFound,
                                  boolean expectException, String expectedErrorCodeString) {
        // Arrange
        mockMaterialRequest.setLecturerId(lecturerId);

        if (mockLecturerFound) {
            when(lecturerRepository.findById(lecturerId)).thenReturn(Optional.of(mockLecturer));
        } else {
            when(lecturerRepository.findById(lecturerId)).thenReturn(Optional.empty());
        }

        when(materialMapper.toMaterial(mockMaterialRequest)).thenReturn(mockMaterial);
        when(materialRepository.save(mockMaterial)).thenReturn(mockMaterial);
        when(materialMapper.toMaterialResponse(mockMaterial)).thenReturn(mockMaterialResponse);

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> materialService.createMaterial(mockMaterialRequest));
            assertEquals(code, e.getErrorCode());
            verify(materialRepository, never()).save(any());
        } else {
            MaterialResponse result = materialService.createMaterial(mockMaterialRequest);
            assertNotNull(result);
            verify(lecturerRepository, times(1)).findById(lecturerId);
            verify(materialRepository, times(1)).save(mockMaterial);
            assertNotNull(mockMaterial.getCreatedAt()); // Đảm bảo timestamp được set
        }
    }

    // --- 4. updateMaterial ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/material/update_material_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản updateMaterial")
    void updateMaterial_Scenarios(String testName, Long materialId, boolean mockMaterialFound,
                                  String currentLecturerId, String newLecturerId, boolean mockNewLecturerFound,
                                  boolean expectException, String expectedErrorCodeString) {
        // Arrange
        mockLecturer.setId(currentLecturerId); // Set ID lecturer cũ
        mockMaterialRequest.setLecturerId(newLecturerId);

        if (mockMaterialFound) {
            when(materialRepository.findById(materialId)).thenReturn(Optional.of(mockMaterial));
        } else {
            when(materialRepository.findById(materialId)).thenReturn(Optional.empty());
        }

        boolean changingLecturer = !currentLecturerId.equals(newLecturerId);

        if (changingLecturer) {
            if (mockNewLecturerFound) {
                when(lecturerRepository.findById(newLecturerId)).thenReturn(Optional.of(mockNewLecturer));
            } else {
                when(lecturerRepository.findById(newLecturerId)).thenReturn(Optional.empty());
            }
        }

        if (!expectException) {
            when(materialRepository.save(mockMaterial)).thenReturn(mockMaterial);
            when(materialMapper.toMaterialResponse(mockMaterial)).thenReturn(mockMaterialResponse);
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> materialService.updateMaterial(materialId, mockMaterialRequest));
            assertEquals(code, e.getErrorCode());
            verify(materialRepository, never()).save(any());
        } else {
            MaterialResponse result = materialService.updateMaterial(materialId, mockMaterialRequest);
            assertNotNull(result);
            verify(materialMapper, times(1)).updateMaterial(mockMaterial, mockMaterialRequest);
            if (changingLecturer) {
                verify(lecturerRepository, times(1)).findById(newLecturerId);
                assertEquals(mockNewLecturer, mockMaterial.getLecturer()); // Đã gán lecturer mới
            } else {
                verify(lecturerRepository, never()).findById(newLecturerId);
                assertEquals(mockLecturer, mockMaterial.getLecturer()); // Vẫn là lecturer cũ
            }
            assertNotNull(mockMaterial.getUpdatedAt()); // Đảm bảo timestamp được set
            verify(materialRepository, times(1)).save(mockMaterial);
        }
    }

    // --- 5. deleteMaterial ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/material/delete_material_scenarios.csv", numLinesToSkip = 1, nullValues={"NULL"})
    @DisplayName("Data-driven: Kịch bản deleteMaterial")
    void deleteMaterial_Scenarios(String testName, Long materialId, boolean mockMaterialFound,
                                  String fileUrl, String cloudinaryResult,
                                  boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockMaterialFound) {
            mockMaterial.setFileUrl(fileUrl);
            when(materialRepository.findById(materialId)).thenReturn(Optional.of(mockMaterial));
        } else {
            when(materialRepository.findById(materialId)).thenReturn(Optional.empty());
        }

        boolean hasFile = (fileUrl != null && !fileUrl.isEmpty());
        if (hasFile) {
            when(iFileUploadService.deleteFile(fileUrl)).thenReturn(Map.of("result", cloudinaryResult));
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> materialService.deleteMaterial(materialId));
            assertEquals(code, e.getErrorCode());
            verify(materialRepository, never()).delete(any());
            verify(iFileUploadService, never()).deleteFile(any());
        } else {
            assertDoesNotThrow(() -> materialService.deleteMaterial(materialId));

            if (hasFile) {
                verify(iFileUploadService, times(1)).deleteFile(fileUrl);
            } else {
                verify(iFileUploadService, never()).deleteFile(any());
            }
            verify(materialRepository, times(1)).delete(mockMaterial);
        }
    }

    // --- 6. assignToClass ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/material/assign_to_class_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản assignToClass")
    void assignToClass_Scenarios(String testName, Long materialId, Long classId,
                                 boolean mockMaterialFound, boolean mockClassFound,
                                 boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockMaterialFound) when(materialRepository.findById(materialId)).thenReturn(Optional.of(mockMaterial));
        else when(materialRepository.findById(materialId)).thenReturn(Optional.empty());

        if (mockClassFound) when(classCourseRepository.findById(classId)).thenReturn(Optional.of(mockClassCourse));
        else when(classCourseRepository.findById(classId)).thenReturn(Optional.empty());

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> materialService.assignToClass(materialId, classId, null));
            assertEquals(code, e.getErrorCode());
            verify(classMaterialRepository, never()).save(any());
        } else {
            materialService.assignToClass(materialId, classId, null);
            verify(classMaterialRepository, times(1)).save(any(ClassMaterial.class));
        }
    }

    // --- 7. unAssignToClass ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/material/unassign_to_class_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản unAssignToClass")
    void unAssignToClass_Scenarios(String testName, Long materialId, Long classId,
                                   boolean mockAssignmentFound, boolean expectException, String expectedErrorCodeString) {
        // Arrange
        ClassMaterialId id = new ClassMaterialId(classId, materialId);
        if (mockAssignmentFound) {
            when(classMaterialRepository.findById(id)).thenReturn(Optional.of(mockClassMaterial));
        } else {
            when(classMaterialRepository.findById(id)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> materialService.unAssignToClass(materialId, classId));
            assertEquals(code, e.getErrorCode());
            verify(classMaterialRepository, never()).delete(any());
        } else {
            materialService.unAssignToClass(materialId, classId);
            verify(classMaterialRepository, times(1)).delete(mockClassMaterial);
        }
    }

    // --- 8. getAssignedClassByMaterialId ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/material/get_assigned_class_by_material_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getAssignedClassByMaterialId")
    void getAssignedClassByMaterialId_Scenarios(String testName, Long materialId, boolean mockMaterialFound,
                                                int numAssignedClasses, boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockMaterialFound) {
            Set<ClassMaterial> mockSet = IntStream.range(0, numAssignedClasses)
                    .mapToObj(i -> new ClassMaterial()) // Tạo đối tượng mới
                    .collect(Collectors.toSet());
            mockMaterial.setClassMaterials(mockSet);
            when(materialRepository.findById(materialId)).thenReturn(Optional.of(mockMaterial));
            when(classMaterialMapper.toClassMaterialResponses(anyList())).thenReturn(Collections.nCopies(numAssignedClasses, new ClassMaterialResponse()));
        } else {
            when(materialRepository.findById(materialId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> materialService.getAssignedClassByMaterialId(materialId));
            assertEquals(code, e.getErrorCode());
        } else {
            List<ClassMaterialResponse> result = materialService.getAssignedClassByMaterialId(materialId);
            assertNotNull(result);
            assertEquals(numAssignedClasses, result.size());
            verify(classMaterialMapper, times(1)).toClassMaterialResponses(anyList());
        }
    }

    // --- 9. updateAssignmentDeadline ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/material/update_assignment_deadline_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản updateAssignmentDeadline")
    void updateAssignmentDeadline_Scenarios(String testName, Long materialId, Long classId,
                                            boolean mockAssignmentFound, boolean expectException, String expectedErrorCodeString) {
        // Arrange
        ClassMaterialId id = new ClassMaterialId(classId, materialId);
        if (mockAssignmentFound) {
            when(classMaterialRepository.findById(id)).thenReturn(Optional.of(mockClassMaterial));
        } else {
            when(classMaterialRepository.findById(id)).thenReturn(Optional.empty());
        }

        LocalDateTime newDeadline = LocalDateTime.now();

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> materialService.updateAssignmentDeadline(materialId, classId, newDeadline));
            assertEquals(code, e.getErrorCode());
            verify(classMaterialRepository, never()).save(any());
        } else {
            materialService.updateAssignmentDeadline(materialId, classId, newDeadline);
            verify(classMaterialRepository, times(1)).save(mockClassMaterial);
            assertEquals(newDeadline, mockClassMaterial.getDeadline()); // Kiểm tra deadline đã được set
        }
    }

    // --- 10. getMaterialsByStudent ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/material/get_materials_by_student_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getMaterialsByStudent")
    void getMaterialsByStudent_Scenarios(String testName, String studentId, int numEnrolledClasses,
                                         int numClassMaterials, int numExpectedDistinctMaterials,
                                         boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (numEnrolledClasses > 0) {
            // Mock StudentClass (lớp học của sv)
            // ĐOẠN CODE ĐÃ SỬA
            List<StudentClass> enrolledClasses = IntStream.range(0, numEnrolledClasses)
                    .mapToObj(i -> {
                        // Tạo một ClassCourse tạm và chỉ set ID
                        ClassCourse tempClass = new ClassCourse();
                        tempClass.setId((long) i);

                        // Gán nó vào StudentClass
                        StudentClass sc = new StudentClass();
                        sc.setClassCourse(tempClass);
                        return sc;
                    })
                    .collect(Collectors.toList());

            when(studentClassRepository.findByStudent_Id(studentId)).thenReturn(enrolledClasses);

            // Mock ClassMaterial (tài liệu trong lớp)
            List<ClassMaterial> classMaterials;
            if (numExpectedDistinctMaterials == 1 && numClassMaterials == 2) {
                // Kịch bản test 'distinct': 2 assignment cùng 1 material
                classMaterials = List.of(
                        ClassMaterial.builder().material(mockMaterial).build(),
                        ClassMaterial.builder().material(mockMaterial).build()
                );
            } else {
                // Kịch bản thông thường
                // ĐOẠN CODE ĐÃ SỬA
                classMaterials = IntStream.range(0, numClassMaterials)
                        .mapToObj(i -> {
                            // Tạo một Material tạm và chỉ set ID
                            Material tempMaterial = new Material();
                            tempMaterial.setId((long) i);

                            // Gán nó vào ClassMaterial
                            return ClassMaterial.builder().material(tempMaterial).build();
                        })
                        .collect(Collectors.toList());
            }
            when(classMaterialRepository.findByClassCourse_IdIn(anyList())).thenReturn(classMaterials);

        } else {
            when(studentClassRepository.findByStudent_Id(studentId)).thenReturn(Collections.emptyList());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> materialService.getMaterialsByStudent(studentId));
            assertEquals(code, e.getErrorCode());
        } else {
            // Dùng ArgumentCaptor để bắt list TRƯỚC KHI map
            ArgumentCaptor<List<Material>> captor = ArgumentCaptor.forClass(List.class);

            List<MaterialResponse> result = materialService.getMaterialsByStudent(studentId);
            assertNotNull(result);

            // Kiểm tra list đã được `distinct`
            verify(materialMapper, times(1)).toMaterialResponseList(captor.capture());
            List<Material> capturedList = captor.getValue();
            assertEquals(numExpectedDistinctMaterials, capturedList.size());
        }
    }
}
