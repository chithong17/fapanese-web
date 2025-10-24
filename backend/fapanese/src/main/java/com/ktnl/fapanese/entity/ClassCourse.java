package com.ktnl.fapanese.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "class_course") // ✅ đổi tên bảng trong DB để tránh trùng keyword SQL "class"
public class ClassCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "class_name", nullable = false)
    String className;

    @Column(nullable = false)
    String semester;

    // Many-to-One: N class thuộc 1 course
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    @JsonIgnore
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // Many-to-One: N class do 1 lecturer dạy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private Lecturer lecturer;
}
