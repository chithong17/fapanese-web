package com.ktnl.fapanese.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionCheckResponse {
    private Long questionId;
    private String questionType; // Loại câu hỏi (để biết nên dùng đáp án nào)
    private boolean isCorrect;
    private String userAnswer;
    private String correctAnswer;
}
