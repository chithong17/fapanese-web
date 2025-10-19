package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Entity
@Table(name = "SpeakingQuestion")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpeakingQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "speaking_id")
    Speaking speaking;

    @Column(name = "question")
    String question;

    @Column(name = "question_romaji")
    String questionRomaji;

    @Column(name = "question_meaning")
    String questionMeaning;

    @Column(name = "answer")
    String answer;

    @Column(name = "answer_romaji")
    String answerRomaji;

    @Column(name = "answer_meaning")
    String answerMeaning;
}
