package com.ktnl.fapanese.dto.response;

import com.ktnl.fapanese.entity.enums.LessonPartType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonPartSimpleResponse {
    private Long id;
    private LessonPartType type;
    private String title;
}
