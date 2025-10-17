package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "grammar")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Grammar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String explaination;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @OneToMany(mappedBy = "grammar", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GrammarDetail> details = new HashSet<>();
}
