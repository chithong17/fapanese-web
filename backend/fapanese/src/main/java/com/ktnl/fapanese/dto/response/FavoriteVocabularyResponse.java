package com.ktnl.fapanese.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteVocabularyResponse {
    private Long id;
    private Long vocabularyId;
    private String wordKana;
    private String wordKanji;
    private String romaji;
    private String meaning;
    private String wordType;
    private LocalDateTime createdAt;
}
