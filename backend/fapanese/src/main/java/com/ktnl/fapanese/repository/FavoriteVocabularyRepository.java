package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.FavoriteVocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteVocabularyRepository extends JpaRepository<FavoriteVocabulary, Long> {

    List<FavoriteVocabulary> findByUser_IdOrderByCreatedAtDesc(String userId);

    Optional<FavoriteVocabulary> findByUser_IdAndVocabulary_Id(String userId, Long vocabularyId);

    boolean existsByUser_IdAndVocabulary_Id(String userId, Long vocabularyId);

    void deleteByUser_IdAndVocabulary_Id(String userId, Long vocabularyId);

    @Query("SELECT fv.vocabulary.id FROM FavoriteVocabulary fv WHERE fv.user.id = :userId")
    List<Long> findVocabularyIdsByUserId(@Param("userId") String userId);
}
