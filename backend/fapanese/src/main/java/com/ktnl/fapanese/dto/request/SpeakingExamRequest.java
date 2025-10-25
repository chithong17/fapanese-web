package com.ktnl.fapanese.dto.request;


import com.ktnl.fapanese.entity.enums.SpeakingExamType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeakingExamRequest {
    private Long overviewPartId; // ID của OverviewPart cha
    private String title;
    private SpeakingExamType type;
}
