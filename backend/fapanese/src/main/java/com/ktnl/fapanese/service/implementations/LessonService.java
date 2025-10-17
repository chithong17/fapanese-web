
package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.response.LessonRespone;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.mapper.LessonMapper;
import com.ktnl.fapanese.repository.LessonRepository;
import com.ktnl.fapanese.service.interfaces.ILessonService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LessonService implements ILessonService {

    private final LessonRepository lessonRepository;

    public LessonService(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }


    @Override
    public List<LessonRespone> getAllLesson() {
        return lessonRepository.findAll()
                .stream()
                .map(LessonMapper::toLessonResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LessonRespone> getLessonByCourseId(Long courseId) {
        return lessonRepository.findByCourseId(courseId)
                .stream()
                .map(LessonMapper::toLessonResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LessonRespone getLessonByLessonId(String lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        return LessonMapper.toLessonResponse(lesson);
    }
}
