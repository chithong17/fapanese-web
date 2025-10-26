package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "material_submission")
public class MaterialSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_course_id", nullable = false)
    private ClassCourse classCourse;

    private LocalDateTime submittedAt;
    private String fileUrl;
    private String fileType;
    private String submissionText;
    private String submissionLink;
    private Double score;
    private String feedback;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        PENDING, SUBMITTED, GRADED
    }
}
