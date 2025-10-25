package com.ktnl.fapanese.repository;


import com.ktnl.fapanese.entity.Speaking;
import com.ktnl.fapanese.entity.enums.SpeakingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpeakingRepository extends JpaRepository<Speaking, Long> {
    List<Speaking> findByType(SpeakingType speakingType);
}
