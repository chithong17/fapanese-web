package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuestionType(String questionType);
    List<Question> findByCategory(String category);
}
