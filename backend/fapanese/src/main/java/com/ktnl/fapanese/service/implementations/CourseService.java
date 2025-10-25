package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.CourseRequest;
import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.CourseMapper;
import com.ktnl.fapanese.repository.CourseRepository;
import com.ktnl.fapanese.service.interfaces.ICourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService implements ICourseService {
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    @Override
    public CourseResponse createCourse(CourseRequest request) {

        Course newCourse = courseMapper.toCourse(request);

         if (newCourse.getCourseName() == null || newCourse.getCourseName().trim().isEmpty()) {
             throw new AppException(ErrorCode.INVALID_COURSE_NAME);
         }

        Course savedCourse = courseRepository.save(newCourse);

        return courseMapper.toCourseResponse(savedCourse);
    }

    @Override
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return courseMapper.toCourseResponse(course);
    }

    @Override
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        courseMapper.updateCourse(course, request);

        Course updatedCourse = courseRepository.save(course);

        return courseMapper.toCourseResponse(updatedCourse);
    }

    @Override
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new AppException(ErrorCode.COURSE_NOT_FOUND);
        }
        courseRepository.deleteById(id);
    }

    @Override
    public Optional<Course> findByCode(String code) {
        return courseRepository.findByCode(code);
    }
}
