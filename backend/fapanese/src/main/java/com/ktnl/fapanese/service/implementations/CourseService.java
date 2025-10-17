package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.mapper.CourseMapper;
import com.ktnl.fapanese.repository.CourseRepository;
import com.ktnl.fapanese.service.interfaces.ICourseService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService implements ICourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    public CourseService(CourseRepository courseRepository, CourseMapper courseMapper) {
        this.courseRepository = courseRepository;
        this.courseMapper = courseMapper;
    }

    @Override
    public List<CourseResponse> getAllCourses() {
        return courseMapper.toResponseList(courseRepository.findAll());
    }

    @Override
    public CourseResponse getCourseById(Long id) {
        return courseMapper.toResponse(courseRepository.findById(id).orElse(null));
    }
}
