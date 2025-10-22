package com.ktnl.fapanese.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OverviewResponse {
    private Long id;
    private Long courseId;
    private String overviewTitle;
    private String description;

    // 👈 Dùng DTO, không dùng Entity
    private Set<OverviewPartResponse> overviewParts;
}
