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

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lessonPart", ignore = true)
    Question toQuestion(QuestionRequest request);

    QuestionResponse toQuestionResponse(Question question);

    List<QuestionResponse> toQuestionResponseList(List<Question> questions);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lessonPart", ignore = true)
    void updateQuestion(@MappingTarget Question question, QuestionRequest request);
}
