package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.response.LessonRespone;
import com.ktnl.fapanese.entity.Lesson;

public interface LessonMapper {
    static LessonRespone toLessonResponse(Lesson lesson) {
        if (lesson == null) return null;
        return LessonRespone.builder()
                .id(lesson.getId())
                .lessonTitle(lesson.getLessonTitle())
                .orderIndex(lesson.getOrderIndex())
                .courseId(lesson.getCourse() != null ? lesson.getCourse().getId() : null)
                .build();
    }
}
