package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.GrammarRequest;
import com.ktnl.fapanese.dto.response.GrammarResponse;
import com.ktnl.fapanese.entity.Grammar;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {GrammarDetailMapper.class})
public interface GrammarMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "grammarDetails", ignore = true)
    @Mapping(target = "explanation", source = "explanation")
    Grammar toGrammar(GrammarRequest request);

    GrammarResponse toGrammarResponse(Grammar grammar);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "grammarDetails", ignore = true)
    @Mapping(target = "explanation", source = "explanation")
    void updateGrammar(@MappingTarget Grammar grammar, GrammarRequest request);
}
