package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.VocabularyRequest;
import com.ktnl.fapanese.dto.response.VocabularyResponse;

import java.util.List;

public interface IVocabularyService {
    VocabularyResponse createVocabulary(VocabularyRequest request);
    List<VocabularyResponse> getAllVocabularies();
    VocabularyResponse getVocabularyById(Long id);
    VocabularyResponse updateVocabulary(Long id, VocabularyRequest request);
    void deleteVocabulary(Long id);
    List<VocabularyResponse> getVocabulariesByLessonPartId(Long lessonPartId);
}
