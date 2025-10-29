package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.MaterialSubmissionGradeRequest;
import com.ktnl.fapanese.dto.request.MaterialSubmissionRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.MaterialSubmissionResponse;
import com.ktnl.fapanese.service.interfaces.IMaterialSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/material-submissions")
public class MaterialSubmissionController {

    private final IMaterialSubmissionService service;

    @PostMapping
    public ApiResponse<MaterialSubmissionResponse> submit(@RequestBody MaterialSubmissionRequest request) {
        MaterialSubmissionResponse result = service.submit(request);
        return ApiResponse.<MaterialSubmissionResponse>builder()
                .result(result)
                .message("Submit material successfully")
                .build();
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<MaterialSubmissionResponse>> getByStudent(@PathVariable String studentId) {
        List<MaterialSubmissionResponse> result = service.getByStudent(studentId);
        return ApiResponse.<List<MaterialSubmissionResponse>>builder()
                .result(result)
                .message("Get submissions by student success")
                .build();
    }

    @GetMapping("/material/{materialId}")
    public ApiResponse<List<MaterialSubmissionResponse>> getByMaterial(@PathVariable Long materialId) {
        List<MaterialSubmissionResponse> result = service.getByMaterial(materialId);
        return ApiResponse.<List<MaterialSubmissionResponse>>builder()
                .result(result)
                .message("Get submissions by material success")
                .build();
    }

    @GetMapping("/class/{classCourseId}")
    public ApiResponse<List<MaterialSubmissionResponse>> getByClass(@PathVariable Long classCourseId) {
        List<MaterialSubmissionResponse> result = service.getByClassCourse(classCourseId);
        return ApiResponse.<List<MaterialSubmissionResponse>>builder()
                .result(result)
                .message("Get submissions by class success")
                .build();
    }

    @PutMapping("/{id}/grade")
    public ApiResponse<MaterialSubmissionResponse> grade(
            @PathVariable Long id,
            @RequestBody MaterialSubmissionGradeRequest request) {
        MaterialSubmissionResponse result = service.grade(id, request);
        return ApiResponse.<MaterialSubmissionResponse>builder()
                .result(result)
                .message("Grade submission success")
                .build();
    }
}
