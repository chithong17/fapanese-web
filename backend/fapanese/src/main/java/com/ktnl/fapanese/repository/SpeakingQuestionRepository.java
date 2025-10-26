package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.SpeakingQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpeakingQuestionRepositoty extends JpaRepository<SpeakingQuestion, Long> {
    List<SpeakingQuestion> findBySpeakingId(Long speakingId);
}
