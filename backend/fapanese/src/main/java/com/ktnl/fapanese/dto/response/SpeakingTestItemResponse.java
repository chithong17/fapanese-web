package com.ktnl.fapanese.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ktnl.fapanese.entity.enums.SpeakingType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpeakingTestItemResponse {
    Long id;
    String topic;
    String imgUrl;
    SpeakingType speakingType;
    String passage;
    List<SpeakingTestQuestionResponse> questions;
}
