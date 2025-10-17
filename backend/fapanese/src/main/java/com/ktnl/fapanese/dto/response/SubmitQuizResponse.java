package com.ktnl.fapanese.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitQuizResponse {
    private int totalQuestions;
    private int correctCount;
    private double scorePercentage;
    private List<QuestionCheckResponse> detailedResults;
}