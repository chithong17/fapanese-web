package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.Grammar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarRepository extends JpaRepository<Grammar, Long> {
    List<Grammar> findByLessonPart_Id(Long lessonPartId);
}