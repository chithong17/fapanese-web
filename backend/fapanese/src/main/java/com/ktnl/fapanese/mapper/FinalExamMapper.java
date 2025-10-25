package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.FinalExamRequest;
import com.ktnl.fapanese.dto.response.FinalExamResponse;
import com.ktnl.fapanese.entity.FinalExam;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {QuestionMapper.class})
public interface FinalExamMapper {

    // 1. Map từ Request DTO -> Entity (TẠO MỚI)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overviewPart", ignore = true) // Set trong Service
    @Mapping(target = "questions", ignore = true) // Set trong Service
    FinalExam toFinalExam(FinalExamRequest request);

    // 2. Map từ Entity -> Response DTO (TRẢ VỀ)
    @Mapping(target = "overviewPartId", source = "overviewPart.id")
    // 'questions' sẽ tự động được 'QuestionMapper' xử lý
    FinalExamResponse toFinalExamResponse(FinalExam exam);

    // 3. CẬP NHẬT Entity có sẵn từ Request DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overviewPart", ignore = true)
    @Mapping(target = "questions", ignore = true)
    void updateFinalExam(@MappingTarget FinalExam exam, FinalExamRequest request);

    // 4. Map List
    List<FinalExamResponse> toFinalExamResponseList(List<FinalExam> exams);
}
