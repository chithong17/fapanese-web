package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.request.UserAnswer;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.QuestionResponse;
import com.ktnl.fapanese.dto.response.SubmitQuizResponse;
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
    public ResponseEntity<QuestionResponse> createQuestion(@RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.createQuestion(request));
    }

    @GetMapping
    public ResponseEntity<List<QuestionResponse>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionResponse> updateQuestion(@PathVariable Long id, @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.updateQuestion(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ API mới:
    @GetMapping("/type/{questionType}")
    public ResponseEntity<List<QuestionResponse>> getQuestionsByType(@PathVariable String questionType) {
        return ResponseEntity.ok(questionService.getQuestionsByType(questionType));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<QuestionResponse>> getQuestionsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(questionService.getQuestionsByCategory(category));
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
