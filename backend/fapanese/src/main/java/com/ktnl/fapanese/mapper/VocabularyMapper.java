package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.VocabularyRequest;
import com.ktnl.fapanese.dto.response.VocabularyResponse;
import com.ktnl.fapanese.entity.Vocabulary;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VocabularyMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lesson", ignore = true) // sẽ gán thủ công trong service
    Vocabulary toVocabulary(VocabularyRequest request);

    @Mapping(target = "lessonId", source = "lesson.id")
    VocabularyResponse toVocabularyResponse(Vocabulary vocabulary);

    List<VocabularyResponse> toVocabularyResponseList(List<Vocabulary> vocabularies);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lesson", ignore = true)
    void updateVocabulary(@MappingTarget Vocabulary vocabulary, VocabularyRequest request);
}
