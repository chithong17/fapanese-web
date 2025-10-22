package com.ktnl.fapanese.dto.response;

import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.entity.Lecturer;
import lombok.*;


@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ClassCourseRespone {
    private Long id;
    private String className;
    private String semester;
    private String courseName;
    private String lecturerName;
}
