package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.response.LessonResponse;
import com.ktnl.fapanese.entity.Lesson;

public interface LessonMapper {
    static LessonResponse toLessonResponse(Lesson lesson) {
        if (lesson == null) return null;
        return LessonResponse.builder()
                .id(lesson.getId())
                .lessonTitle(lesson.getLessonTitle())
                .orderIndex(lesson.getOrderIndex())
                .courseId(lesson.getCourse() != null ? lesson.getCourse().getId() : null)
                .build();
    }
}
