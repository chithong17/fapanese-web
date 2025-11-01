package com.ktnl.fapanese.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class GradingSpeakingTestRequest {
    private String passageTranscript;
    private String passageOriginal;
    private String pictureQuestion;
    private String pictureAnswerTranscript;
    private String pictureAnswerSample;
    private String q1Question;
    private String q1AnswerTranscript;
    private String q1AnswerSample;
    private String q2Question;
    private String q2AnswerTranscript;
    private String q2AnswerSample;
}
