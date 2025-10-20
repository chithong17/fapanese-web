package com.ktnl.fapanese.dto.request;

import com.ktnl.fapanese.entity.enums.SpeakingType;
import jakarta.persistence.Column;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingRequest {
    private Long id;
    private String topic;
    private String imgUrl;
    private SpeakingType  speakingType;
    private String passage;
    private String passageRomaji;
    private String passageMeaning;
    private String description;
}
