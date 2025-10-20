package com.ktnl.fapanese.repository;


import com.ktnl.fapanese.entity.Speaking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpeakingRepository extends JpaRepository<Speaking, Long> {
}
