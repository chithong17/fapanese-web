package com.ktnl.fapanese.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeakingQuestionRequest {
    // ID của bài Speaking cha
    private Long speakingId;

    private String question;
    private String questionRomaji;
    private String questionMeaning;
    private String answer;
    private String answerRomaji;
    private String answerMeaning;
}
