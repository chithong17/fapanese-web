package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.CourseResponse;
import java.util.List;

public interface ICourseService {
    List<CourseResponse> getAllCourses();
    CourseResponse getCourseById(Long id);
}
