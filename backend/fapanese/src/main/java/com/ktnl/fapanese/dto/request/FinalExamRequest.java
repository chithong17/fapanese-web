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
public class FinalExamRequest {
    private Long overviewPartId; // ID của OverviewPart
    private String examTitle;
    private String semester;
    private FinalExamType type;
    private int year;
    private Set<Long> questionIds; // Danh sách ID của Question
}
