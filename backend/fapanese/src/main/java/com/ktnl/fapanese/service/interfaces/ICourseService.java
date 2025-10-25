package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.CourseRequest;
import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.entity.Course;

import java.util.List;
import java.util.Optional;

public interface ICourseService {
    CourseResponse createCourse(CourseRequest request);
    List<CourseResponse> getAllCourses();
    CourseResponse getCourseById(Long id);
    CourseResponse updateCourse(Long id, CourseRequest request);
    void deleteCourse(Long id);
    Optional<Course> findByCode(String code);
}
