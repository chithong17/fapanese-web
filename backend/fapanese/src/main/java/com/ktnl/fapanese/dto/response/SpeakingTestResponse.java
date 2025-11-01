package com.ktnl.fapanese.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpeakingTestResponse {
    SpeakingTestItemResponse passagePart;
    SpeakingTestItemResponse picturePart;
    SpeakingTestItemResponse questionPart;
}
