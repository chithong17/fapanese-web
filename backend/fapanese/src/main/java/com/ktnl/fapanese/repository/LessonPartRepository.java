package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.LessonPart;
import com.ktnl.fapanese.entity.enums.LessonPartType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonPartRepository extends JpaRepository<LessonPart, Long> {

     List<LessonPart> findByLessonId(Long lessonId);
     List<LessonPart> findByType(LessonPartType type);
}