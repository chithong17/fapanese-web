package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.response.FavoriteVocabularyResponse;
import com.ktnl.fapanese.entity.FavoriteVocabulary;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FavoriteVocabularyMapper {

    @Mapping(source = "vocabulary.id", target = "vocabularyId")
    @Mapping(source = "vocabulary.wordKana", target = "wordKana")
    @Mapping(source = "vocabulary.wordKanji", target = "wordKanji")
    @Mapping(source = "vocabulary.romaji", target = "romaji")
    @Mapping(source = "vocabulary.meaning", target = "meaning")
    @Mapping(source = "vocabulary.wordType", target = "wordType")
    FavoriteVocabularyResponse toResponse(FavoriteVocabulary entity);

    List<FavoriteVocabularyResponse> toResponseList(List<FavoriteVocabulary> entities);
}
