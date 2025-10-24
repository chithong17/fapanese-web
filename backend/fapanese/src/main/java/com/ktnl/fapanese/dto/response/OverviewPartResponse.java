package com.ktnl.fapanese.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ktnl.fapanese.entity.enums.OverviewPartType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OverviewPartResponse {
    private Long id;
    private Long overviewId;
    private String title;
    private OverviewPartType type;

}
