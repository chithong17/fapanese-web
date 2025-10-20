package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.LessonRespone;
import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.entity.Lesson;

import java.util.List;

public interface ILessonService {
    List<LessonRespone> getAllLesson();
    List<LessonRespone> getLessonByCourseId(Long courseId);
    LessonRespone getLessonByLessonId(Long lessonId);
    List<LessonRespone> findByCourseCode(String course);
}
