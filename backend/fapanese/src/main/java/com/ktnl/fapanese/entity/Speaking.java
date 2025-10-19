package com.ktnl.fapanese.entity;

import com.ktnl.fapanese.entity.enums.SpeakingType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Speaking")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Speaking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    // Tên cột "speaking_exam_id" trong schema trỏ đến "SpeakingExam.id"
    // nên ta map nó với speakingExam
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "speaking_exam_id")
    SpeakingExam speakingExam;

    @Column(name = "topic")
    String topic;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    SpeakingType type;

    @Column(name = "img_url")
    String imgUrl;

    @Column(name = "passage")
    String passage;

    @Column(name = "passage_romaji")
    String passageRomaji;

    @Column(name = "passage_meaning")
    String passageMeaning;

    @Column(name = "description")
    String description;

    @OneToMany(mappedBy = "speaking", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<SpeakingQuestion> speakingQuestions = new HashSet<>();
}
