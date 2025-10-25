package com.ktnl.fapanese.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ktnl.fapanese.entity.SpeakingQuestion;
import com.ktnl.fapanese.entity.enums.SpeakingType;
import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpeakingRespone {
    Long id;
    String topic;
    String imgUrl;
    SpeakingType  speakingType;
    String passage;
    String passageRomaji;
    String passageMeaning;
    String description;
    Set<SpeakingQuestionResponse> speakingQuestions = new HashSet<>();
}
