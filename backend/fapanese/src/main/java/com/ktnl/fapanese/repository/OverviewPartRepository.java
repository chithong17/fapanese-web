package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.OverviewPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OverviewPartRepository extends JpaRepository<OverviewPart, Long> {
    List<OverviewPart> findByOverviewId(Long overviewId);
}
