package com.ktnl.fapanese.entity;

import com.ktnl.fapanese.entity.enums.SpeakingExamType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "SpeakingExam")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpeakingExam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "overview_part_id")
    OverviewPart overviewPart;

    @Column(name = "title")
    String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    SpeakingExamType type;

    @OneToMany(mappedBy = "speakingExam", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Speaking> speakings = new HashSet<>();
}
