package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.dto.response.CourseResponse;
import com.ktnl.fapanese.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    CourseResponse getCourseById(@PathVariable Long id);
}
