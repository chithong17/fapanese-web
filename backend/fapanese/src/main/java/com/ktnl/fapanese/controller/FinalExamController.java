package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.FinalExamRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.FinalExamResponse;
import com.ktnl.fapanese.service.interfaces.IFinalExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/final-exams")
@RequiredArgsConstructor
public class FinalExamController {

    private final IFinalExamService finalExamService;

    @GetMapping
    public ApiResponse<List<FinalExamResponse>> getAllFinalExams() {
        List<FinalExamResponse> result = finalExamService.getAllFinalExams();
        return ApiResponse.<List<FinalExamResponse>>builder()
                .result(result)
                .message("Get all final exams success")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<FinalExamResponse> getFinalExamById(@PathVariable Long id) {
        FinalExamResponse result = finalExamService.getFinalExamById(id);
        return ApiResponse.<FinalExamResponse>builder()
                .result(result)
                .message("Get final exam by id success")
                .build();
    }

    @PostMapping
    public ApiResponse<FinalExamResponse> createFinalExam(@RequestBody FinalExamRequest request) {
        FinalExamResponse result = finalExamService.createFinalExam(request);
        return ApiResponse.<FinalExamResponse>builder()
                .result(result)
                .message("Create final exam success")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<FinalExamResponse> updateFinalExam(@PathVariable Long id, @RequestBody FinalExamRequest request) {
        FinalExamResponse result = finalExamService.updateFinalExam(id, request);
        return ApiResponse.<FinalExamResponse>builder()
                .result(result)
                .message("Update final exam success")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteFinalExam(@PathVariable Long id) {
        finalExamService.deleteFinalExam(id);
        return ApiResponse.<String>builder()
                .message("Delete final exam success")
                .build();
    }
}
