package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "student_class")
public class StudentClass {
    @EmbeddedId
    private StudentClassId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("classCourseId")
    @JoinColumn(name = "class_course_id", nullable = false)
    private ClassCourse classCourse; // “aClass” vì “class” là từ khóa Java

    @Column(name = "enroll_date", nullable = false)
    private LocalDateTime enrollDate;
}
