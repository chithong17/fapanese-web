package com.ktnl.fapanese.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuestionRequest {
    private Long lessonPartId;
    private String content;
    private String category;
    private String questionType;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String fillAnswer;

}
