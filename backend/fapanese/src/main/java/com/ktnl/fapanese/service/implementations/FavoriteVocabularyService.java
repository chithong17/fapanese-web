package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.response.FavoriteVocabularyResponse;
import com.ktnl.fapanese.entity.FavoriteVocabulary;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.entity.Vocabulary;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.FavoriteVocabularyMapper;
import com.ktnl.fapanese.repository.FavoriteVocabularyRepository;
import com.ktnl.fapanese.repository.UserRepository;
import com.ktnl.fapanese.repository.VocabularyRepository;
import com.ktnl.fapanese.service.interfaces.IFavoriteVocabularyService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class FavoriteVocabularyService implements IFavoriteVocabularyService {

    @Autowired
    private FavoriteVocabularyRepository favoriteRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private VocabularyRepository vocabularyRepo;
    @Autowired
    private FavoriteVocabularyMapper mapper;

    @Override
    public void addFavorite(String email, Long vocabularyId) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Kiểm tra đã favorite chưa
        if (favoriteRepo.existsByUser_IdAndVocabulary_Id(user.getId(), vocabularyId)) {
            throw new RuntimeException("Vocabulary already in favorites");
        }

        Vocabulary vocabulary = vocabularyRepo.findById(vocabularyId)
                .orElseThrow(() -> new RuntimeException("Vocabulary not found"));

        FavoriteVocabulary favorite = FavoriteVocabulary.builder()
                .user(user)
                .vocabulary(vocabulary)
                .build();

        favoriteRepo.save(favorite);
        log.info("User {} added vocabulary {} to favorites", email, vocabularyId);
    }

    @Override
    @Transactional
    public void removeFavorite(String email, Long vocabularyId) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        favoriteRepo.deleteByUser_IdAndVocabulary_Id(user.getId(), vocabularyId);
        log.info("User {} removed vocabulary {} from favorites", email, vocabularyId);
    }

    @Override
    public List<Long> getFavoriteIds(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return favoriteRepo.findVocabularyIdsByUserId(user.getId());
    }

    @Override
    public List<FavoriteVocabularyResponse> getAllFavorites(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<FavoriteVocabulary> favorites = favoriteRepo.findByUser_IdOrderByCreatedAtDesc(user.getId());
        return mapper.toResponseList(favorites);
    }
}
