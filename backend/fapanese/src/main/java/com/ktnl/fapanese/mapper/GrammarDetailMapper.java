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

    // 1. Map từ Request DTO -> Entity (TẠO MỚI)
    @Mapping(target = "grammar", ignore = true)
    @Mapping(target = "exampleSentence", ignore = true) // ✅ Sửa lỗi Unmapped target property
    @Mapping(target = "exampleMeaning", ignore = true)   // ✅ Sửa lỗi Unmapped target property
    GrammarDetail toGrammarDetail(GrammarDetailRequest request);

    // 2. Map từ Entity -> Response DTO (TRẢ VỀ)
    GrammarDetailResponse toGrammarDetailResponse(GrammarDetail detail);

    Set<GrammarDetailResponse> toGrammarDetailResponseList(Set<GrammarDetail> details);

    // 3. CẬP NHẬT Entity có sẵn từ Request DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "grammar", ignore = true)
    @Mapping(target = "exampleSentence", ignore = true) // ✅ Sửa lỗi Unmapped target property
    @Mapping(target = "exampleMeaning", ignore = true)   // ✅ Sửa lỗi Unmapped target property
    void updateGrammarDetail(@MappingTarget GrammarDetail detail, GrammarDetailRequest request);
}