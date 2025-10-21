package com.ktnl.fapanese.entity;

import com.ktnl.fapanese.entity.enums.QuestionCategory;
import com.ktnl.fapanese.entity.enums.QuestionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Question")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    QuestionCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type")
    QuestionType questionType;

    @Column(name = "option_a")
    String optionA;

    @Column(name = "option_b")
    String optionB;

    @Column(name = "option_c")
    String optionC;

    @Column(name = "option_d")
    String optionD;

    @Column(name = "correct_answer")
    String correctAnswer;

    @Column(name = "fill_answer")
    String fillAnswer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_part_id", nullable = false)
    LessonPart lessonPart;
}
