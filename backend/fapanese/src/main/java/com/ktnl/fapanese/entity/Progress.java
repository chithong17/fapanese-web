package com.ktnl.fapanese.entity;

import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.entity.ProgressId;
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
@Table(name = "progress")

public class Progress {

    @EmbeddedId
    private ProgressId progressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("lessonId")
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "percent_complete", nullable = false)
    private int percentComplete;

    @Column(name = "last_accessed")
    private LocalDateTime lastAccessed;
}
