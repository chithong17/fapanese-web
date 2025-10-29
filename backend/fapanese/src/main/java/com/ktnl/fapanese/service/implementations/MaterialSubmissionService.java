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

        // 1) Chỉ cho nộp bài với ASSIGNMENT/EXERCISE
        if (material.getType() == Material.MaterialType.RESOURCE) {
            throw new AppException(ErrorCode.ACTION_NOT_ALLOWED, "Material is not submittable (RESOURCE).");
        }

        // 2) Material phải thuộc đúng classCourse (dựa trên quan hệ ClassMaterial của Material)
        boolean materialInClass = material.getClassMaterials().stream()
                .anyMatch(cm -> cm.getClassCourse().getId().equals(classCourse.getId()));
        if (!materialInClass) {
            throw new AppException(ErrorCode.ACTION_NOT_ALLOWED, "Material not assigned to this class.");
        }

        // 3) Idempotent submit: có rồi thì cập nhật (cho phép nộp lại)
        MaterialSubmission submission = submissionRepository
                .findByStudent_IdAndMaterial_Id(student.getId(), material.getId())
                .orElseGet(() -> MaterialSubmission.builder()
                        .material(material)
                        .student(student)
                        .classCourse(classCourse)
                        .status(MaterialSubmission.Status.PENDING)
                        .build());

        submission.setFileUrl(request.getFileUrl());
        submission.setFileType(request.getFileType());
        submission.setSubmissionText(request.getSubmissionText());
        submission.setSubmissionLink(request.getSubmissionLink());
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(MaterialSubmission.Status.SUBMITTED);

        MaterialSubmission saved = submissionRepository.save(submission);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public MaterialSubmissionResponse grade(Long id, MaterialSubmissionGradeRequest request) {
        MaterialSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUBMISSION_NOT_FOUND));

        submission.setScore(request.getScore());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(MaterialSubmission.Status.GRADED);

        MaterialSubmission saved = submissionRepository.save(submission);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<MaterialSubmissionResponse> getByMaterial(Long materialId) {
        return mapper.toResponseList(submissionRepository.findByMaterial_Id(materialId));
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<MaterialSubmissionResponse> getByStudent(String studentId) {
        return mapper.toResponseList(submissionRepository.findByStudent_IdOrderBySubmittedAtDesc(studentId));
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<MaterialSubmissionResponse> getByClassCourse(Long classCourseId) {
        return mapper.toResponseList(submissionRepository.findByClassCourse_Id(classCourseId));
    }
}
