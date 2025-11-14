package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.ClassCourseRequest;
// THÊM CÁC IMPORT CHO DTO LỒNG NHAU (GIẢ SỬ CHÚNG TỒN TẠI)
import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.dto.response.ClassMaterialResponse;
import com.ktnl.fapanese.dto.response.StudentClassResponse;
import com.ktnl.fapanese.entity.*;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.ClassCourseMapper;
import com.ktnl.fapanese.mapper.ClassMaterialMapper;
import com.ktnl.fapanese.mapper.StudentClassMapper;
import com.ktnl.fapanese.repository.*;
import com.ktnl.fapanese.service.implementations.ClassCourseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings; // <-- THÊM DÒNG NÀY
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.Collections;
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
class ClassCourseServiceTest {

    // --- Mocks cho các dependencies ---
    @Mock
    private ClassCourseRepository classCourseRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private LecturerRepository lecturerRepository;
    @Mock
    private ClassCourseMapper classCourseMapper;
    @Mock
    private StudentClassRepository studentClassRepository;
    @Mock
    private StudentClassMapper studentClassMapper;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ClassMaterialRepository classMaterialRepository;
    @Mock
    private ClassMaterialMapper classMaterialMapper;

    // --- Class đang được test ---
    @InjectMocks
    private ClassCourseService classCourseService;

    // --- Dữ liệu test mẫu (dùng chung) ---
    private Course mockCourse;
    private Lecturer mockLecturer;
    private ClassCourse mockClassCourse;
    private ClassCourseRespone mockResponse;
    private User mockStudent;
    private StudentClassId mockStudentClassId;

    // --- (SỬA) Thêm mock cho các DTO lồng nhau ---
    private CourseResponse mockCourseResponse;
    private UserResponse mockLecturerResponse;


    @BeforeEach
    void setUp() {
        // --- (SỬA) 1. Mock Entities ---
        mockCourse = Course.builder().id(1L).title("Japanese N5").build();
        mockLecturer = Lecturer.builder()
                .id("LEC001")
                .firstName("Taro") // <-- Sửa từ fullName
                .lastName("Tanaka")  // <-- Sửa từ fullName
                .build();

        // --- (THÊM) 2. Mock các DTO lồng nhau ---
        // (Giả sử các DTO này có builder và các trường tương ứng)
        mockCourseResponse = CourseResponse.builder()
                .id(1L)
                .title("Japanese N5")
                .build();
        mockLecturerResponse = UserResponse.builder()
                .id("LEC001")
                .firstName("Taro")
                .lastName("Tanaka")
                .build();

        // --- 3. Mock Entity chính (Không đổi) ---
        mockClassCourse = ClassCourse.builder()
                .id(10L)
                .course(mockCourse)
                .lecturer(mockLecturer)
                .className("Class N5-A1")
                .semester("FA25")
                .build();

        // --- (SỬA) 4. Mock DTO Phản hồi chính ---
        mockResponse = ClassCourseRespone.builder()
                .id(10L)
                .className("Class N5-A1")
                .semester("FA25")
                .course(mockCourseResponse)   // <-- Sửa từ courseName
                .lecturer(mockLecturerResponse) // <-- Sửa từ lecturerName
                .build();

        // --- 5. Mock Student (Không đổi) ---
        mockStudent = User.builder().id("STU001").email("student@fpt.edu.vn").build();
        mockStudentClassId = new StudentClassId(mockStudent.getId(), mockClassCourse.getId());
    }

    // --- 1. Tests cho createClass ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/create_class_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản createClass")
    void createClass_Scenarios(String testName, Long courseId, String lecturerId, String className, String semester,
                               boolean mockCourseFound, boolean mockLecturerFound,
                               boolean expectException, String expectedErrorCodeString) {
        // Arrange
        ClassCourseRequest request = new ClassCourseRequest(null, className, semester, courseId, lecturerId);
        ClassCourse entityToMap = new ClassCourse(); // Mapper trả về
        entityToMap.setClassName(className);
        entityToMap.setSemester(semester);

        when(classCourseMapper.toClassCourse(request)).thenReturn(entityToMap);

        if (mockCourseFound) {
            when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
        } else {
            when(courseRepository.findById(courseId)).thenReturn(Optional.empty());
        }

        if (mockLecturerFound) {
            when(lecturerRepository.findById(lecturerId)).thenReturn(Optional.of(mockLecturer));
        } else {
            when(lecturerRepository.findById(lecturerId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> classCourseService.createClass(request));
            assertEquals(expectedErrorCode, e.getErrorCode());
            verify(classCourseRepository, never()).save(any());
        } else {
            // Kịch bản SUCCESS
            when(classCourseRepository.save(any(ClassCourse.class))).thenReturn(mockClassCourse);
            when(classCourseMapper.toClassCourseResponse(mockClassCourse)).thenReturn(mockResponse);

            ClassCourseRespone response = classCourseService.createClass(request);
            assertNotNull(response);

            ArgumentCaptor<ClassCourse> captor = ArgumentCaptor.forClass(ClassCourse.class);
            verify(classCourseRepository).save(captor.capture());
            assertEquals(mockCourse, captor.getValue().getCourse());
            assertEquals(mockLecturer, captor.getValue().getLecturer());
        }
    }

    // --- 2. Tests cho updateClass ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/update_class_scenarios.csv", numLinesToSkip = 1, nullValues = {""})
    @DisplayName("Data-driven: Kịch bản updateClass")
    void updateClass_Scenarios(String testName, Long classId, Long newCourseId, String newLecturerId,
                               boolean mockClassFound, boolean mockNewCourseFound, boolean mockNewLecturerFound,
                               boolean expectException, String expectedErrorCodeString) {
        // Arrange
        ClassCourseRequest request = new ClassCourseRequest(
                classId,         // 1. id (Long)
                "Updated Name",  // 2. className (String)
                "SP26",          // 3. semester (String)
                newCourseId,     // 4. courseId (Long)
                newLecturerId    // 5. lecturerId (String)
        );

        if (!mockClassFound) {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.empty());
        } else {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.of(mockClassCourse));
        }

