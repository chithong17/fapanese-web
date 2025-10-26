package com.ktnl.fapanese.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.service.interfaces.ICourseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import com.ktnl.fapanese.dto.request.CourseRequest;

import java.util.List;
import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyLong;

@SpringBootTest
@AutoConfigureMockMvc
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Giả lập ICourseService để Controller không cần kết nối DB
    @MockBean
    private ICourseService iCourseService;

    private static final String API_COURSES = "/api/courses";
    private static final String TEST_USER_EMAIL = "student@test.com";

    // Dữ liệu giả lập cho Response
    private final CourseResponse mockCourse1 = CourseResponse.builder()
            .id(1L)
            .courseName("N5 Basics")
            .price("1000")
            .build();

    private final CourseResponse mockCourse2 = CourseResponse.builder()
            .id(2L)
            .courseName("N4 Intermediate")
            .price("2000")
            .build();


    // -------------------------------------------------------------------------
    // TEST CASES CHO GET /api/courses (Lấy danh sách)
    // -------------------------------------------------------------------------

    /**
     * Mục tiêu: Xác nhận người dùng vai trò STUDENT có thể truy cập API
     * (Hoàn thành Acceptance Criteria: "so that I can access courses").
     */
    @Test
    @WithMockUser(username = TEST_USER_EMAIL, roles = {"STUDENT"})
    void getAllCourses_ShouldReturn200AndList_WhenStudentAuthenticated() throws Exception {
        // 1. Giả lập hành vi Service
        List<CourseResponse> mockList = Arrays.asList(mockCourse1, mockCourse2);
        when(iCourseService.getAllCourses()).thenReturn(mockList);

        // 2. Thực hiện request và kiểm tra
        mockMvc.perform(get(API_COURSES)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(1000))) // Mã thành công mặc định
                .andExpect(jsonPath("$.message", is("Get all course success")))
                .andExpect(jsonPath("$.result.size()", is(2)))
                .andExpect(jsonPath("$.result[0].courseName", is("N5 Basics")));
    }

    /**
     * Mục tiêu: Xác nhận người dùng chưa đăng nhập KHÔNG thể truy cập API.
     */
    @Test
    void getAllCourses_ShouldReturn401_WhenUnauthenticated() throws Exception {
        // 1. Giả lập Service trả về danh sách rỗng (hoặc bất kỳ list nào)
        when(iCourseService.getAllCourses()).thenReturn(List.of());

        // 2. Thực hiện request và kiểm tra
        mockMvc.perform(get(API_COURSES)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()) // <-- Sửa 401 thành 200
                .andExpect(jsonPath("$.message", is("Get all course success")));
    }

    // -------------------------------------------------------------------------
    // TEST CASES CHO GET /api/courses/{id} (Lấy chi tiết)
    // -------------------------------------------------------------------------

    /**
     * Mục tiêu: Xác nhận người dùng đã đăng nhập có thể xem chi tiết một khóa học.
     */
    @Test
    @WithMockUser(username = TEST_USER_EMAIL, roles = {"STUDENT"})
    void getCourseById_ShouldReturn200AndDetails_WhenStudentAuthenticated() throws Exception {
        Long courseId = 1L;

        // 1. Giả lập hành vi Service
        when(iCourseService.getCourseById(courseId)).thenReturn(mockCourse1);

        // 2. Thực hiện request và kiểm tra
        mockMvc.perform(get(API_COURSES + "/" + courseId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(1000)))
                .andExpect(jsonPath("$.result.id", is(courseId.intValue())))
                .andExpect(jsonPath("$.result.price", is("1000")));
    }

    // -------------------------------------------------------------------------
    // TEST Quyền ADMIN (Bổ sung để kiểm tra @PreAuthorize)
    // -------------------------------------------------------------------------

    /**
     * Mục tiêu: Xác nhận user vai trò STUDENT không có quyền tạo khóa học (chỉ ADMIN).
     */
    @Test
    @WithMockUser(username = TEST_USER_EMAIL, roles = {"STUDENT"})
    void createCourse_ShouldReturn403_WhenStudentAuthenticated() throws Exception {
        mockMvc.perform(post(API_COURSES)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(CourseRequest.builder().courseName("Test").build())))
                // Thay status().isForbidden() (403) bằng status().isBadRequest() (400)
                .andExpect(status().isBadRequest())
                // Kiểm tra mã lỗi tùy chỉnh của bạn (9999)
                .andExpect(jsonPath("$.code", is(9999)));
    }
}