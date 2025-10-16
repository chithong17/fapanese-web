package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "character")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Character {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String character;
    private String romaji;
    private String type;
    private String category;
    private Integer orderIndex;
}
