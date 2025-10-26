package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.MaterialSubmissionRequest;
import com.ktnl.fapanese.dto.response.MaterialSubmissionResponse;
import com.ktnl.fapanese.entity.MaterialSubmission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MaterialSubmissionMapper {

    MaterialSubmission toEntity(MaterialSubmissionRequest request);

    @Mapping(source = "student.id", target = "studentId")
    @Mapping(expression = "java(submission.getStudent().getFirstName() + \" \" + submission.getStudent().getLastName())", target = "studentName")
    @Mapping(source = "material.id", target = "materialId")
    @Mapping(source = "material.title", target = "materialTitle")
    @Mapping(source = "classCourse.id", target = "classCourseId")
    @Mapping(source = "classCourse.className", target = "className")
    MaterialSubmissionResponse toResponse(MaterialSubmission submission);

    List<MaterialSubmissionResponse> toResponseList(List<MaterialSubmission> submissions);
}
