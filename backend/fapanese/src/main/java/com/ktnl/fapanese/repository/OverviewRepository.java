package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.Overview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OverviewRepository extends JpaRepository<Overview, Long> {
}
