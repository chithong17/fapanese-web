package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.MiddleExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MiddleExamRepository extends JpaRepository<MiddleExam, Long> {
}
