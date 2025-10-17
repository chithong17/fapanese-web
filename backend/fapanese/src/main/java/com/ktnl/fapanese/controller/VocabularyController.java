package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.VocabularyRequest;
import com.ktnl.fapanese.dto.response.VocabularyResponse;
import com.ktnl.fapanese.service.interfaces.IVocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vocabularies")
@RequiredArgsConstructor
public class VocabularyController {

    private final IVocabularyService vocabularyService;

    @PostMapping
    public ResponseEntity<VocabularyResponse> createVocabulary(@RequestBody VocabularyRequest request) {
        return ResponseEntity.ok(vocabularyService.createVocabulary(request));
    }

    @GetMapping
    public ResponseEntity<List<VocabularyResponse>> getAllVocabularies() {
        return ResponseEntity.ok(vocabularyService.getAllVocabularies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VocabularyResponse> getVocabularyById(@PathVariable Long id) {
        return ResponseEntity.ok(vocabularyService.getVocabularyById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VocabularyResponse> updateVocabulary(@PathVariable Long id, @RequestBody VocabularyRequest request) {
        return ResponseEntity.ok(vocabularyService.updateVocabulary(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVocabulary(@PathVariable Long id) {
        vocabularyService.deleteVocabulary(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-lesson/{lessonId}")
    public ResponseEntity<List<VocabularyResponse>> getVocabulariesByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(vocabularyService.getVocabulariesByLessonId(lessonId));
    }
}
