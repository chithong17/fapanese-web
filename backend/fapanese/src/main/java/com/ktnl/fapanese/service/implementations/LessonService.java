
package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.LessonRequest;
import com.ktnl.fapanese.dto.response.LessonRespone;
import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.LessonMapper;
import com.ktnl.fapanese.repository.CourseRepository;
import com.ktnl.fapanese.repository.LessonRepository;
import com.ktnl.fapanese.service.interfaces.ILessonService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LessonService implements ILessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    public LessonService(LessonRepository lessonRepository,  CourseRepository courseRepository) {

        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
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
    public LessonRespone getLessonByLessonId(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        return LessonMapper.toLessonResponse(lesson);
    }

    @Override
    public List<LessonRespone> findByCourseCode(String courseCode) {
        Course course = courseRepository.findByCode(courseCode)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        return course.getLessons().stream()
                .sorted(Comparator.comparing(Lesson::getOrderIndex))
                .map(lesson -> new LessonRespone(
                        lesson.getId(),
                        lesson.getLessonTitle(),
                        lesson.getDescription(),
                        lesson.getOrderIndex()
                ))
                .toList();
    }

    @Override
    public LessonRespone createLessonByCourseCode(LessonRequest request, String courseCode) {
        Course course = courseRepository.findByCode(courseCode)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        Lesson lesson = new Lesson();
        lesson.setLessonTitle(request.getLessonTitle());
        lesson.setDescription(request.getDescription());
        lesson.setOrderIndex(request.getOrderIndex());
        lesson.setCourse(course);

        Lesson savedLesson = lessonRepository.save(lesson);

        return LessonMapper.toLessonResponse(savedLesson);
    }


    @Override
    public LessonRespone updateLessonByCourseCode(LessonRequest request, String courseCode, Long lessonId) {
        Course course = courseRepository.findByCode(courseCode)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));

        if (!lesson.getCourse().getId().equals(course.getId())) {
            throw new AppException(ErrorCode.LESSON_NOT_FOUND);
        }

        lesson.setLessonTitle(request.getLessonTitle());
        lesson.setDescription(request.getDescription());
        lesson.setOrderIndex(request.getOrderIndex());

        Lesson updatedLesson = lessonRepository.save(lesson);

        return LessonMapper.toLessonResponse(updatedLesson);
    }


    @Override
    public void deleteLessonByCourseCode(String courseCode, Long lessonId) {
        var course = courseRepository.findByCode(courseCode)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        var lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));

        if (!lesson.getCourse().getId().equals(course.getId())) {
            throw new AppException(ErrorCode.LESSON_NOT_FOUND);
        }

        lessonRepository.delete(lesson);
    }

}
