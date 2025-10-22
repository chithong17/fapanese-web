package com.ktnl.fapanese.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ktnl.fapanese.entity.enums.FinalExamType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FinalExamResponse {
    Long id;
    Long overviewPartId;
    String examTitle;
    String semester;
    FinalExamType type;
    int year;
    Set<QuestionResponse> questions; // 👈 Dùng DTO
}
