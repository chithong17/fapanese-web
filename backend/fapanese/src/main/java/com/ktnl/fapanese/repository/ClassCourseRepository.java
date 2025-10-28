package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.entity.ClassCourse;
import com.ktnl.fapanese.entity.ClassMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ClassCourseRepository extends JpaRepository<ClassCourse, Long> {
    Optional<ClassCourse> findByCourseId(Long courseId);
    List<ClassCourse> findByLecturerId(String lecturerId);
    Optional<ClassCourse> findByClassMaterials(Set<ClassMaterial> classMaterials);
    @Query("SELECT sc.aClass FROM StudentClass sc WHERE sc.student.id = :studentId")
    List<ClassCourse> findByStudentId(@Param("studentId") String studentId);
}
