package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.response.QuestionResponse;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.entity.Question;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "course", ignore = true)
    Question toQuestion(QuestionRequest request);

    @Mapping(target = "courseId", source = "course.id")
    QuestionResponse toQuestionResponse(Question question);

    List<QuestionResponse> toQuestionResponseList(List<Question> questions);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "course", ignore = true)
    void updateQuestion(@MappingTarget Question question, QuestionRequest request);

    default Lesson toLesson(Long lessonId) {
        if (lessonId == null) return null;
        Lesson lesson = new Lesson();
        lesson.setId(lessonId);
        return lesson;
    }
}
