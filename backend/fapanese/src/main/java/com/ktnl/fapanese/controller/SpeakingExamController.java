package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.SpeakingExamRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.SpeakingExamResponse;
import com.ktnl.fapanese.dto.response.SpeakingTestResponse;
import com.ktnl.fapanese.service.interfaces.ISpeakingExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/speaking-exams")
@RequiredArgsConstructor
public class SpeakingExamController {

    private final ISpeakingExamService speakingExamService;

    @GetMapping
    public ApiResponse<List<SpeakingExamResponse>> getAllSpeakingExams() {
        List<SpeakingExamResponse> result = speakingExamService.getAllSpeakingExams();
        return ApiResponse.<List<SpeakingExamResponse>>builder()
                .result(result)
                .message("Get all speaking exams success")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<SpeakingExamResponse> getSpeakingExamById(@PathVariable Long id) {
        SpeakingExamResponse result = speakingExamService.getSpeakingExamById(id);
        return ApiResponse.<SpeakingExamResponse>builder()
                .result(result)
                .message("Get speaking exam by id success")
                .build();
    }

    @PostMapping
    public ApiResponse<SpeakingExamResponse> createSpeakingExam(@RequestBody SpeakingExamRequest request) {
        SpeakingExamResponse result = speakingExamService.createSpeakingExam(request);
        return ApiResponse.<SpeakingExamResponse>builder()
                .result(result)
                .message("Create speaking exam success")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<SpeakingExamResponse> updateSpeakingExam(@PathVariable Long id, @RequestBody SpeakingExamRequest request) {
        SpeakingExamResponse result = speakingExamService.updateSpeakingExam(id, request);
        return ApiResponse.<SpeakingExamResponse>builder()
                .result(result)
                .message("Update speaking exam success")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteSpeakingExam(@PathVariable Long id) {
        speakingExamService.deleteSpeakingExam(id);
        return ApiResponse.<String>builder()
                .message("Delete speaking exam success")
                .build();
    }

    @GetMapping("/by-overview-part/{partId}")
    public ApiResponse<List<SpeakingExamResponse>> getAllSpeakingExams(@PathVariable Long partId) {
        List<SpeakingExamResponse> result = speakingExamService.getAllSpeakingExamsByOverviewPartId(partId);
        return ApiResponse.<List<SpeakingExamResponse>>builder()
                .result(result)
                .message("Get all speaking exams success")
                .build();
    }

    @GetMapping("/generate-test/{overviewPartId}")
    public ApiResponse<SpeakingTestResponse> generateRandomSpeakingTest(@PathVariable Long overviewPartId){
        var result = speakingExamService.generateRandomSpeakingTest(overviewPartId);
        return ApiResponse.<SpeakingTestResponse>builder()
                .result(result)
                .message("Generate random speaking test successfully")
                .build();
    }

}
