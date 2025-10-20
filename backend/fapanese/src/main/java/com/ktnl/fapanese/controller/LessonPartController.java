package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.LessonPartSimpleResponse;
import com.ktnl.fapanese.service.interfaces.ILessonPartService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lesson-parts")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonPartController {

    ILessonPartService lessonPartService;


    @GetMapping("/by-lesson/{lessonId}")
    public ApiResponse<List<LessonPartSimpleResponse>> getLessonPartsByLesson(@PathVariable Long lessonId) {
        List<LessonPartSimpleResponse> result = lessonPartService.getLessonPartsByLesson(lessonId);
        return ApiResponse.<List<LessonPartSimpleResponse>>builder()
                .message("Lesson parts fetched successfully for lesson " + lessonId)
                .result(result)
                .build();
    }
}
