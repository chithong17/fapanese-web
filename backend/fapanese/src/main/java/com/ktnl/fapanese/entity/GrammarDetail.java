package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grammar_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grammar_id", nullable = false)
    private Grammar grammar;

    private String structure;
    private String meaning;
    private String example_sentence;
    private String example_meaning;
}
