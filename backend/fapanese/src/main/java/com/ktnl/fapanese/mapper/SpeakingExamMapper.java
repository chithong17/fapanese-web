package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.SpeakingExamRequest;
import com.ktnl.fapanese.dto.response.SpeakingExamResponse;
import com.ktnl.fapanese.entity.SpeakingExam;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

// 👈 Quan trọng: 'uses' SpeakingMapper
@Mapper(componentModel = "spring", uses = {SpeakingMapper.class})
public interface SpeakingExamMapper {

    // 1. Map từ Request DTO -> Entity (TẠO MỚI)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overviewPart", ignore = true) // Set trong Service
    @Mapping(target = "speakings", ignore = true) // Quản lý ở Service con
    SpeakingExam toSpeakingExam(SpeakingExamRequest request);

    // 2. Map từ Entity -> Response DTO (TRẢ VỀ)
    @Mapping(target = "overviewPartId", source = "overviewPart.id")
    // 'speakings' sẽ tự động được 'SpeakingMapper' xử lý
    SpeakingExamResponse toSpeakingExamResponse(SpeakingExam speakingExam);

    // 3. CẬP NHẬT Entity có sẵn từ Request DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overviewPart", ignore = true)
    @Mapping(target = "speakings", ignore = true)
    void updateSpeakingExam(@MappingTarget SpeakingExam speakingExam, SpeakingExamRequest request);

    // 4. Map List
    List<SpeakingExamResponse> toSpeakingExamResponseList(List<SpeakingExam> speakingExams);
}
