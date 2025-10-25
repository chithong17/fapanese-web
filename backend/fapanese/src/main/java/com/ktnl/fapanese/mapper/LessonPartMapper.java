package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.response.LessonPartSimpleResponse;
import com.ktnl.fapanese.entity.LessonPart;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LessonPartMapper {

    LessonPartSimpleResponse toLessonPartSimpleResponse(LessonPart lessonPart);

    List<LessonPartSimpleResponse> toLessonPartSimpleResponseList(List<LessonPart> lessonParts);

}