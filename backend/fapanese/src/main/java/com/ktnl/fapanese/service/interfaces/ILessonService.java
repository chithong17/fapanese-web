package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.LessonRespone;

import java.util.List;

public interface ILessonService {
    List<LessonRespone> getAllLesson();
    List<LessonRespone> getLessonByCourseId(Long courseId);
    LessonRespone getLessonByLessonId(String lessonId);
}
