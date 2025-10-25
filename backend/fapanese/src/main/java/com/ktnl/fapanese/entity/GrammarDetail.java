package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "GrammarDetail")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GrammarDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grammar_id")
    Grammar grammar;

    @Column(name = "structure")
    String structure;

    @Column(name = "meaning")
    String meaning;

    @Column(name = "example_sentence")
    String exampleSentence;

    @Column(name = "example_meaning")
    String exampleMeaning;
}
