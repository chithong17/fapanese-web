package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.MaterialSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MaterialSubmissionRepository extends JpaRepository<MaterialSubmission, Long> {
    List<MaterialSubmission> findByStudent_IdOrderBySubmittedAtDesc(String studentId);

    List<MaterialSubmission> findByMaterial_Id(Long materialId);

    List<MaterialSubmission> findByClassCourse_Id(Long classCourseId);

    Optional<MaterialSubmission> findByStudent_IdAndMaterial_Id(String studentId, Long materialId);
}
