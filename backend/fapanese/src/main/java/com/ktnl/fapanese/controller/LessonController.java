package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.LessonRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.LessonRespone;
import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.service.interfaces.ICourseService;
import com.ktnl.fapanese.service.interfaces.ILessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final ILessonService lessonService;
    private final ICourseService icourseService;

    public LessonController(ILessonService lessonService, ICourseService icourseService) {
        this.lessonService = lessonService;
        this.icourseService = icourseService;
    }

    // GET /api/lessons
    @GetMapping
    public ResponseEntity<List<LessonRespone>> getAllLessons() {
        return ResponseEntity.ok(lessonService.getAllLesson());
    }

    // GET /api/lessons/{id}
    @GetMapping("/{id}")
    public ResponseEntity<LessonRespone> getLessonById(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getLessonByLessonId(id));
    }

    // GET /api/lessons/by-course/{courseId}
    // @GetMapping("/by-course/{courseId}")
    // public ResponseEntity<List<LessonRespone>> getLessonsByCourseId(@PathVariable
    // Long courseId) {
    // return ResponseEntity.ok(lessonService.getLessonByCourseId(courseId));
    // }

    @GetMapping("/by-course/{courseCode}")
    public ResponseEntity<?> getLessonsByCourse(@PathVariable("courseCode") String courseCode) {
        List<LessonRespone> lessons = lessonService.findByCourseCode(courseCode);
        return ResponseEntity.ok(lessons);
    }

        @PostMapping("/by-course/{courseCode}")
        @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
        public ApiResponse<LessonRespone> createLessonByCourse(
                @PathVariable String courseCode,
                @RequestBody LessonRequest request) {

            LessonRespone result = lessonService.createLessonByCourseCode(request, courseCode);
            return ApiResponse.<LessonRespone>builder()
                    .result(result)
                    .message("Create lesson success")
                    .build();
        }

    @PutMapping("/by-course/{courseCode}/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ApiResponse<LessonRespone> updateLessonByCourse(
            @PathVariable String courseCode,
            @PathVariable Long lessonId,
            @RequestBody LessonRequest request) {

        LessonRespone result = lessonService.updateLessonByCourseCode(request, courseCode, lessonId);

        return ApiResponse.<LessonRespone>builder()
                .result(result)
                .message("Update lesson success")
                .build();
    }


    @DeleteMapping("/by-course/{courseCode}/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ApiResponse<Void> deleteLessonByCourse(
            @PathVariable String courseCode,
            @PathVariable Long lessonId) {

        lessonService.deleteLessonByCourseCode(courseCode, lessonId);

        return ApiResponse.<Void>builder()
                .message("Delete lesson success")
                .build();
    }


}
