package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "material")
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private MaterialType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private Lecturer lecturer;

    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ClassMaterial> classMaterials = new HashSet<>();


    public enum MaterialType {
        RESOURCE, ASSIGNMENT, EXERCISE
    }
}
