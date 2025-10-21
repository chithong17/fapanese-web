package com.ktnl.fapanese.entity;

import com.ktnl.fapanese.entity.enums.LessonPartType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "LessonPart")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonPart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    Lesson lesson;

    @Column(name = "title")
    String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    LessonPartType type;

    @OneToMany(mappedBy = "lessonPart", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<LessonSubPart> lessonSubParts = new HashSet<>();

    @OneToMany(mappedBy = "lessonPart", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Vocabulary> vocabularies = new HashSet<>();

    @OneToMany(mappedBy = "lessonPart", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Grammar> grammars = new HashSet<>();


    @OneToMany(mappedBy = "lessonPart", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Question> questions = new HashSet<>();
}