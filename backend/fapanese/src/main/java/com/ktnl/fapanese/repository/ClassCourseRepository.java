package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.entity.ClassCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassCourseRepository extends JpaRepository<ClassCourse, Long> {
    Optional<ClassCourse> findByCourseId(Long courseId);
    Optional<ClassCourse> findByLecturerId(String lecturerId);

}
