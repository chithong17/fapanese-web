package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.entity.*;
import com.ktnl.fapanese.mapper.ClassCourseMapper;
import com.ktnl.fapanese.repository.StudentClassRepository;
import com.ktnl.fapanese.service.implementations.StudentClassService;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class StudentClassServiceTest {

    @Mock
    StudentClassRepository studentClassRepository;

    @Mock
    ClassCourseMapper classCourseMapper;

    @InjectMocks
    StudentClassService studentClassService;

    // Dummy data
    private User dummyStudent;
    private ClassCourse dummyClass1;
    private ClassCourse dummyClass2;
    private StudentClass dummyEnrollment1;
    private StudentClass dummyEnrollment2;
    private ClassCourseRespone dummyResponse1;
    private ClassCourseRespone dummyResponse2;

    @BeforeEach
    void setUp() {
        // --- Entities ---
        dummyStudent = new User();
        dummyStudent.setId("student1"); // Giả sử ID sinh viên là String

        dummyClass1 = new ClassCourse();
        dummyClass1.setId(1L);
        dummyClass1.setClassName("N5 Class");

        dummyClass2 = new ClassCourse();
        dummyClass2.setId(2L);
        dummyClass2.setClassName("N4 Class");

        // --- Composite Keys (StudentClassId) ---
        StudentClassId id1 = new StudentClassId();
        id1.setStudentId(dummyStudent.getId()); // <-- ĐÃ SỬA LỖI 1
        id1.setClassCourseId(dummyClass1.getId());

        StudentClassId id2 = new StudentClassId();
        id2.setStudentId(dummyStudent.getId());
        id2.setClassCourseId(dummyClass2.getId());

        // --- Enrollments (StudentClass) ---
        dummyEnrollment1 = new StudentClass();
        dummyEnrollment1.setId(id1);
        dummyEnrollment1.setStudent(dummyStudent);
        dummyEnrollment1.setClassCourse(dummyClass1);

        dummyEnrollment2 = new StudentClass();
        dummyEnrollment2.setId(id2);
        dummyEnrollment2.setStudent(dummyStudent);
        dummyEnrollment2.setClassCourse(dummyClass2);

        // --- DTOs ---
        dummyResponse1 = new ClassCourseRespone();
        dummyResponse1.setId(1L);

        dummyResponse2 = new ClassCourseRespone();
        dummyResponse2.setId(2L);
    }

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/studentclass/get_classes_by_student.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getClassesByStudent")
    void getClassesByStudent_Scenarios(
            String testName,
            String studentId,
            int repoListSize,
            boolean hasDuplicates, // Biến này vẫn được đọc từ CSV, nhưng không dùng trong logic
            int expectedMapperInputSize,
            int expectedFinalListSize
    ) {
        // 1. --- ARRANGE: Mock Repository ---
        List<StudentClass> mockEnrollments;
        if (repoListSize == 0) {
            mockEnrollments = Collections.emptyList();
        } else {
            // <-- ĐÃ SỬA LỖI 2 (xóa khối if/else)
            // VD: 2 enrollments -> [Class1, Class2]
            mockEnrollments = List.of(dummyEnrollment1, dummyEnrollment2);
        }
        when(studentClassRepository.findByStudent_Id(studentId)).thenReturn(mockEnrollments);

        // 2. --- ARRANGE: Mock Mapper ---
        List<ClassCourseRespone> mockResponseList;
        if (expectedFinalListSize == 0) {
            mockResponseList = Collections.emptyList();
        } else {
            // Mapper sẽ nhận list đã .distinct()
            mockResponseList = List.of(dummyResponse1, dummyResponse2);
        }

        ArgumentCaptor<List<ClassCourse>> mapperInputCaptor = ArgumentCaptor.forClass(List.class);
        when(classCourseMapper.toClassCourseResponses(mapperInputCaptor.capture())).thenReturn(mockResponseList);

        // 3. --- ACT ---
        List<ClassCourseRespone> result = studentClassService.getClassesByStudent(studentId);

        // 4. --- ASSERT ---
        assertNotNull(result);
        assertEquals(expectedFinalListSize, result.size());

        verify(studentClassRepository, times(1)).findByStudent_Id(studentId);
        verify(classCourseMapper, times(1)).toClassCourseResponses(anyList());

        // Verify logic .distinct()
        List<ClassCourse> capturedList = mapperInputCaptor.getValue();
        assertEquals(expectedMapperInputSize, capturedList.size());
    }
}
