package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.MaterialSubmissionGradeRequest;
import com.ktnl.fapanese.dto.request.MaterialSubmissionRequest;
import com.ktnl.fapanese.dto.response.MaterialSubmissionResponse;

import java.util.List;

public interface IMaterialSubmissionService {
    MaterialSubmissionResponse submit(MaterialSubmissionRequest request);
    MaterialSubmissionResponse grade(Long id, MaterialSubmissionGradeRequest request);
    List<MaterialSubmissionResponse> getByMaterial(Long materialId);
    List<MaterialSubmissionResponse> getByStudent(String studentId);
    List<MaterialSubmissionResponse> getByClassCourse(Long classCourseId);
}
