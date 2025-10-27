package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.ClassCourseRequest;
import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.entity.ClassCourse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ClassCourseMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "lecturer", ignore = true)
    ClassCourse toClassCourse(ClassCourseRequest request);

    @Mapping(target = "courseName", source = "course.courseName")
    ClassCourseRespone toClassCourseResponse(ClassCourse entity);

    List<ClassCourseRespone> toClassCourseResponses(List<ClassCourse> classes);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "lecturer", ignore = true)
    void updateClass(@MappingTarget ClassCourse classCourse, ClassCourseRequest request);
}
