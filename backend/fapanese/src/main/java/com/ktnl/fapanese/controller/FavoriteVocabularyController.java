package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.FavoriteVocabularyRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.FavoriteVocabularyResponse;
import com.ktnl.fapanese.service.interfaces.IFavoriteVocabularyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorite-vocabularies")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FavoriteVocabularyController {

    private final IFavoriteVocabularyService favoriteVocabularyService;

    @PostMapping
    public ApiResponse<Void> addFavorite(@RequestBody FavoriteVocabularyRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        favoriteVocabularyService.addFavorite(email, request.getVocabularyId());
        return ApiResponse.<Void>builder()
                .message("Added to favorites")
                .build();
    }

    @DeleteMapping("/{vocabularyId}")
    public ApiResponse<Void> removeFavorite(@PathVariable Long vocabularyId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        favoriteVocabularyService.removeFavorite(email, vocabularyId);
        return ApiResponse.<Void>builder()
                .message("Removed from favorites")
                .build();
    }

    @GetMapping("/ids")
    public ApiResponse<List<Long>> getFavoriteIds() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Long> ids = favoriteVocabularyService.getFavoriteIds(email);
        return ApiResponse.<List<Long>>builder()
                .message("Get favorite IDs success")
                .result(ids)
                .build();
    }

    @GetMapping
    public ApiResponse<List<FavoriteVocabularyResponse>> getAllFavorites() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<FavoriteVocabularyResponse> result = favoriteVocabularyService.getAllFavorites(email);
        return ApiResponse.<List<FavoriteVocabularyResponse>>builder()
                .message("Get all favorites success")
                .result(result)
                .build();
    }
}
