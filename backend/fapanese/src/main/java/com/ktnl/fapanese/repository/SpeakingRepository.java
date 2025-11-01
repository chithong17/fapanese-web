package com.ktnl.fapanese.repository;


import com.ktnl.fapanese.entity.Speaking;
import com.ktnl.fapanese.entity.enums.SpeakingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpeakingRepository extends JpaRepository<Speaking, Long> {
    List<Speaking> findByType(SpeakingType speakingType);

    @Query(value = "SELECT s.* FROM speaking s " +
            "JOIN speaking_exam se ON s.speaking_exam_id = se.id " +
            "WHERE se.overview_part_id = ?1 AND s.type = ?2 " +
            "ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<Speaking> findRandomSpeakingByPartIdAndType(Long overviewPartId, String type);
}
