package com.ktnl.fapanese.controller;


import com.ktnl.fapanese.dto.request.MiddleExamRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.MiddleExamResponse;
import com.ktnl.fapanese.dto.response.SpeakingExamResponse;
import com.ktnl.fapanese.service.interfaces.IMiddleExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/middle-exams")
@RequiredArgsConstructor
public class MiddleExamController {

    private final IMiddleExamService middleExamService;

    @GetMapping
    public ApiResponse<List<MiddleExamResponse>> getAllMiddleExams() {
        List<MiddleExamResponse> result = middleExamService.getAllMiddleExams();
        return ApiResponse.<List<MiddleExamResponse>>builder()
                .result(result)
                .message("Get all middle exams success")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<MiddleExamResponse> getMiddleExamById(@PathVariable Long id) {
        MiddleExamResponse result = middleExamService.getMiddleExamById(id);
        return ApiResponse.<MiddleExamResponse>builder()
                .result(result)
                .message("Get middle exam by id success")
                .build();
    }

    @PostMapping
    public ApiResponse<MiddleExamResponse> createMiddleExam(@RequestBody MiddleExamRequest request) {
        MiddleExamResponse result = middleExamService.createMiddleExam(request);
        return ApiResponse.<MiddleExamResponse>builder()
                .result(result)
                .message("Create middle exam success")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<MiddleExamResponse> updateMiddleExam(@PathVariable Long id, @RequestBody MiddleExamRequest request) {
        MiddleExamResponse result = middleExamService.updateMiddleExam(id, request);
        return ApiResponse.<MiddleExamResponse>builder()
                .result(result)
                .message("Update middle exam success")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteMiddleExam(@PathVariable Long id) {
        middleExamService.deleteMiddleExam(id);
        return ApiResponse.<String>builder()
                .message("Delete middle exam success")
                .build();
    }

    @GetMapping("/by-overview-part/{partId}")
    public ApiResponse<List<MiddleExamResponse>> getAllMiddleExams(@PathVariable Long partId) {
        List<MiddleExamResponse> result = middleExamService.getAllMiddleExamsByOverviewPartId(partId);
        return ApiResponse.<List<MiddleExamResponse>>builder()
                .result(result)
                .message("Get all middle exams success")
                .build();
    }
}
