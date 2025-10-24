package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.MiddleExam;
import com.ktnl.fapanese.entity.SpeakingExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MiddleExamRepository extends JpaRepository<MiddleExam, Long> {
    List<MiddleExam> findByOverviewPartId(Long partId);
}
