package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "speaking_question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String question;
    private String questionRomaji;
    private String questionMeaning;

    private String answer;
    private String answerRomaji;
    private String answerMeaning;

    @ManyToOne
    @JoinColumn(name = "speaking_id")
    private Speaking speaking;
}
