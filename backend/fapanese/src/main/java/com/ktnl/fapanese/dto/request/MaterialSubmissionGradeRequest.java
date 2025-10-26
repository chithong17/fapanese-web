package com.ktnl.fapanese.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialSubmissionGradeRequest {
    private Double score;
    private String feedback;
}
