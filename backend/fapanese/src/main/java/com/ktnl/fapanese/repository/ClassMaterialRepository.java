package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.ClassMaterial;
import com.ktnl.fapanese.entity.ClassMaterialId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassMaterialRepository extends JpaRepository<ClassMaterial, ClassMaterialId> {
    List<ClassMaterial> findByClassCourseId(Long classId);
    List<ClassMaterial> findByClassCourse_IdIn(List<Long> classCourseIds);
}
