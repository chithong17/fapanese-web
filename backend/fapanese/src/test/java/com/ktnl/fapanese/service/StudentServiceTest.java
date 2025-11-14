package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.CreateStudentRequest;
import com.ktnl.fapanese.dto.response.CreateStudentAccountResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.Role;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mail.AccountCreatedEmailTemplate;
import com.ktnl.fapanese.mapper.UserMapper;
import com.ktnl.fapanese.repository.RoleRepository;
import com.ktnl.fapanese.repository.UserRepository;
import com.ktnl.fapanese.service.implementations.EmailService;
import com.ktnl.fapanese.service.implementations.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class StudentServiceTest {

    @Mock
    UserRepository userRepo;
    @Mock
    RoleRepository roleRepo;
    @Mock
    UserMapper mapper;
    @Mock
    PasswordEncoder passwordEncoder;
    @Mock
    EmailService emailService;

    @InjectMocks
    StudentService studentService;

    // @Spy
    // @InjectMocks
    // StudentService studentServiceSpy; // Dùng cho test createStudentAccountList

    @Captor
    ArgumentCaptor<User> userArgumentCaptor;
    @Captor
    ArgumentCaptor<String> passwordCaptor;

    // Dummy data
    private User studentUser;
    private User teacherUser;
    private Student dummyStudent;
    private Role studentRole;
    private Role teacherRole;
    private CreateStudentRequest dummyRequest;
    private UserResponse dummyResponse;
    private CreateStudentAccountResponse dummyCreateResponse;

    @BeforeEach
    void setUp() {
        // --- Roles ---
        studentRole = new Role();
        studentRole.setRoleName("STUDENT");
        teacherRole = new Role();
        teacherRole.setRoleName("TEACHER");

        // --- User/Student (STUDENT) ---
        studentUser = new User();
        studentUser.setEmail("student@test.com");
        studentUser.setRoles(Set.of(studentRole));
        dummyStudent = new Student();
        dummyStudent.setFirstName("Student");
        dummyStudent.setUser(studentUser);
        studentUser.setStudent(dummyStudent);

        // --- User (TEACHER) ---
        teacherUser = new User();
        teacherUser.setEmail("teacher@test.com");
        teacherUser.setRoles(Set.of(teacherRole));

        // --- DTOs ---
        dummyRequest = new CreateStudentRequest();
        dummyRequest.setEmail("new@test.com");
        dummyRequest.setFirstName("New");
        dummyRequest.setLastName("Student");

        dummyResponse = new UserResponse();
        dummyResponse.setEmail("student@test.com");

        dummyCreateResponse = new CreateStudentAccountResponse();

        // --- Basic Mocks ---
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password_abc123");
        when(roleRepo.findByRoleName("STUDENT")).thenReturn(studentRole);

        // SỬA LỖI 1: Tách 2 dòng
        when(emailService.sendEmail(anyString(), any(AccountCreatedEmailTemplate.class), anyString(), anyString())).thenReturn(null);
        when(mapper.toUserResponse(any(User.class))).thenReturn(dummyResponse);

        // SỬA LỖI 2: THÊM DÒNG QUAN TRỌNG NÀY
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    // ============================================================
    // 1. createStudentAccount
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/student/create_student.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: createStudentAccount")
    void createStudentAccount_Scenarios(
            String testName,
            String email,
            boolean emailExists,
            boolean expectException,
            String expectedError
    ) {
        // 1. --- ARRANGE ---
        CreateStudentRequest request = new CreateStudentRequest();
        request.setEmail(email);

        if (emailExists) {
            when(userRepo.findByEmail(email)).thenReturn(Optional.of(studentUser));
        } else {
            when(userRepo.findByEmail(email)).thenReturn(Optional.empty());
        }

        User userFromMapper = new User();
        userFromMapper.setEmail(request.getEmail());
        when(mapper.toUser(request)).thenReturn(userFromMapper);
        when(mapper.toStudent(request)).thenReturn(new Student());
        when(mapper.toStudentRegisterRequest(request)).thenReturn(dummyCreateResponse);

        // 2. --- ACT & ASSERT ---
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> studentService.createStudentAccount(request));
            assertEquals(code, ex.getErrorCode());
            verify(userRepo, never()).save(any());
            verify(emailService, never()).sendEmail(anyString(), any(), anyString(), anyString());
        } else {
            CreateStudentAccountResponse result = studentService.createStudentAccount(request);

            assertNotNull(result);

            // Verify user properties được set đúng
            verify(userRepo, times(1)).save(userArgumentCaptor.capture());
            User savedUser = userArgumentCaptor.getValue();
            assertEquals("hashed_password_abc123", savedUser.getPassword_hash());
            assertTrue(savedUser.getRoles().contains(studentRole));
            assertEquals(0, savedUser.getStatus());
            assertNotNull(savedUser.getStudent());
            assertNotNull(savedUser.getStudent().getUser());

            // Verify email được gửi
            verify(emailService, times(1)).sendEmail(eq(email), any(), eq(email), passwordCaptor.capture());
            assertEquals(8, passwordCaptor.getValue().length());
        }
    }

    // ============================================================
    // 2. createStudentAccountList (Dùng @Test thường + Spy)
    // ============================================================

    @Spy
    @InjectMocks
    StudentService studentServiceSpy; // Dùng Spy để test hàm này

    @Test
    @DisplayName("createStudentAccountList - Success")
    void createStudentAccountList_Success() {
        // 1. --- ARRANGE ---
        CreateStudentRequest req1 = new CreateStudentRequest();
        req1.setEmail("e1@test.com");
        CreateStudentRequest req2 = new CreateStudentRequest();
        req2.setEmail("e2@test.com");
        List<CreateStudentRequest> list = List.of(req1, req2);

        // Giả lập hàm createStudentAccount (vì nó đã được test riêng)
        doReturn(dummyCreateResponse).when(studentServiceSpy).createStudentAccount(any(CreateStudentRequest.class));

        // 2. --- ACT ---
        boolean result = studentServiceSpy.createStudentAccountList(list);

        // 3. --- ASSERT ---
        assertTrue(result);
        // Verify hàm createStudentAccount được gọi 2 lần
        verify(studentServiceSpy, times(2)).createStudentAccount(any(CreateStudentRequest.class));
    }

    @Test
    @DisplayName("createStudentAccountList - Fail on second student")
    void createStudentAccountList_Fail() {
        // 1. --- ARRANGE ---
        CreateStudentRequest req1 = new CreateStudentRequest();
        req1.setEmail("e1@test.com");
        CreateStudentRequest reqFail = new CreateStudentRequest(); // Request này sẽ fail
        reqFail.setEmail("fail@test.com");
        List<CreateStudentRequest> list = List.of(req1, reqFail);

        // Giả lập:
        // - Lần 1 (req1) thành công
        doReturn(dummyCreateResponse).when(studentServiceSpy).createStudentAccount(req1);
        // - Lần 2 (reqFail) ném lỗi
        doThrow(new AppException(ErrorCode.EMAIL_EXISTED)).when(studentServiceSpy).createStudentAccount(reqFail);

        // 2. --- ACT & ASSERT ---
        AppException ex = assertThrows(AppException.class,
                () -> studentServiceSpy.createStudentAccountList(list));

        assertEquals(ErrorCode.EMAIL_EXISTED, ex.getErrorCode());

        // Verify hàm createStudentAccount chỉ được gọi 2 lần (lần 1 thành công, lần 2 fail)
        verify(studentServiceSpy, times(1)).createStudentAccount(req1);
        verify(studentServiceSpy, times(1)).createStudentAccount(reqFail);
    }

    @Test
    @DisplayName("createStudentAccountList - Empty List")
    void createStudentAccountList_Empty() {
        List<CreateStudentRequest> list = Collections.emptyList();
        boolean result = studentServiceSpy.createStudentAccountList(list);
        assertTrue(result);
        verify(studentServiceSpy, never()).createStudentAccount(any());
    }

    // ============================================================
    // 3. getAllStudent
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/student/get_all_students.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getAllStudent")
    void getAllStudent_Scenarios(String testName, int repoSize) {
        List<User> userList = IntStream.range(0, repoSize)
                .mapToObj(i -> studentUser)
                .collect(Collectors.toList());
        when(userRepo.findByRoles_RoleName("STUDENT")).thenReturn(userList);

        List<UserResponse> result = studentService.getAllStudent();

        assertNotNull(result);
        assertEquals(repoSize, result.size());
        verify(mapper, times(repoSize)).toUserResponse(any(User.class));
    }

    // ============================================================
    // 4. getStudentByEmail
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/student/get_student_by_email.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getStudentByEmail")
    void getStudentByEmail_Scenarios(
            String testName,
            String email,
            String userToFind, // "STUDENT_USER", "TEACHER_USER", "NOT_FOUND"
            boolean expectException,
            String expectedError
    ) {
        // 1. --- ARRANGE ---
        mockFindByEmail(email, userToFind);

        // 2. --- ACT & ASSERT ---
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> studentService.getStudentByEmail(email));
            assertEquals(code, ex.getErrorCode());
        } else {
            UserResponse result = studentService.getStudentByEmail(email);
            assertNotNull(result);
            assertEquals(dummyResponse.getEmail(), result.getEmail());
        }
    }

    // ============================================================
    // 5. updateStudent
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/student/update_student.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: updateStudent")
    void updateStudent_Scenarios(
            String testName,
            String email,
            String userToFind, // "STUDENT_USER", "TEACHER_USER", "NOT_FOUND"
            boolean expectException,
            String expectedError
    ) {
        // 1. --- ARRANGE ---
        mockFindByEmail(email, userToFind);

        CreateStudentRequest updateRequest = new CreateStudentRequest();
        updateRequest.setFirstName("UpdatedFirstName");
        updateRequest.setLastName("UpdatedLastName");
        updateRequest.setCampus("UpdatedCampus");
        // updateRequest.setDateOfBirth(...); // (bỏ qua cho đơn giản)

        // 2. --- ACT & ASSERT ---
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> studentService.updateStudent(email, updateRequest));
            assertEquals(code, ex.getErrorCode());
            verify(userRepo, never()).save(any());
        } else {
            UserResponse result = studentService.updateStudent(email, updateRequest);

            assertNotNull(result);

            // Verify save được gọi
            verify(userRepo, times(1)).save(userArgumentCaptor.capture());
            User savedUser = userArgumentCaptor.getValue();

            // Verify data được cập nhật đúng
            assertEquals("UpdatedFirstName", savedUser.getStudent().getFirstName());
            assertEquals("UpdatedLastName", savedUser.getStudent().getLastName());
            assertEquals("UpdatedCampus", savedUser.getStudent().getCampus());
        }
    }

    // ============================================================
    // 6. deleteStudent
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/student/delete_student.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: deleteStudent")
    void deleteStudent_Scenarios(
            String testName,
            String email,
            String userToFind, // "STUDENT_USER", "TEACHER_USER", "NOT_FOUND"
            boolean expectException,
            String expectedError
    ) {
        // 1. --- ARRANGE ---
        User userToOperateOn = mockFindByEmail(email, userToFind);

        // 2. --- ACT & ASSERT ---
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> studentService.deleteStudent(email));
            assertEquals(code, ex.getErrorCode());
            verify(userRepo, never()).delete(any());
        } else {
            studentService.deleteStudent(email);
            // Verify đúng user đã bị xóa
            verify(userRepo, times(1)).delete(userToOperateOn);
        }
    }

    // ============================================================
    // Helper Method
    // ============================================================
    private User mockFindByEmail(String email, String userToFind) {
        switch (userToFind) {
            case "STUDENT_USER":
                when(userRepo.findByEmail(email)).thenReturn(Optional.of(studentUser));
                return studentUser;
            case "TEACHER_USER":
                when(userRepo.findByEmail(email)).thenReturn(Optional.of(teacherUser));
                return teacherUser;
            case "NOT_FOUND":
            default:
                when(userRepo.findByEmail(email)).thenReturn(Optional.empty());
                return null;
        }
    }
}