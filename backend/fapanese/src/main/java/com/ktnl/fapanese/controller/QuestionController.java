package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.request.UserAnswer;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.QuestionResponse;
import com.ktnl.fapanese.dto.response.SubmitQuizResponse;
import com.ktnl.fapanese.entity.enums.QuestionCategory;
import com.ktnl.fapanese.entity.enums.QuestionType;
import com.ktnl.fapanese.service.interfaces.IQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final IQuestionService questionService;

    @PostMapping
    public ApiResponse<QuestionResponse> createQuestion(@RequestBody QuestionRequest request) {
        QuestionResponse result = questionService.createQuestion(request);
        return ApiResponse.<QuestionResponse>builder()
                .result(result)
                .message("Create Question success")
                .build();
    }

    @GetMapping
    public ApiResponse<List<QuestionResponse>> getAllQuestions() {
        List<QuestionResponse> result = questionService.getAllQuestions();
        return ApiResponse.<List<QuestionResponse>>builder()
                .result(result)
                .message("Get all question success")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<QuestionResponse> getQuestionById(@PathVariable Long id) {
        QuestionResponse result = questionService.getQuestionById(id);
        return ApiResponse.<QuestionResponse>builder()
                .result(result)
                .message("Get question by Id success")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<QuestionResponse> updateQuestion(@PathVariable Long id, @RequestBody QuestionRequest request) {
        QuestionResponse result = questionService.updateQuestion(id, request);
        return ApiResponse.<QuestionResponse>builder()
                .result(result)
                .message("Update question success")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ApiResponse.<Void>builder()
                .message("Delete question success")
                .build();
    }

    // ✅ API mới:
    @GetMapping("/type/{questionType}")
    public ApiResponse<List<QuestionResponse>> getQuestionsByType(@PathVariable QuestionType questionType) {
        List<QuestionResponse> result = questionService.getQuestionsByType(questionType);
        return ApiResponse.<List<QuestionResponse>>builder()
                .result(result)
                .message("Get question by type success")
                .build();
    }

    @GetMapping("/category/{category}")
    public ApiResponse<List<QuestionResponse>> getQuestionsByCategory(@PathVariable QuestionCategory category) {
        List<QuestionResponse> result = questionService.getQuestionsByCategory(category);
        return ApiResponse.<List<QuestionResponse>>builder()
                .result(result)
                .message("Get question by category success")
                .build();
    }


    @PostMapping("/submit")
    public ApiResponse<SubmitQuizResponse> submitAnswers(@RequestBody List<UserAnswer> userAnswers) {
        SubmitQuizResponse result = questionService.checkAndSubmitAnswers(userAnswers);

        String message = String.format("Quiz submitted successfully. Score: %.2f%% (%d/%d)",
                result.getScorePercentage(), result.getCorrectCount(), result.getTotalQuestions());

        return ApiResponse.<SubmitQuizResponse>builder()
                .message(message)
                .result(result)
                .build();
    }
}
