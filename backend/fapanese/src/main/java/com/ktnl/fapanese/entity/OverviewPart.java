package com.ktnl.fapanese.entity;

import com.ktnl.fapanese.entity.enums.OverviewPartType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "OverviewPart")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OverviewPart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "overview_id")
    Overview overview;

    @Column(name = "title")
    String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    OverviewPartType type;

    @Builder.Default
    @OneToMany(mappedBy = "overviewPart", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<SpeakingExam> speakingExams = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "overviewPart", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<FinalExam> finalExams = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "overviewPart", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<MiddleExam> middleExams = new HashSet<>();
}
