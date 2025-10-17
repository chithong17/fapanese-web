package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.LessonResponse;

import java.util.List;

public interface ILessonService {
    List<LessonResponse> getAllLesson();
    List<LessonResponse> getLessonByCourseId(Long courseId);
    LessonResponse getLessonByLessonId(String lessonId);
}
