package com.ktnl.fapanese.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ktnl.fapanese.entity.ClassCourse;
import com.ktnl.fapanese.entity.StudentClassId;
import com.ktnl.fapanese.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentClassResponse {
    private StudentClassId id;
    private UserResponse student;
    private ClassCourseRespone classCourse;
    private LocalDateTime enrollDate;
}
