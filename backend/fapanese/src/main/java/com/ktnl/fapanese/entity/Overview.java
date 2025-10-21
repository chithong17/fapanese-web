package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Overview")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Overview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    Course course;

    @Column(name = "overview_title")
    String overviewTitle;

    @Column(name = "description")
    String description;

    @OneToMany(mappedBy = "overview", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<OverviewPart> overviewParts = new HashSet<>();
}
