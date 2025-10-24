package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.dto.response.OverviewResponse;
import com.ktnl.fapanese.entity.Overview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OverviewRepository extends JpaRepository<Overview, Long> {
    List<Overview> findByCourseId(Long courseId);
}
