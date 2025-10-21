package com.ktnl.fapanese.entity;

import com.ktnl.fapanese.entity.enums.FinalExamType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "MiddleExam")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MiddleExam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "overview_part_id")
    OverviewPart overviewPart;

    @Column(name = "exam_title")
    String examTitle;

    @Column(name = "semester")
    String semester;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    FinalExamType type;

    @Column(name = "year")
    int year;

    // Bảng `MiddleExamQuestion` được xử lý bằng @ManyToMany
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "MiddleExamQuestion",
            joinColumns = @JoinColumn(name = "exam_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    Set<Question> questions = new HashSet<>();
}
