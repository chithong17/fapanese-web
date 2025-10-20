package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.GrammarDetailRequest;
import com.ktnl.fapanese.dto.response.GrammarDetailResponse;
import com.ktnl.fapanese.entity.GrammarDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface GrammarDetailMapper {

    @Mapping(target = "grammar", ignore = true)
    GrammarDetail toGrammarDetail(GrammarDetailRequest request);

    GrammarDetailResponse toGrammarDetailResponse(GrammarDetail detail);

    Set<GrammarDetailResponse> toGrammarDetailResponseList(Set<GrammarDetail> details);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "grammar", ignore = true)
    void updateGrammarDetail(@MappingTarget GrammarDetail detail, GrammarDetailRequest request);
}
