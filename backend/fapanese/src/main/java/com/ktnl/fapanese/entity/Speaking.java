package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "speaking")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Speaking {
    @Id
    private String id;

    private String topic;
    private String type;
    private String imgUrl;

    @Column(columnDefinition = "TEXT")
    private String passage;
    @Column(columnDefinition = "TEXT")
    private String passageRomaji;
    @Column(columnDefinition = "TEXT")
    private String passageMeaning;
    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @OneToMany(mappedBy = "speaking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpeakingQuestion> speakingQuestions;


}
