package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.SpeakingQuestionRequest;
import com.ktnl.fapanese.dto.response.SpeakingExamResponse;
import com.ktnl.fapanese.dto.response.SpeakingQuestionResponse;
import com.ktnl.fapanese.entity.SpeakingExam;
import com.ktnl.fapanese.entity.SpeakingQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SpeakingQuestionMapper {

    @Mapping(source = "speaking.id", target = "speakingId")
    SpeakingQuestionResponse toSpeakingQuestionResponse(SpeakingQuestion speakingQuestion);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "speaking", ignore = true)
    SpeakingQuestion toSpeakingQuestion(SpeakingQuestionRequest speakingQuestionRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "speaking", ignore = true)
    void updateSpeakingQuestion(@MappingTarget SpeakingQuestion entity, SpeakingQuestionRequest request);

    List<SpeakingQuestionResponse> toSpeakingQuestionResponseList(List<SpeakingQuestion> speakingQuestions);
}
