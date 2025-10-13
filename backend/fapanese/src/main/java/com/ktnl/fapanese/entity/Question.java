package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "question")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String category;
    private String questionType;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;

    private String fillAnswer;

    @ManyToMany
    @JoinTable(
            name = "vocabulary_question",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "vocab_id")
    )
    private List<Vocabulary> vocabularies;

    @ManyToMany
    @JoinTable(
            name = "grammar_question",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "grammar_id")
    )
    private List<Grammar> grammars;
}
