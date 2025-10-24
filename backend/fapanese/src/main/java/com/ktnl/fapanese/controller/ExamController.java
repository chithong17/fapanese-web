package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.UserAnswer;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.SubmitQuizResponse;
import com.ktnl.fapanese.service.interfaces.IExamService;
import com.ktnl.fapanese.service.interfaces.IFinalExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exam")
@RequiredArgsConstructor
public class ExamController {

    private final IExamService examService;

    @PostMapping("/submit")
    public ApiResponse<SubmitQuizResponse> submitExam(@RequestBody List<UserAnswer> userAnswers) {
        SubmitQuizResponse result = examService.checkAndSubmitExamAnswers(userAnswers);

        String message = String.format("Exam submitted successfully. Score: %.2f%% (%d/%d)",
                result.getScorePercentage(), result.getCorrectCount(), result.getTotalQuestions());

        return ApiResponse.<SubmitQuizResponse>builder()
                .message(message)
                .result(result)
                .build();
    }
}

