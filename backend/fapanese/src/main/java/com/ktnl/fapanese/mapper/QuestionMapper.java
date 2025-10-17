package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.response.QuestionResponse;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.entity.Question;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    @Mapping(target = "lesson", expression = "java(toLesson(request.getLessonId()))")
    Question toQuestion(QuestionRequest request);

    @Mapping(source = "lesson.id", target = "lessonId")
    QuestionResponse toQuestionResponse(Question question);

    List<QuestionResponse> toQuestionResponseList(List<Question> questions);

    @Mapping(target = "lesson", expression = "java(toLesson(request.getLessonId()))")
    void updateQuestion(@MappingTarget Question question, QuestionRequest request);

    default Lesson toLesson(Long lessonId) {
        if (lessonId == null) return null;
        Lesson lesson = new Lesson();
        lesson.setId(lessonId);
        return lesson;
    }
}
