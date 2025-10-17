package com.ktnl.fapanese.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyResponse {
    private Long id;
    private String wordKana;
    private String wordKanji;
    private String romaji;
    private String meaning;
    private String wordType;
    private String lessonId;
}
