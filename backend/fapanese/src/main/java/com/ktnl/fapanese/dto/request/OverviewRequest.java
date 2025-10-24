package com.ktnl.fapanese.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OverviewRequest {
    Long courseId; // ID của Course
    String overviewTitle;
    String description;
}
