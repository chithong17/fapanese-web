package com.ktnl.fapanese.dto.request;


import com.ktnl.fapanese.entity.enums.OverviewPartType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverviewPartRequest {
    private Long overviewId; // ID của Overview cha
    private String title;
    private OverviewPartType type;
}
