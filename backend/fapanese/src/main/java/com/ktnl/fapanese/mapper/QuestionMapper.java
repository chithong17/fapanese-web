package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.response.QuestionResponse;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.entity.LessonPart;
import com.ktnl.fapanese.entity.Question;
import org.mapstruct.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    // 1. Map từ Request DTO -> Entity (TẠO MỚI)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lessonPart", ignore = true) // ✅ Sửa lỗi: Bỏ qua mối quan hệ LessonPart
    Question toQuestion(QuestionRequest request);

    // 2. Map từ Entity -> Response DTO (TRẢ VỀ)
    QuestionResponse toQuestionResponse(Question question);

    List<QuestionResponse> toQuestionResponseList(List<Question> questions);

    // 3. CẬP NHẬT Entity có sẵn từ Request DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lessonPart", ignore = true) // ✅ Sửa lỗi: Bỏ qua mối quan hệ LessonPart
    void updateQuestion(@MappingTarget Question question, QuestionRequest request);
}