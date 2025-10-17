package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.response.LessonResponse;
import com.ktnl.fapanese.service.interfaces.ILessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final ILessonService lessonService;

    public LessonController(ILessonService lessonService) {
        this.lessonService = lessonService;
    }

    // GET /api/lessons
    @GetMapping
    public ResponseEntity<List<LessonResponse>> getAllLessons() {
        return ResponseEntity.ok(lessonService.getAllLesson());
    }

    // GET /api/lessons/{id}
    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> getLessonById(@PathVariable String id) {
        return ResponseEntity.ok(lessonService.getLessonByLessonId(id));
    }

    // GET /api/lessons/by-course/{courseId}
    @GetMapping("/by_course/{courseId}")
    public ResponseEntity<List<LessonResponse>> getLessonsByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getLessonByCourseId(courseId));
    }
}
