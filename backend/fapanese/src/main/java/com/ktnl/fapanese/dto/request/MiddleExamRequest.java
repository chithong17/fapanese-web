package com.ktnl.fapanese.dto.request;

import com.ktnl.fapanese.entity.enums.FinalExamType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MiddleExamRequest {
    Long overviewPartId;
    String examTitle;
    String semester;
    FinalExamType type;
    int year;
    Set<Long> questionIds; // Danh sách ID của Question
}
