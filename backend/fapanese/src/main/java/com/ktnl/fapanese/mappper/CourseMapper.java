package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.entity.Course;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    CourseMapper INSTANCE = Mappers.getMapper(CourseMapper.class);

    CourseResponse toResponse(Course course);

    List<CourseResponse> toResponseList(List<Course> courses);
}
