package com.ktnl.fapanese.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionResponse {
    Long id;
    String content;
    String category;
    String questionType;

    String optionA;
    String optionB;
    String optionC;
    String optionD;
    String correctAnswer;
    String fillAnswer;

}
