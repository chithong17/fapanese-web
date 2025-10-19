package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Entity
@Table(name = "Vocabulary")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Vocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_part_id")
    LessonPart lessonPart;

    @Column(name = "word_kana")
    String wordKana;

    @Column(name = "word_kanji")
    String wordKanji;

    @Column(name = "romaji")
    String romaji;

    @Column(name = "meaning")
    String meaning;

    @Column(name = "word_type")
    String wordType;
}
