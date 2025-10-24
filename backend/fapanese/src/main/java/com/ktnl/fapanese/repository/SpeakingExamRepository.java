package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.SpeakingExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpeakingExamRepository extends JpaRepository<SpeakingExam, Long> {
    List<SpeakingExam> findByOverviewPartId(Long partId);
}
