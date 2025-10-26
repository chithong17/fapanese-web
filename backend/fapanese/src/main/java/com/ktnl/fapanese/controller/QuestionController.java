package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.request.UserAnswer;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.ExcelUploadResponse;
import com.ktnl.fapanese.dto.response.QuestionResponse;
import com.ktnl.fapanese.dto.response.SubmitQuizResponse;
import com.ktnl.fapanese.entity.enums.QuestionCategory;
import com.ktnl.fapanese.entity.enums.QuestionType;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.service.interfaces.IQuestionExcelUploadService;
import com.ktnl.fapanese.service.interfaces.IQuestionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuestionController {

    IQuestionService questionService;
    IQuestionExcelUploadService questionExcelUploadService;

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
    public ApiResponse<QuestionResponse> getQuestionById(@PathVariable("id") Long id) {
        QuestionResponse result = questionService.getQuestionById(id);
        return ApiResponse.<QuestionResponse>builder()
                .result(result)
                .message("Get question by Id success")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<QuestionResponse> updateQuestion(@PathVariable("id") Long id, @RequestBody QuestionRequest request) {
        QuestionResponse result = questionService.updateQuestion(id, request);
        return ApiResponse.<QuestionResponse>builder()
                .result(result)
                .message("Update question success")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteQuestion(@PathVariable("id") Long id) {
        questionService.deleteQuestion(id);
        return ApiResponse.<Void>builder()
                .message("Delete question success")
                .build();
    }

    // ✅ API mới:
    @GetMapping("/type/{questionType}")
    public ApiResponse<List<QuestionResponse>> getQuestionsByType(@PathVariable("questionType") QuestionType questionType) {
        List<QuestionResponse> result = questionService.getQuestionsByType(questionType);
        return ApiResponse.<List<QuestionResponse>>builder()
                .result(result)
                .message("Get question by type success")
                .build();
    }

    @GetMapping("/category/{category}")
    public ApiResponse<List<QuestionResponse>> getQuestionsByCategory(@PathVariable("category") QuestionCategory category) {
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



    @GetMapping("/by-lesson-part/{lessonPartId}")
    public ApiResponse<List<QuestionResponse>> getQuestionsByLessonPart(
            @PathVariable("lessonPartId") Long lessonPartId) {

        List<QuestionResponse> result = questionService.getQuestionsByLessonPart(lessonPartId);

        return ApiResponse.<List<QuestionResponse>>builder()
                .message("Questions fetched successfully for LessonPart " + lessonPartId)
                .result(result)
                .build();
    }

    @PostMapping("/upload-excel")
    public ResponseEntity<ExcelUploadResponse> uploadQuestionsFromExcel(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            ExcelUploadResponse response = new ExcelUploadResponse();
            response.addErrorMessage(0, "File rỗng.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            ExcelUploadResponse response = questionExcelUploadService.processQuestionExcel(file);
            if (response.getFailureCount() > 0) {
                // Vẫn trả về 200 OK nhưng body chứa thông tin lỗi
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok(response);
        } catch (AppException e) {
            ExcelUploadResponse response = new ExcelUploadResponse();
            response.addErrorMessage(0, "Lỗi xử lý file: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (IOException e) {
            ExcelUploadResponse response = new ExcelUploadResponse();
            response.addErrorMessage(0, "Lỗi đọc file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

}
