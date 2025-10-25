package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson,Long> {
    List<Lesson> findByCourseId(Long courseId);
    List<Lesson> findByCourse(Course course);
}
