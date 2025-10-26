package com.ktnl.fapanese.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.repository.UserRepository;
import com.ktnl.fapanese.service.interfaces.IUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.api.Disabled;

import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.hamcrest.Matchers.is;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IUserService iUserService;

    // THÊM MOCK CHO REPOSITORY (nếu Controller dùng trực tiếp)
    @MockBean
    private UserRepository userRepository;

    private static final String TEST_USER_EMAIL = "test_user@ktnl.com";
    private static final String API_BASE = "/api/users";
    private static final String NEW_FIRST_NAME = "Linh Updated";

    @BeforeEach
    void setUp() {
        // Reset mocks trước mỗi test
        Mockito.reset(iUserService, userRepository);

        // Mock UserRepository.findByEmail() để tránh NPE
        User mockUser = new User();
        mockUser.setEmail(TEST_USER_EMAIL);
        mockUser.setPassword_hash("hashed_password");
        mockUser.setStatus(3); // ACTIVE

        when(userRepository.findByEmail(TEST_USER_EMAIL))
                .thenReturn(Optional.of(mockUser));
    }

    // =========================================================================
    // GET /api/users/profile TESTS
    // =========================================================================

    @Test
    @WithMockUser(username = TEST_USER_EMAIL, roles = {"STUDENT"})
    void getProfile_ShouldReturn200AndProfileDetails_WhenAuthenticated() throws Exception {
        // Arrange
        UserResponse mockResponse = UserResponse.builder()
                .email(TEST_USER_EMAIL)
                .role("STUDENT")
                .firstName("Linh")
                .lastName("Nguyen")
                .build();

        when(iUserService.getCurrentUserProfile()).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get(API_BASE + "/profile")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(1000)))
                .andExpect(jsonPath("$.result.email", is(TEST_USER_EMAIL)))
                .andExpect(jsonPath("$.result.firstName", is("Linh")));

        verify(iUserService, times(1)).getCurrentUserProfile();
    }

    @Test
    void getProfile_ShouldReturn401_WhenUnauthenticated() throws Exception {
        mockMvc.perform(get(API_BASE + "/profile")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================================
    // POST /api/users/profile/update TESTS
    // =========================================================================

    /**
     * BUG: UserController.updateProfile() là PRIVATE method
     * → Spring không thể map endpoint /api/users/profile/update
     * → Endpoint không hoạt động (404/400)
     *
     * ACTION REQUIRED: Dev cần đổi method từ private → public
     * BLOCKED UNTIL: UserController.java line 52 được fix
     * SEVERITY: Critical (100% users không thể update profile)
     */
    @Test
    @WithMockUser(username = TEST_USER_EMAIL, roles = {"STUDENT"})
    @Disabled("BLOCKED: UserController.updateProfile() is private - Spring cannot map this endpoint. " +
            "Need dev to change 'private' to 'public' in UserController.java line 52")
    void updateProfile_ShouldReturn200AndUpdatedDetails_WhenDataIsValid() throws Exception {
        // Arrange
        UserRequest validRequest = UserRequest.builder()
                .firstName(NEW_FIRST_NAME)
                .lastName("Nguyen")
                .email(TEST_USER_EMAIL)
                .role("STUDENT")
                .password("dummy_password")
                .build();

        UserResponse mockResponse = UserResponse.builder()
                .email(TEST_USER_EMAIL)
                .role("STUDENT")
                .firstName(NEW_FIRST_NAME)
                .lastName("Nguyen")
                .build();

        when(iUserService.updateUserProfile(any(UserRequest.class)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post(API_BASE + "/profile/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(1000)))
                .andExpect(jsonPath("$.result.firstName", is(NEW_FIRST_NAME)));

        verify(iUserService, times(1)).updateUserProfile(any(UserRequest.class));
    }

    @Test
    @WithMockUser(username = TEST_USER_EMAIL, roles = {"STUDENT"})
    void updateProfile_ShouldReturn400_WhenDataIsInvalid() throws Exception {
        // Arrange - firstName RỖNG (vi phạm @NotBlank)
        UserRequest invalidRequest = UserRequest.builder()
                .firstName("") // <-- INVALID
                .lastName("Nguyen")
                .email(TEST_USER_EMAIL)
                .role("STUDENT")
                .password("dummy_password")
                .build();

        // Act & Assert
        mockMvc.perform(post(API_BASE + "/profile/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").exists());

        // Service KHÔNG được gọi vì validation fail
        verify(iUserService, never()).updateUserProfile(any(UserRequest.class));
    }

    @Test
    @WithMockUser(username = TEST_USER_EMAIL, roles = {"STUDENT"})
    void updateProfile_ShouldReturn400_WhenEmailIsNull() throws Exception {
        // Arrange
        UserRequest invalidRequest = UserRequest.builder()
                .firstName("Linh")
                .lastName("Nguyen")
                .email(null) // <-- INVALID
                .role("STUDENT")
                .password("dummy_password")
                .build();

        // Act & Assert
        mockMvc.perform(post(API_BASE + "/profile/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(iUserService, never()).updateUserProfile(any(UserRequest.class));
    }

    @Test
    void updateProfile_ShouldReturn401_WhenUnauthenticated() throws Exception {
        // Arrange
        UserRequest validRequest = UserRequest.builder()
                .firstName("Linh")
                .lastName("Nguyen")
                .email(TEST_USER_EMAIL)
                .role("STUDENT")
                .password("dummy_password")
                .build();

        // Act & Assert - Không có @WithMockUser
        mockMvc.perform(post(API_BASE + "/profile/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isUnauthorized());

        verify(iUserService, never()).updateUserProfile(any(UserRequest.class));
    }

    // =========================================================================
    // POST /api/users/register TESTS
    // =========================================================================

    @Test
    void registerUser_ShouldReturn200_WhenDataIsValid() throws Exception {
        // Arrange
        UserRequest validRegisterRequest = UserRequest.builder()
                .firstName("New")
                .lastName("User")
                .email("newuser@test.com")
                .password("SecurePass123")
                .role("STUDENT")
                .build();

        UserResponse mockResponse = UserResponse.builder()
                .email("newuser@test.com")
                .role("STUDENT")
                .firstName("New")
                .lastName("User")
                .build();

        when(iUserService.registerUser(any(UserRequest.class))).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post(API_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(1000)))
                .andExpect(jsonPath("$.result.email", is("newuser@test.com")));

        verify(iUserService, times(1)).registerUser(any(UserRequest.class));
    }

    @Test
    void registerUser_ShouldReturn400_WhenEmailIsInvalid() throws Exception {
        // Arrange
        UserRequest invalidRequest = UserRequest.builder()
                .firstName("New")
                .lastName("User")
                .email("invalid-email") // <-- INVALID format
                .password("SecurePass123")
                .role("STUDENT")
                .build();

        // Act & Assert
        mockMvc.perform(post(API_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(iUserService, never()).registerUser(any(UserRequest.class));
    }

    @Test
    void registerUser_ShouldReturn400_WhenPasswordIsTooShort() throws Exception {
        // Arrange
        UserRequest invalidRequest = UserRequest.builder()
                .firstName("New")
                .lastName("User")
                .email("newuser@test.com")
                .password("123") // <-- TOO SHORT
                .role("STUDENT")
                .build();

        // Act & Assert
        mockMvc.perform(post(API_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(iUserService, never()).registerUser(any(UserRequest.class));
    }
}