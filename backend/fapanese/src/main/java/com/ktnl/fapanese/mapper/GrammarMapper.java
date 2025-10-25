package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.GrammarRequest;
import com.ktnl.fapanese.dto.response.GrammarResponse;
import com.ktnl.fapanese.entity.Grammar;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {GrammarDetailMapper.class})
public interface GrammarMapper {

    // 1. Map từ Request DTO -> Entity (TẠO MỚI)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "explanation", source = "explanation")
    @Mapping(target = "lessonPart", ignore = true)
    @Mapping(target = "grammarDetails", ignore = true) // ✅ Sửa lỗi: Bỏ qua mối quan hệ
    Grammar toGrammar(GrammarRequest request);

    // 2. Map từ Entity -> Response DTO (TRẢ VỀ)
    // MapStruct sẽ tự ánh xạ GrammarDetails sang Details nhờ 'uses' và '@Mapping(source="grammarDetails", target="details")'
    @Mapping(target = "lessonPartId", source = "lessonPart.id")
    @Mapping(source = "grammarDetails", target = "details")
    GrammarResponse toGrammarResponse(Grammar grammar);

    // 3. CẬP NHẬT Entity có sẵn từ Request DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "explanation", source = "explanation")
    @Mapping(target = "lessonPart", ignore = true)
    @Mapping(target = "grammarDetails", ignore = true) // ✅ Sửa lỗi: Bỏ qua mối quan hệ
    void updateGrammar(@MappingTarget Grammar grammar, GrammarRequest request);
}