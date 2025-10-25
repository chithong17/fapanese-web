package com.ktnl.fapanese.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonRequest {
    String lessonTitle;
    String description;
    Integer orderIndex;
    Long courseId;
}
