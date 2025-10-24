package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.response.SpeakingQuestionResponse;
import com.ktnl.fapanese.entity.SpeakingQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SpeakingQuestionMapper {
    SpeakingQuestionResponse toSpeakingQuestionResponse(SpeakingQuestion speakingQuestion);
}
