package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "grammar")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Grammar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String structure;
    private String meaning;

    @Column(columnDefinition = "TEXT")
    private String explaination;

    @Column(columnDefinition = "TEXT")
    private String exampleSentence;

    private String exampleMeaning;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @ManyToMany(mappedBy = "grammars")
    private List<Question> questions;
}
