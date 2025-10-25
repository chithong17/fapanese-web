package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.SpeakingRequest;
import com.ktnl.fapanese.dto.response.SpeakingRespone;
import com.ktnl.fapanese.entity.Speaking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SpeakingMapper {

    // 🧱 1️⃣ Map từ DTO -> Entity (khi tạo mới)
    @Mapping(target = "id", ignore = true) // ID sẽ tự sinh bởi DB
    @Mapping(target = "speakingExam", ignore = true) // Không map ở đây, set trong Service
    @Mapping(target = "speakingQuestions", ignore = true) // Bỏ qua để xử lý riêng
    @Mapping(target = "type", source = "speakingType") // Map trường enum
    Speaking toSpeaking(SpeakingRequest request);

    // 🧱 2️⃣ Map từ Entity -> DTO (khi trả dữ liệu ra)
    @Mapping(target = "speakingType", source = "type")
    SpeakingRespone toSpeakingResponse(Speaking speaking);

    // 🧱 3️⃣ Cập nhật Entity có sẵn từ DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "speakingExam", ignore = true)
    @Mapping(target = "speakingQuestions", ignore = true)
    @Mapping(target = "type", source = "speakingType")
    void updateSpeaking(@MappingTarget Speaking speaking, SpeakingRequest request);
}
