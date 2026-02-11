package com.ktnl.fapanese.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteVocabularyRequest {
    private Long vocabularyId;
}
