package com.ktnl.fapanese.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyRequest {
    private String wordKana;
    private String wordKanji;
    private String romaji;
    private String meaning;
    private String wordType;
    private Long lessonPartId;
}
