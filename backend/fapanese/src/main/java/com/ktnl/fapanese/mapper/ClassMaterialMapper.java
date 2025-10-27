package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.dto.response.ClassMaterialResponse;
import com.ktnl.fapanese.entity.ClassCourse;
import com.ktnl.fapanese.entity.ClassMaterial;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ClassMaterialMapper {
    ClassMaterialResponse toClassMaterialResponse(ClassMaterial classMaterial);
    List<ClassMaterialResponse> toClassMaterialResponses(List<ClassMaterial> classMaterial);
}
