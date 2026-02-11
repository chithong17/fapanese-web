package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.FavoriteVocabularyResponse;

import java.util.List;

public interface IFavoriteVocabularyService {
    void addFavorite(String email, Long vocabularyId);

    void removeFavorite(String email, Long vocabularyId);

    List<Long> getFavoriteIds(String email);

    List<FavoriteVocabularyResponse> getAllFavorites(String email);
}
