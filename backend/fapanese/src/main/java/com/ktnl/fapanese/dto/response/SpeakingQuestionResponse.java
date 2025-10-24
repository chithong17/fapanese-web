package com.ktnl.fapanese.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ktnl.fapanese.entity.Speaking;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpeakingQuestionResponse {
    Long id;
    String question;
    String questionRomaji;
    String questionMeaning;
    String answer;
    String answerRomaji;
    String answerMeaning;
}
