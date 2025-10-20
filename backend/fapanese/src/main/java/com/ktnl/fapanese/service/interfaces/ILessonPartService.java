package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.LessonPartSimpleResponse;

import java.util.List;

public interface ILessonPartService {
    List<LessonPartSimpleResponse> getLessonPartsByLesson(Long lessonId);

}
