package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.response.SpeakingQuestionResponse;
import com.ktnl.fapanese.dto.response.SpeakingTestQuestionResponse;
import com.ktnl.fapanese.entity.SpeakingQuestion;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SpeakingTestQuestionMapper {
    SpeakingTestQuestionResponse toSpeakingTestQuestionResponse(SpeakingQuestion speakingQuestion);
    List<SpeakingTestQuestionResponse> toSpeakingQuestionResponseList(List<SpeakingQuestion> speakingQuestionList);
}
