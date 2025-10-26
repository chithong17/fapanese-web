package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.MaterialSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialSubmissionRepository extends JpaRepository<MaterialSubmission, Long> {
    List<MaterialSubmission> findByStudentId(String studentId);
    List<MaterialSubmission> findByMaterialId(Long materialId);
    List<MaterialSubmission> findByClassCourseId(Long classCourseId);
}
