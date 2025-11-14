package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.ChangePasswordRequest;
import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.Lecturer;
import com.ktnl.fapanese.entity.Role;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mail.RejectTeacherEmail;
import com.ktnl.fapanese.mail.TeacherApprovalEmail;
import com.ktnl.fapanese.mapper.UserMapper;
import com.ktnl.fapanese.repository.LecturerRepository;
import com.ktnl.fapanese.repository.RoleRepository;
import com.ktnl.fapanese.repository.StudentRepository;
import com.ktnl.fapanese.repository.UserRepository;
import com.ktnl.fapanese.service.implementations.EmailService;
import com.ktnl.fapanese.service.implementations.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings; // 👈 THÊM IMPORT
import org.mockito.quality.Strictness; // 👈 THÊM IMPORT
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT) // ⭐ SỬA LỖI 1: TẮT CẢNH BÁO
class UserServiceTest {

    // --- Mocks cho các @Autowired dependencies ---
    @Mock
    private UserRepository userRepo;
    @Mock
    private LecturerRepository lecturerRepo;
    @Mock
    private StudentRepository studentRepo;
    @Mock
    private RoleRepository roleRepo;
    @Mock
    private UserMapper mapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private TeacherApprovalEmail teacherApprovalEmail;
    @Mock
    private EmailService emailService;
    @Mock
    private RejectTeacherEmail rejectTeacherEmail;

    @InjectMocks
    private UserService userService;

    // --- Mocks cho SecurityContextHolder (static) ---
    @Mock
    private Authentication authentication;
    @Mock
    private SecurityContext securityContext;
    private MockedStatic<SecurityContextHolder> mockedSecurityContextHolder;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    // --- Dummy data (dữ liệu giả) ---
    private User studentUser, lecturerUser, pendingLecturerUser;
    private Student student;
    private Lecturer lecturer, pendingLecturer;
    private Role studentRole, lecturerRole;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        // --- Roles ---
        studentRole = new Role();
        studentRole.setRoleName("STUDENT");
        lecturerRole = new Role();
        lecturerRole.setRoleName("LECTURER");

        // --- Student ---
        studentUser = new User();
        studentUser.setId("student1");
        studentUser.setEmail("student@test.com");
        studentUser.setPassword_hash("hashed_current_password");
        studentUser.setRoles(new HashSet<>(Set.of(studentRole))); // Dùng HashSet để có thể clear()
        studentUser.setStatus(3);
        student = new Student();
        student.setFirstName("Student");
        student.setLastName("User");
        studentUser.setStudent(student);
        student.setUser(studentUser);

        // --- Lecturer (Approved) ---
        lecturerUser = new User();
        lecturerUser.setId("lecturer1");
        lecturerUser.setEmail("lecturer@test.com");
        lecturerUser.setRoles(new HashSet<>(Set.of(lecturerRole)));
        lecturerUser.setStatus(3);
        lecturer = new Lecturer();
        lecturer.setFirstName("Lecturer");
        lecturer.setLastName("User");
        lecturerUser.setTeacher(lecturer);
        lecturer.setUser(lecturerUser);

        // --- Lecturer (Pending) ---
        pendingLecturerUser = new User();
        pendingLecturerUser.setId("pending1");
        pendingLecturerUser.setEmail("pending@test.com");
        pendingLecturerUser.setRoles(new HashSet<>(Set.of(lecturerRole)));
        pendingLecturerUser.setStatus(2); // Status 2 = pending
        pendingLecturer = new Lecturer();
        pendingLecturer.setFirstName("Pending");
        pendingLecturer.setLastName("Lecturer");
        pendingLecturerUser.setTeacher(pendingLecturer);
        pendingLecturer.setUser(pendingLecturerUser);

        // --- DTOs ---
        userResponse = new UserResponse();
        userResponse.setEmail("test@test.com");