        Course newCourse = Course.builder().id(newCourseId).build();
        Lecturer newLecturer = Lecturer.builder().id(newLecturerId).build();

        if (newCourseId != null) {
            when(courseRepository.findById(newCourseId)).thenReturn(mockNewCourseFound ? Optional.of(newCourse) : Optional.empty());
        }
        if (newLecturerId != null) {
            when(lecturerRepository.findById(newLecturerId)).thenReturn(mockNewLecturerFound ? Optional.of(newLecturer) : Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> classCourseService.updateClass(request));
            assertEquals(expectedErrorCode, e.getErrorCode());
            verify(classCourseRepository, never()).save(any());
        } else {
            // Kịch bản SUCCESS
            when(classCourseRepository.save(mockClassCourse)).thenReturn(mockClassCourse);
            when(classCourseMapper.toClassCourseResponse(mockClassCourse)).thenReturn(mockResponse);

            ClassCourseRespone response = classCourseService.updateClass(request);
            assertNotNull(response);
            verify(classCourseMapper).updateClass(mockClassCourse, request); // Kiểm tra mapper được gọi
            verify(classCourseRepository).save(mockClassCourse);
        }
    }

    // --- 3. Tests cho deleteClass ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/delete_class_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản deleteClass")
    void deleteClass_Scenarios(String testName, Long classId, boolean mockClassExists,
                               boolean expectException, String expectedErrorCodeString) {
        // Arrange
        when(classCourseRepository.existsById(classId)).thenReturn(mockClassExists);

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> classCourseService.deleteClass(classId));
            assertEquals(expectedErrorCode, e.getErrorCode());
            verify(classCourseRepository, never()).deleteById(any());
        } else {
            // Kịch bản SUCCESS
            doNothing().when(classCourseRepository).deleteById(classId);
            classCourseService.deleteClass(classId);
            verify(classCourseRepository, times(1)).deleteById(classId);
        }
    }

    // --- 4. Tests cho getAllClasses ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/get_all_classes_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getAllClasses")
    void getAllClasses_Scenarios(String testName, int repoReturnsSize) {
        // Arrange
        List<ClassCourse> list = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockClassCourse)
                .collect(Collectors.toList());
        when(classCourseRepository.findAll()).thenReturn(list);
        when(classCourseMapper.toClassCourseResponse(mockClassCourse)).thenReturn(mockResponse);

        // Act
        List<ClassCourseRespone> responses = classCourseService.getAllClasses();

        // Assert
        assertNotNull(responses);
        assertEquals(repoReturnsSize, responses.size());
        verify(classCourseMapper, times(repoReturnsSize)).toClassCourseResponse(any(ClassCourse.class));
    }

    // --- 5. Tests cho getClassById ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/get_class_by_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getClassById")
    void getClassById_Scenarios(String testName, Long classId, boolean mockClassFound,
                                boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockClassFound) {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.of(mockClassCourse));
        } else {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> classCourseService.getClassById(classId));
            assertEquals(expectedErrorCode, e.getErrorCode());
        } else {
            when(classCourseMapper.toClassCourseResponse(mockClassCourse)).thenReturn(mockResponse);
            ClassCourseRespone response = classCourseService.getClassById(classId);
            assertNotNull(response);
            assertEquals(mockResponse.getId(), response.getId());
        }
    }

    // --- 6. Tests cho getClassByCourseId ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/get_class_by_course_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getClassByCourseId")
    void getClassByCourseId_Scenarios(String testName, Long courseId, boolean mockClassFound,
                                      boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockClassFound) {
            when(classCourseRepository.findByCourseId(courseId)).thenReturn(Optional.of(mockClassCourse));
        } else {
            when(classCourseRepository.findByCourseId(courseId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> classCourseService.getClassByCourseId(courseId));
            assertEquals(expectedErrorCode, e.getErrorCode());
        } else {
            when(classCourseMapper.toClassCourseResponse(mockClassCourse)).thenReturn(mockResponse);
            ClassCourseRespone response = classCourseService.getClassByCourseId(courseId);
            assertNotNull(response);
        }
    }

    // --- 7. Tests cho getClassByLecturerId ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/get_class_by_lecturer_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getClassByLecturerId")
    void getClassByLecturerId_Scenarios(String testName, int repoReturnsSize) {
        // Arrange
        String lecturerId = "LEC001";
        List<ClassCourse> list = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockClassCourse)
                .collect(Collectors.toList());
        List<ClassCourseRespone> dtoList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockResponse)
                .collect(Collectors.toList());

        when(classCourseRepository.findByLecturerId(lecturerId)).thenReturn(list);
        when(classCourseMapper.toClassCourseResponses(list)).thenReturn(dtoList);

        // Act
        List<ClassCourseRespone> responses = classCourseService.getClassByLecturerId(lecturerId);

        // Assert
        assertNotNull(responses);
        assertEquals(repoReturnsSize, responses.size());
        verify(classCourseMapper, times(1)).toClassCourseResponses(list);
    }

    // --- 8. Tests cho getStudentsByClassId ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/get_students_by_class_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getStudentsByClassId")
    void getStudentsByClassId_Scenarios(String testName, Long classId, boolean mockClassFound,
                                        int repoReturnsSize, boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (!mockClassFound) {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.empty());
        } else {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.of(mockClassCourse));
        }

        List<StudentClass> list = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> new StudentClass())
                .collect(Collectors.toList());
        List<StudentClassResponse> dtoList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> new StudentClassResponse())
                .collect(Collectors.toList());

        when(studentClassRepository.findByIdClassCourseId(classId)).thenReturn(list);
        when(studentClassMapper.toStudentClassResponses(list)).thenReturn(dtoList);

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> classCourseService.getStudentsByClassId(classId));
            assertEquals(expectedErrorCode, e.getErrorCode());
            verify(studentClassRepository, never()).findByIdClassCourseId(anyLong());
        } else {
            List<StudentClassResponse> responses = classCourseService.getStudentsByClassId(classId);
            assertNotNull(responses);
            assertEquals(repoReturnsSize, responses.size());
        }
    }

    // --- 9. Tests cho addStudentToClass ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/add_student_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản addStudentToClass")
    void addStudentToClass_Scenarios(String testName, Long classId, String studentId,
                                     boolean mockClassFound, boolean mockStudentFound,
                                     boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockClassFound) {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.of(mockClassCourse));
        } else {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.empty());
        }

        if (mockStudentFound) {
            when(userRepository.findById(studentId)).thenReturn(Optional.of(mockStudent));
        } else {
            when(userRepository.findById(studentId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> classCourseService.addStudentToClass(classId, studentId));
            assertEquals(expectedErrorCode, e.getErrorCode());
            verify(studentClassRepository, never()).save(any());
        } else {
            // Kịch bản SUCCESS
            classCourseService.addStudentToClass(classId, studentId);

            ArgumentCaptor<StudentClass> captor = ArgumentCaptor.forClass(StudentClass.class);
            verify(studentClassRepository).save(captor.capture());

            assertEquals(mockStudent, captor.getValue().getStudent());
            assertEquals(mockClassCourse, captor.getValue().getClassCourse());
            assertNotNull(captor.getValue().getEnrollDate());
        }
    }

    // --- 10. Tests cho removeStudentOutClass ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/remove_student_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản removeStudentOutClass")
    void removeStudentOutClass_Scenarios(String testName, Long classId, String studentId,
                                         boolean mockClassFound, boolean mockStudentFound,
                                         boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockClassFound) {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.of(mockClassCourse));
        } else {
            when(classCourseRepository.findById(classId)).thenReturn(Optional.empty());
        }

        if (mockStudentFound) {
            when(userRepository.findById(studentId)).thenReturn(Optional.of(mockStudent));
        } else {
            when(userRepository.findById(studentId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> classCourseService.removeStudentOutClass(classId, studentId));
            assertEquals(expectedErrorCode, e.getErrorCode());
            verify(studentClassRepository, never()).deleteById(any());
        } else {
            // Kịch bản SUCCESS
            doNothing().when(studentClassRepository).deleteById(mockStudentClassId);
            classCourseService.removeStudentOutClass(classId, studentId);
            verify(studentClassRepository, times(1)).deleteById(mockStudentClassId);
        }
    }

    // --- 11. Tests cho getMaterialsByClassId ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/class-course/get_materials_by_class_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getMaterialsByClassId")
    void getMaterialsByClassId_Scenarios(String testName, Long classId, int repoReturnsSize) {
        // Arrange
        List<ClassMaterial> list = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> new ClassMaterial())
                .collect(Collectors.toList());
        List<ClassMaterialResponse> dtoList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> new ClassMaterialResponse())
                .collect(Collectors.toList());

        when(classMaterialRepository.findByClassCourseId(classId)).thenReturn(list);
        when(classMaterialMapper.toClassMaterialResponses(list)).thenReturn(dtoList);

        // Act
        List<ClassMaterialResponse> responses = classCourseService.getMaterialsByClassId(classId);

        // Assert
        assertNotNull(responses);
        assertEquals(repoReturnsSize, responses.size());
        verify(classMaterialMapper, times(1)).toClassMaterialResponses(list);
    }
}