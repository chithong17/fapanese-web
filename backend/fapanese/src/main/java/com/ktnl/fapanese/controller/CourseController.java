package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.service.interfaces.ICourseService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        List<CourseResponse> courses = icourseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(icourseService.getCourseById(id));
    }
}
