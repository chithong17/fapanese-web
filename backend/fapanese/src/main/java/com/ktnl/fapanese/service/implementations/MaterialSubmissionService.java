package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.MaterialSubmissionGradeRequest;
import com.ktnl.fapanese.dto.request.MaterialSubmissionRequest;
import com.ktnl.fapanese.dto.response.MaterialSubmissionResponse;
import com.ktnl.fapanese.entity.*;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.MaterialSubmissionMapper;
import com.ktnl.fapanese.repository.*;
import com.ktnl.fapanese.service.interfaces.IMaterialSubmissionService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MaterialSubmissionService implements IMaterialSubmissionService {

    MaterialSubmissionRepository submissionRepository;
    MaterialRepository materialRepository;
    StudentRepository studentRepository;
    ClassCourseRepository classCourseRepository;
    MaterialSubmissionMapper mapper;

    @Override
    @Transactional
    public MaterialSubmissionResponse submit(MaterialSubmissionRequest request) {
        Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new AppException(ErrorCode.MATERIAL_NOT_FOUND));
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        ClassCourse classCourse = classCourseRepository.findById(request.getClassCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CLASS_NAME));

        MaterialSubmission submission = MaterialSubmission.builder()
                .material(material)
                .student(student)
                .classCourse(classCourse)
                .fileUrl(request.getFileUrl())
                .fileType(request.getFileType())
                .submissionText(request.getSubmissionText())
                .submissionLink(request.getSubmissionLink())
                .submittedAt(LocalDateTime.now())
                .status(MaterialSubmission.Status.SUBMITTED)
                .build();

        submissionRepository.save(submission);
        return mapper.toResponse(submission);
    }

    @Override
    @Transactional
    public MaterialSubmissionResponse grade(Long id, MaterialSubmissionGradeRequest request) {
        MaterialSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUBMISSION_NOT_FOUND));

        submission.setScore(request.getScore());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(MaterialSubmission.Status.GRADED);

        submissionRepository.save(submission);
        return mapper.toResponse(submission);
    }

    @Override
    public List<MaterialSubmissionResponse> getByMaterial(Long materialId) {
        return mapper.toResponseList(submissionRepository.findByMaterialId(materialId));
    }

    @Override
    public List<MaterialSubmissionResponse> getByStudent(String studentId) {
        return mapper.toResponseList(submissionRepository.findByStudentId(studentId));
    }

    @Override
    public List<MaterialSubmissionResponse> getByClassCourse(Long classCourseId) {
        return mapper.toResponseList(submissionRepository.findByClassCourseId(classCourseId));
    }
}
