package com.ktnl.fapanese.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class LessonResponse {
    private String id;
    private String lessonTitle;
    private Integer orderIndex;
    private Long courseId;
}
