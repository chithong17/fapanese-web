package com.ktnl.fapanese.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ktnl.fapanese.dto.request.AuthenticationRequest;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        // XÓA TOÀN BỘ test users trước khi chạy test
        cleanupAllTestUsers();

        // Tạo user mới với status = 3 (ACTIVE - Student/Teacher đã verify)
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPassword_hash(passwordEncoder.encode("TestPassword123!"));
        testUser.setStatus(3); // Status 3 = ACTIVE (Student hoặc Teacher đã verify)
        testUser = userRepository.save(testUser);
    }

    private void cleanupAllTestUsers() {
        // XÓA TẤT CẢ users có email test để tránh duplicate
        String[] testEmails = {
                "test@example.com",
                "unverified@example.com",
                "inactive@example.com",
                "pending@example.com"
        };

        for (String email : testEmails) {
            // Xóa TẤT CẢ users có email này (có thể có nhiều hơn 1)
            try {
                // Dùng native query để xóa tất cả
                userRepository.findAll().stream()
                        .filter(u -> email.equals(u.getEmail()))
                        .forEach(u -> {
                            try {
                                userRepository.deleteById(u.getId());
                            } catch (Exception e) {
                                // Ignore
                            }
                        });
            } catch (Exception e) {
                // Ignore cleanup errors
            }
        }
        userRepository.flush();
    }

    @AfterEach
    void tearDown() {
        // Clean up TẤT CẢ test data sau mỗi test
        cleanupAllTestUsers();
    }

    // ============================================
    // SUCCESS CASES
    // ============================================

    @Test
    void testLogin_Success_StatusActive() throws Exception {
        // Test với user có status = 3 (ACTIVE)
        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("TestPassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.token").exists())
                .andExpect(jsonPath("$.result.authenticated").value(true));
    }

    // ============================================
    // FAILURE CASES - USER NOT FOUND (404)
    // ============================================

    @Test
    void testLogin_Fail_UserNotFound() throws Exception {
        // Test với email không tồn tại
        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("notexist@example.com");
        loginRequest.setPassword("AnyPassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNotFound()) // 404
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Không tìm thấy người dùng"));
    }

    @Test
    void testLogin_Fail_EmptyEmail() throws Exception {
        // Test với email rỗng
        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("");
        loginRequest.setPassword("TestPassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNotFound()) // 404 - USER_NOT_EXISTED
                .andExpect(jsonPath("$.code").value(1000));
    }

    @Test
    void testLogin_Fail_NullEmail() throws Exception {
        // Test với email null
        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setPassword("TestPassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNotFound()) // 404 - USER_NOT_EXISTED
                .andExpect(jsonPath("$.code").value(1000));
    }

    @Test
    void testLogin_Fail_InvalidEmailFormat() throws Exception {
        // Test với email format sai
        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("invalid-email-format");
        loginRequest.setPassword("TestPassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNotFound()) // 404 - USER_NOT_EXISTED
                .andExpect(jsonPath("$.code").value(1000));
    }

    // ============================================
    // FAILURE CASES - WRONG PASSWORD (401)
    // ============================================

    @Test
    void testLogin_Fail_WrongPassword() throws Exception {
        // Test với password sai
        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("WrongPassword999!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized()) // 401 - AUTHENTICATED error
                .andExpect(jsonPath("$.code").exists());
    }

    @Test
    void testLogin_Fail_EmptyPassword() throws Exception {
        // Test với password rỗng
        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized()); // 401 - password mismatch
    }

    @Test
    void testLogin_Fail_NullPassword() throws Exception {
        // Test với password null
        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("test@example.com");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest()); // 400 thay vì 401

    }

    // ============================================
    // FAILURE CASES - USER STATUS (403/401)
    // ============================================

    @Test
    void testLogin_Fail_UserNotVerifyEmail() throws Exception {
        // Tạo user với status = 0 (chưa verify email)
        User unverifiedUser = new User();
        unverifiedUser.setEmail("unverified@example.com");
        unverifiedUser.setPassword_hash(passwordEncoder.encode("Password123!"));
        unverifiedUser.setStatus(0); // Chưa verify email
        unverifiedUser = userRepository.save(unverifiedUser);

        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("unverified@example.com");
        loginRequest.setPassword("Password123!");

        try {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isForbidden()) // 403 - USER_NOT_VERIFY_EMAIL
                    .andExpect(jsonPath("$.code").value(1008))
                    .andExpect(jsonPath("$.message").value("Tài khoản của bạn chưa xác thực Email"));
        } finally {
            userRepository.deleteById(unverifiedUser.getId());
        }
    }

    @Test
    void testLogin_Fail_UserNotActivated() throws Exception {
        // Tạo user với status = 1 (chưa kích hoạt)
        User inactiveUser = new User();
        inactiveUser.setEmail("inactive@example.com");
        inactiveUser.setPassword_hash(passwordEncoder.encode("Password123!"));
        inactiveUser.setStatus(1); // Chưa active
        inactiveUser = userRepository.save(inactiveUser);

        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("inactive@example.com");
        loginRequest.setPassword("Password123!");

        try {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isForbidden()) // 403 - USER_NOT_ISACTIVED
                    .andExpect(jsonPath("$.code").value(1006))
                    .andExpect(jsonPath("$.message").value("Tài khoản của bạn đã bị vô hiệu hóa"));
        } finally {
            userRepository.deleteById(inactiveUser.getId());
        }
    }

    @Test
    void testLogin_Fail_UserNeedAdminApproval() throws Exception {
        // Tạo user với status = 2 (cần admin duyệt - Teacher)
        User pendingUser = new User();
        pendingUser.setEmail("pending@example.com");
        pendingUser.setPassword_hash(passwordEncoder.encode("Password123!"));
        pendingUser.setStatus(2); // Cần admin approval
        pendingUser = userRepository.save(pendingUser);

        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("pending@example.com");
        loginRequest.setPassword("Password123!");

        try {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isForbidden()) // 403 - USER_NEED_ADMIN_APPROVAL
                    .andExpect(jsonPath("$.code").value(1009))
                    .andExpect(jsonPath("$.message").value("Tài khoản của bạn đang đợi duyệt"));
        } finally {
            userRepository.deleteById(pendingUser.getId());
        }
    }

    // ============================================
    // EDGE CASES
    // ============================================

    @Test
    void testLogin_Fail_BothEmpty() throws Exception {
        // Test với cả email và password rỗng
        AuthenticationRequest loginRequest = new AuthenticationRequest();
        loginRequest.setEmail("");
        loginRequest.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNotFound()) // 404 - USER_NOT_EXISTED
                .andExpect(jsonPath("$.code").value(1000));
    }

    @Test
    void testLogin_Fail_BothNull() throws Exception {
        // Test với cả email và password null
        AuthenticationRequest loginRequest = new AuthenticationRequest();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNotFound()) // 404 - USER_NOT_EXISTED
                .andExpect(jsonPath("$.code").value(1000));
    }

    @Test
    void testLogin_Fail_EmptyJsonBody() throws Exception {
        // Test với JSON body rỗng
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound()); // 404 - USER_NOT_EXISTED
    }
}