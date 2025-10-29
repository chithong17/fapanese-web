package com.ktnl.fapanese.mapper;


import com.ktnl.fapanese.dto.response.StudentClassResponse;
import com.ktnl.fapanese.entity.StudentClass;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import javax.xml.transform.Source;
import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ClassCourseMapper.class})
public interface StudentClassMapper {
    StudentClassResponse toStudentClassResponse(StudentClass studentClass);
    List<StudentClassResponse> toStudentClassResponses(List<StudentClass> list);
}
