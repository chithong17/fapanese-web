package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.FinalExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinalExamRepository extends JpaRepository<FinalExam, Long> {
}
