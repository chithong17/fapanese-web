package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.CourseRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.service.interfaces.ICourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final ICourseService icourseService;

    public CourseController(ICourseService icourseService) {
        this.icourseService = icourseService;
    }

    @GetMapping
    public ApiResponse<List<CourseResponse>> getAllCourses() {
        List<CourseResponse> result = icourseService.getAllCourses();
        return ApiResponse.<List<CourseResponse>>builder()
                .result(result)
                .message("Get all course success")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse result = icourseService.getCourseById(id);
        return ApiResponse.<CourseResponse>builder()
                .result(result)
                .message("Get course success")
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<CourseResponse> updateCourse(@PathVariable("id") Long id, @RequestBody CourseRequest request) {
        CourseResponse result = icourseService.updateCourse(id, request);
        return ApiResponse.<CourseResponse>builder()
                .result(result)
                .message("Update course success")
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<CourseResponse> createCourse(@RequestBody CourseRequest request) {
        CourseResponse result = icourseService.createCourse(request);
        return ApiResponse.<CourseResponse>builder()
                .result(result)
                .message("Create course success")
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCourse(@PathVariable("id") Long id) {
        icourseService.deleteCourse(id);
        return ApiResponse.<Void>builder()
                .message("Delete course success")
                .build();
    }
}
