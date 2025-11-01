package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.SpeakingQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpeakingQuestionRepository extends JpaRepository<SpeakingQuestion, Long> {
    List<SpeakingQuestion> findBySpeakingId(Long speakingId);

    @Query(value = "SELECT * FROM speaking_question WHERE speaking_id = ?1 " +
            "ORDER BY RAND() LIMIT ?2", nativeQuery = true)
    List<SpeakingQuestion> findRandomQuestionsForSpeaking(Long speakingId, int quantity);
}
