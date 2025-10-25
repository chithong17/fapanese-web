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

    @Lob
    // Chỉ định rõ ràng kiểu cột là "TEXT" (hoặc "LONGTEXT" nếu bạn muốn)
    @Column(name = "passage", columnDefinition="TEXT")
    String passage;

    @Lob
    @Column(name = "passage_romaji", columnDefinition="TEXT")
    String passageRomaji;

    @Lob
    @Column(name = "passage_meaning", columnDefinition="TEXT")
    String passageMeaning;

    @Lob
    @Column(name = "description", columnDefinition="TEXT")
    String description;

    @Builder.Default
    @OneToMany(mappedBy = "speaking", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<SpeakingQuestion> speakingQuestions = new HashSet<>();
}