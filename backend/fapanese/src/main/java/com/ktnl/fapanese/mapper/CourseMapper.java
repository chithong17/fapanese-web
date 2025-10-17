package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.CourseRequest;
import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.entity.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lessons", ignore = true)
    Course toCourse(CourseRequest request);

    CourseResponse toCourseResponse(Course course);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lessons", ignore = true)
    void updateCourse(@MappingTarget Course course, CourseRequest request);
}