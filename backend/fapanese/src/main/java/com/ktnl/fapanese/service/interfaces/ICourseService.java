package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.CourseRequest;
import com.ktnl.fapanese.dto.response.CourseResponse;

import java.util.List;

public interface ICourseService {
    CourseResponse createCourse(CourseRequest request);
    List<CourseResponse> getAllCourses();
    CourseResponse getCourseById(Long id);
    CourseResponse updateCourse(Long id, CourseRequest request);
    void deleteCourse(Long id);
}
