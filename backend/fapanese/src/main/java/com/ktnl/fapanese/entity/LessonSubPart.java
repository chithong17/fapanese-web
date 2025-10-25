package com.ktnl.fapanese.entity;

import com.ktnl.fapanese.entity.enums.LessonSubPartType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Entity
@Table(name = "LessonSubPart")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonSubPart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_part_id")
    LessonPart lessonPart;

    @Column(name = "title")
    String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    LessonSubPartType type;
}
