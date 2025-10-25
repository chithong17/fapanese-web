package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.entity.enums.QuestionCategory;
import com.ktnl.fapanese.entity.enums.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuestionType(QuestionType questionType);
    List<Question> findByCategory(QuestionCategory category);
    List<Question> findByLessonPart_Id(Long lessonPartId);
    int countByLessonPartId(Long lessonPartId);

}
