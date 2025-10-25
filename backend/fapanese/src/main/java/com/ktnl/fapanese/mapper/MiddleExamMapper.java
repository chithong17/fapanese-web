package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.MiddleExamRequest;
import com.ktnl.fapanese.dto.response.MiddleExamResponse;
import com.ktnl.fapanese.entity.MiddleExam;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {QuestionMapper.class})
public interface MiddleExamMapper {

    // 1. Map từ Request DTO -> Entity (để TẠO MỚI)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overviewPart", ignore = true) // Sẽ set thủ công trong Service
    @Mapping(target = "questions", ignore = true) // Sẽ set thủ công trong Service
    MiddleExam toMiddleExam(MiddleExamRequest request);

    
    // 'questions' sẽ tự động được 'QuestionMapper' xử lý
    MiddleExamResponse toMiddleExamResponse(MiddleExam exam);

    // 3. Map để CẬP NHẬT Entity có sẵn từ Request DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overviewPart", ignore = true)
    @Mapping(target = "questions", ignore = true)
    void updateMiddleExam(@MappingTarget MiddleExam exam, MiddleExamRequest request);

    // 4. Map List (để trả về danh sách)
    List<MiddleExamResponse> toMiddleExamResponseList(List<MiddleExam> exams);
}
