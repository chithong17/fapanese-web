package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.VocabularyRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.VocabularyResponse;
import com.ktnl.fapanese.service.interfaces.IVocabularyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;


import java.util.List;

import static java.util.stream.DoubleStream.builder;

@RestController
@RequestMapping("/api/vocabularies")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VocabularyController {

    private final IVocabularyService vocabularyService;
    private final RestClient.Builder builder;

    @PostMapping
    public ApiResponse<VocabularyResponse> createVocabulary(@RequestBody VocabularyRequest request) {
        VocabularyResponse result =  vocabularyService.createVocabulary(request);
        return ApiResponse.<VocabularyResponse>builder()
                .message("Vocabulary create success")
                .result(result)
                .build();
    }

    @GetMapping
    public ApiResponse<List<VocabularyResponse>> getAllVocabularies() {
        List<VocabularyResponse> result =  vocabularyService.getAllVocabularies();
        return ApiResponse.<List<VocabularyResponse>>builder()
                .result(result)
                .message("Get all Vocabulary success")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<VocabularyResponse> getVocabularyById(@PathVariable Long id) {
        VocabularyResponse result =  vocabularyService.getVocabularyById(id);
        return ApiResponse.<VocabularyResponse>builder()
                .result(result)
                .message("Get vocabularies by Id success")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<VocabularyResponse> updateVocabulary(@PathVariable Long id, @RequestBody VocabularyRequest request) {
        VocabularyResponse result =  vocabularyService.updateVocabulary(id, request);
        return ApiResponse.<VocabularyResponse>builder()
                .result(result)
                .message("Update vocabulary success")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteVocabulary(@PathVariable Long id) {
        vocabularyService.deleteVocabulary(id);
        return ApiResponse.<Void>builder()
                .message("Delete success")
                .build();
    }

    @GetMapping("/by-lesson-part/{lessonPartId}")
    public ResponseEntity<List<VocabularyResponse>> getVocabulariesByLesson(@PathVariable Long lessonPartId) {
        return ResponseEntity.ok(vocabularyService.getVocabulariesByLessonPartId(lessonPartId));
    }
}
