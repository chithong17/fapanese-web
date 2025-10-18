package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.response.QuestionResponse;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.entity.Question;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    Question toQuestion(QuestionRequest request);

    QuestionResponse toQuestionResponse(Question question);

    List<QuestionResponse> toQuestionResponseList(List<Question> questions);

    void updateQuestion(@MappingTarget Question question, QuestionRequest request);

    default Lesson toLesson(Long lessonId) {
        if (lessonId == null) return null;
        Lesson lesson = new Lesson();
        lesson.setId(lessonId);
        return lesson;
    }
}
