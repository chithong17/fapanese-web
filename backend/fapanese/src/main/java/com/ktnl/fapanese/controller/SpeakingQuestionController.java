package com.ktnl.fapanese.controller;

// Thêm các import cần thiết
import com.ktnl.fapanese.dto.request.SpeakingQuestionRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.SpeakingQuestionResponse;
import com.ktnl.fapanese.service.interfaces.ISpeakingQuestionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*; // Thêm import chung
import java.util.List; // Thêm import cho List

@RestController
@RequestMapping("/api/speaking-questions")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpeakingQuestionController {

    ISpeakingQuestionService iSpeakingQuestionService;

    /**
     * [CREATE] Tạo một câu hỏi mới
     * POST /api/speaking-questions
     */
    @PostMapping
    public ApiResponse<SpeakingQuestionResponse> createQuestion(@RequestBody SpeakingQuestionRequest request) {
        SpeakingQuestionResponse createdQuestion = iSpeakingQuestionService.createQuestion(request);
        return ApiResponse.<SpeakingQuestionResponse>builder()
                .result(createdQuestion)
                .message("Create speaking question success")
                .build();
    }

    /**
     * [READ] Lấy một câu hỏi bằng ID
     * GET /api/speaking-questions/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<SpeakingQuestionResponse> getQuestionById(@PathVariable Long id) {
        SpeakingQuestionResponse question = iSpeakingQuestionService.getQuestionById(id);
        return ApiResponse.<SpeakingQuestionResponse>builder()
                .result(question)
                .message("Get speaking question by Id success")
                .build();
    }

    /**
     * [READ] Lấy tất cả câu hỏi (Có thể lọc theo speakingId)
     * GET /api/speaking-questions
     * GET /api/speaking-questions?speakingId=1
     */
    @GetMapping
    public ApiResponse<List<SpeakingQuestionResponse>> getAllQuestions(
            @RequestParam(required = false) Long speakingId) {

        List<SpeakingQuestionResponse> questions;
        String message;

        if (speakingId != null) {
            // Lọc theo ID bài nói
            questions = iSpeakingQuestionService.getQuestionsBySpeakingId(speakingId);
            message = "Get all speaking questions by speakingId success";
        } else {
            // Lấy tất cả
            questions = iSpeakingQuestionService.getAllQuestions();
            message = "Get all speaking questions success";
        }

        return ApiResponse.<List<SpeakingQuestionResponse>>builder()
                .result(questions)
                .message(message)
                .build();
    }

    /**
     * [UPDATE] Cập nhật một câu hỏi bằng ID
     * PUT /api/speaking-questions/{id}
     */
    @PutMapping("/{id}")
    public ApiResponse<SpeakingQuestionResponse> updateQuestion(
            @PathVariable Long id,
            @RequestBody SpeakingQuestionRequest request) {

        SpeakingQuestionResponse updatedQuestion = iSpeakingQuestionService.updateQuestion(id, request);
        return ApiResponse.<SpeakingQuestionResponse>builder()
                .result(updatedQuestion)
                .message("Update speaking question success")
                .build();
    }

    /**
     * [DELETE] Xóa một câu hỏi bằng ID
     * DELETE /api/speaking-questions/{id}
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteQuestion(@PathVariable Long id) {
        iSpeakingQuestionService.deleteQuestion(id);
        return ApiResponse.<Void>builder()
                .message("Delete speaking question success")
                .build();
    }
}