package com.ktnl.fapanese.dto.request;

import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.entity.Lecturer;
import lombok.*;


@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ClassCourseRequest {
    private Long id;
    private String className;
    private String semester;
    private Long courseId;
    private Lecturer lecturer;
}