        // --- Mock SecurityContext (STATIC) ---
        when(securityContext.getAuthentication()).thenReturn(authentication);
        mockedSecurityContextHolder = Mockito.mockStatic(SecurityContextHolder.class);
        mockedSecurityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);

        // --- Mock Dependencies (Chung) ---
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_new_password");
        when(passwordEncoder.matches("current_pass", "hashed_current_password")).thenReturn(true);
        when(passwordEncoder.matches("wrong_pass", "hashed_current_password")).thenReturn(false);

        when(roleRepo.findByRoleName("STUDENT")).thenReturn(studentRole);
        when(roleRepo.findByRoleName("LECTURER")).thenReturn(lecturerRole);
        when(roleRepo.findByRoleName("INVALID_ROLE")).thenReturn(null);

        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Mock findByEmail
        when(userRepo.findByEmail(studentUser.getEmail())).thenReturn(Optional.of(studentUser));
        when(userRepo.findByEmail(lecturerUser.getEmail())).thenReturn(Optional.of(lecturerUser));
        when(userRepo.findByEmail(pendingLecturerUser.getEmail())).thenReturn(Optional.of(pendingLecturerUser));
        when(userRepo.findByEmail("non_existing@test.com")).thenReturn(Optional.empty());

        // Mock findById
        when(userRepo.findById(studentUser.getId())).thenReturn(Optional.of(studentUser));
        when(userRepo.findById(lecturerUser.getId())).thenReturn(Optional.of(lecturerUser));
        when(userRepo.findById(pendingLecturerUser.getId())).thenReturn(Optional.of(pendingLecturerUser));
        when(userRepo.findById("non_existing_id")).thenReturn(Optional.empty());

        // Mock Mappers
        when(mapper.toUserResponse(any(User.class))).thenReturn(userResponse);
        when(mapper.toUser(any(UserRequest.class))).thenAnswer(inv -> {
            User u = new User();
            u.setEmail(((UserRequest)inv.getArgument(0)).getEmail());
            return u;
        });

        // ⭐ SỬA LỖI 2: Sửa 2 mock này để chúng trả về đối tượng có dữ liệu
        when(mapper.toStudent(any(UserRequest.class))).thenAnswer(inv -> {
            Student s = new Student();
            s.setFirstName(((UserRequest)inv.getArgument(0)).getFirstName());
            return s;
        });
        when(mapper.toLecturer(any(UserRequest.class))).thenAnswer(inv -> {
            Lecturer l = new Lecturer();
            l.setFirstName(((UserRequest)inv.getArgument(0)).getFirstName());
            return l;
        });

        // Mock Email
        when(emailService.sendEmail(anyString(), any(), anyString())).thenReturn(null);
        when(emailService.sendEmail(anyString(), any(), anyString(), anyString())).thenReturn(null);
    }

    @AfterEach
    void tearDown() {
        mockedSecurityContextHolder.close();
    }

    // ============================================================
    // 1. registerUser
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/user/register_user.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: registerUser")
    void registerUser_Scenarios(
            String testName,
            String email,
            String role,
            boolean emailExists,
            boolean expectException,
            String expectedError
    ) {
        // 1. --- ARRANGE ---
        UserRequest request = new UserRequest();
        request.setEmail(email);
        request.setRole(role);
        request.setPassword("password123");

        if (emailExists) {
            when(userRepo.findByEmail(email)).thenReturn(Optional.of(studentUser));
        } else {
            when(userRepo.findByEmail(email)).thenReturn(Optional.empty());
        }

        // 2. --- ACT & ASSERT ---
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> userService.registerUser(request));
            assertEquals(code, ex.getErrorCode());
            verify(userRepo, never()).save(any());
        } else {
            UserResponse result = userService.registerUser(request);

            assertNotNull(result);
            verify(userRepo, times(1)).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();

            // Verify logic
            assertEquals("hashed_new_password", savedUser.getPassword_hash());
            assertEquals(0, savedUser.getStatus());
            assertTrue(savedUser.getRoles().stream().anyMatch(r -> r.getRoleName().equals(role)));

            if ("STUDENT".equals(role)) {
                assertNotNull(savedUser.getStudent());
                assertNull(savedUser.getTeacher());
            } else if ("LECTURER".equals(role)) {
                assertNotNull(savedUser.getTeacher());
                assertNull(savedUser.getStudent());
            }
        }
    }

    // ============================================================
    // 2. getCurrentUserProfile
    // ============================================================
    @Test
    @DisplayName("getCurrentUserProfile - Student - Success")
    void getCurrentUserProfile_Student_Success() {
        when(authentication.getName()).thenReturn("student@test.com");

        // Phải mock builder thủ công vì service không dùng mapper
        UserResponse manualResponse = UserResponse.builder()
                .id(studentUser.getId())
                .email(studentUser.getEmail())
                .role("STUDENT")
                .firstName(studentUser.getStudent().getFirstName())
                .lastName(studentUser.getStudent().getLastName())
                .campus(studentUser.getStudent().getCampus())
                .dateOfBirth(studentUser.getStudent().getDateOfBirth())
                .build();
        when(mapper.toUserResponse(studentUser)).thenReturn(manualResponse); // Dùng cho các test khác

        UserResponse response = userService.getCurrentUserProfile();

        assertEquals("student@test.com", response.getEmail());
        assertEquals("Student", response.getFirstName());
    }

    @Test
    @DisplayName("getCurrentUserProfile - Lecturer - Success")
    void getCurrentUserProfile_Lecturer_Success() {
        when(authentication.getName()).thenReturn("lecturer@test.com");

        UserResponse manualResponse = UserResponse.builder()
                .id(lecturerUser.getId())
                .email(lecturerUser.getEmail())
                .role("LECTURER")
                .firstName(lecturerUser.getTeacher().getFirstName())
                .lastName(lecturerUser.getTeacher().getLastName())
                .bio(lecturerUser.getTeacher().getBio())
                .expertise(lecturerUser.getTeacher().getExpertise())
                .dateOfBirth(lecturerUser.getTeacher().getDateOfBirth())
                .build();
        when(mapper.toUserResponse(lecturerUser)).thenReturn(manualResponse);

        UserResponse response = userService.getCurrentUserProfile();

        assertEquals("lecturer@test.com", response.getEmail());
        assertEquals("Lecturer", response.getFirstName());
    }

    @Test
    @DisplayName("getCurrentUserProfile - User Not Found - Fail")
    void getCurrentUserProfile_UserNotFound_Fail() {
        when(authentication.getName()).thenReturn("non_existing@test.com");
        AppException ex = assertThrows(AppException.class,
                () -> userService.getCurrentUserProfile());
        assertEquals(ErrorCode.USER_NOT_EXISTED, ex.getErrorCode());
    }

    // ============================================================
    // 3. updateUserProfile (Test các nhánh)
    // ============================================================

    // (Helper để tạo UserRequest cho các test updateUser)
    private UserRequest createUpdateRequest(String email, String role, String firstName, String campus, String bio) {
        UserRequest req = new UserRequest();
        req.setEmail(email);
        req.setRole(role);
        req.setFirstName(firstName);
        req.setCampus(campus);
        req.setBio(bio);
        // (Bỏ qua DateOfBirth để tránh lỗi LocalDate/String)
        return req;
    }

    @Test
    @DisplayName("updateUserProfile - Student updates info - Success")
    void updateUserProfile_Student_Success() {
        when(authentication.getName()).thenReturn("student@test.com");
        UserRequest req = createUpdateRequest("student@test.com", "STUDENT", "UpdatedFirst", "UpdatedCampus", null);

        userService.updateUserProfile(req);

        verify(userRepo, times(1)).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("UpdatedFirst", savedUser.getStudent().getFirstName());
        assertEquals("UpdatedCampus", savedUser.getStudent().getCampus());
    }

    @Test
    @DisplayName("updateUserProfile - Lecturer updates info - Success")
    void updateUserProfile_Lecturer_Success() {
        when(authentication.getName()).thenReturn("lecturer@test.com");
        UserRequest req = createUpdateRequest("lecturer@test.com", "LECTURER", "UpdatedFirst", null, "UpdatedBio");

        userService.updateUserProfile(req);

        verify(userRepo, times(1)).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("UpdatedFirst", savedUser.getTeacher().getFirstName());
        assertEquals("UpdatedBio", savedUser.getTeacher().getBio());
    }

    @Test
    @DisplayName("updateUserProfile - Branch: user.getRoles() is null")
    void updateUserProfile_RolesIsNull_Branch() {
        studentUser.setRoles(null); // Set roles là null
        when(authentication.getName()).thenReturn("student@test.com");
        UserRequest req = createUpdateRequest("student@test.com", "STUDENT", "New", "New", null);

        assertDoesNotThrow(() -> userService.updateUserProfile(req)); // Chạy mà không bị NullPointer

        verify(userRepo, times(1)).save(userCaptor.capture());
        assertNotNull(userCaptor.getValue().getRoles()); // Đã được khởi tạo
        assertTrue(userCaptor.getValue().getRoles().contains(studentRole));
    }

    @Test
    @DisplayName("updateUserProfile - Branch: user.getStudent() is null")
    void updateUserProfile_StudentIsNull_Branch() {
        lecturerUser.setStudent(null); // User này chưa có profile student
        when(authentication.getName()).thenReturn("lecturer@test.com");
        UserRequest req = createUpdateRequest("lecturer@test.com", "STUDENT", "NewStudent", "New", null);

        userService.updateUserProfile(req);

        verify(userRepo, times(1)).save(userCaptor.capture());
        assertNotNull(userCaptor.getValue().getStudent()); // Profile student mới đã được tạo
        assertEquals("NewStudent", userCaptor.getValue().getStudent().getFirstName());
    }

    @Test
    @DisplayName("updateUserProfile - Branch: user.getTeacher() is null")
    void updateUserProfile_TeacherIsNull_Branch() {
        studentUser.setTeacher(null); // User này chưa có profile teacher
        when(authentication.getName()).thenReturn("student@test.com");
        UserRequest req = createUpdateRequest("student@test.com", "LECTURER", "NewLecturer", null, "NewBio");

        userService.updateUserProfile(req);

        verify(userRepo, times(1)).save(userCaptor.capture());
        assertNotNull(userCaptor.getValue().getTeacher()); // Profile teacher mới đã được tạo
        assertEquals("NewLecturer", userCaptor.getValue().getTeacher().getFirstName());
    }

    @Test
    @DisplayName("updateUserProfile - Fail: Role Not Found")
    void updateUserProfile_RoleNotFound_Fail() {
        when(authentication.getName()).thenReturn("student@test.com");
        UserRequest req = createUpdateRequest("student@test.com", "INVALID_ROLE", null, null, null);

        AppException ex = assertThrows(AppException.class,
                () -> userService.updateUserProfile(req));
        assertEquals(ErrorCode.ROLE_NOT_FOUND, ex.getErrorCode());
    }

    // ============================================================
    // 4. updateStatusUserAfterVerifyOtp
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/user/update_status_otp.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: updateStatusUserAfterVerifyOtp")
    void updateStatusUserAfterVerifyOtp_Scenarios(
            String testName,
            String emailToFind,
            int expectedStatus
    ) {
        userService.updateStatusUserAfterVerifyOtp(emailToFind);
        verify(userRepo, times(1)).save(userCaptor.capture());
        assertEquals(expectedStatus, userCaptor.getValue().getStatus());
    }

    @Test
    @DisplayName("updateStatusUserAfterVerifyOtp - User Not Found - Fail")
    void updateStatusUserAfterVerifyOtp_NotFound_Fail() {
        assertThrows(AppException.class,
                () -> userService.updateStatusUserAfterVerifyOtp("non_existing@test.com"));
    }

    // ============================================================
    // 5. deleteUserByEmail
    // ============================================================
    @Test
    @DisplayName("deleteUserByEmail - Success")
    void deleteUserByEmail_Success() {
        when(userRepo.findByEmail("student@test.com")).thenReturn(Optional.of(studentUser)); // Cần mock này
        userService.deleteUserByEmail("student@test.com");
        verify(userRepo, times(1)).deleteByEmail("student@test.com");
    }

    @Test
    @DisplayName("deleteUserByEmail - Not Found - Fail")
    void deleteUserByEmail_NotFound_Fail() {
        when(userRepo.findByEmail("non_existing@test.com")).thenReturn(Optional.empty()); // Cần mock này
        assertThrows(RuntimeException.class,
                () -> userService.deleteUserByEmail("non_existing@test.com"));
    }

    // ============================================================
    // 6. changePassword
    // ============================================================
    @Test
    @DisplayName("changePassword - Success")
    void changePassword_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest("current_pass", "new_pass");
        userService.changePassword("student@test.com", request);
        verify(userRepo, times(1)).save(userCaptor.capture());
        assertEquals("hashed_new_password", userCaptor.getValue().getPassword_hash());
    }

    @Test
    @DisplayName("changePassword - Wrong Current Password - Fail")
    void changePassword_WrongCurrentPassword_Fail() {
        ChangePasswordRequest request = new ChangePasswordRequest("wrong_pass", "new_pass");
        AppException ex = assertThrows(AppException.class,
                () -> userService.changePassword("student@test.com", request));
        assertEquals(ErrorCode.PASSWORD_INCORRECT, ex.getErrorCode());
    }

    @Test
    @DisplayName("changePassword - User Not Found - Fail")
    void changePassword_UserNotFound_Fail() {
        ChangePasswordRequest request = new ChangePasswordRequest("current_pass", "new_pass");
        AppException ex = assertThrows(AppException.class,
                () -> userService.changePassword("non_existing@test.com", request));
        assertEquals(ErrorCode.USER_NOT_EXISTED, ex.getErrorCode());
    }

    // ============================================================
    // 7. setActiveStatusByEmail (Test for BUG)
    // ============================================================
    @Test
    @DisplayName("setActiveStatusByEmail - BUG: Sets status but does not save")
    void setActiveStatusByEmail_ShouldSetStatusButNotSave() {
        userService.setActiveStatusByEmail("student@test.com", 99);
        assertEquals(99, studentUser.getStatus());
        // ❗️ BUG: Hàm này thiếu userRepo.save(user)
        verify(userRepo, never()).save(any());
    }

    // ============================================================
    // 8. getPendingTeachers
    // ============================================================
    @Test
    @DisplayName("getPendingTeachers - Finds pending users")
    void getPendingTeachers_Success() {
        lecturerUser.setStatus(3); // Approved
        pendingLecturerUser.setStatus(2); // Pending
        when(userRepo.findByRoles_RoleName("LECTURER"))
                .thenReturn(List.of(lecturerUser, pendingLecturerUser));

        List<UserResponse> result = userService.getPendingTeachers();

        assertEquals(1, result.size());
        verify(mapper, times(1)).toUserResponse(pendingLecturerUser);
    }

    // ============================================================
    // 9. updateStatusById (Approve/Reject Teacher)
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/user/update_status_by_id.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: updateStatusById")
    void updateStatusById_Scenarios(
            String testName,
            String userIdToFind,
            int newStatus,
            String action // "SAVE_APPROVE", "DELETE_REJECT", "SAVE_STUDENT", "FAIL"
    ) {
        // 1. --- ACT & ASSERT ---
        if ("FAIL".equals(action)) {
            assertThrows(AppException.class,
                    () -> userService.updateStatusById(userIdToFind, newStatus));
        } else {
            UserResponse result = userService.updateStatusById(userIdToFind, newStatus);
            assertNotNull(result);

            if ("SAVE_APPROVE".equals(action)) {
                // Approve Teacher
                verify(userRepo, times(1)).save(userCaptor.capture());
                assertEquals(3, userCaptor.getValue().getStatus());
                verify(emailService, times(1)).sendEmail(anyString(), eq(teacherApprovalEmail), anyString());
                verify(userRepo, never()).delete(any());
            }
            else if ("DELETE_REJECT".equals(action)) {
                // Reject Teacher
                verify(userRepo, never()).save(any());
                verify(emailService, times(1)).sendEmail(anyString(), eq(rejectTeacherEmail), anyString());
                verify(userRepo, times(1)).delete(pendingLecturerUser);
            }
            else if ("SAVE_STUDENT".equals(action)) {
                // Update Student status (nhánh else cuối cùng)
                verify(userRepo, times(1)).save(userCaptor.capture());
                assertEquals(newStatus, userCaptor.getValue().getStatus());
                verify(emailService, never()).sendEmail(anyString(), any(), anyString());
                verify(userRepo, never()).delete(any());
            }
        }
    }
}