package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "character_entity") // tránh tên reserved
public class CharacterEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String characterValue;
    private String romaji;
    private String type;
    private String category;
    private Integer orderIndex;
}
