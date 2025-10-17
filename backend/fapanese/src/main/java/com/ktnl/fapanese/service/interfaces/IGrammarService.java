package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.GrammarRequest;
import com.ktnl.fapanese.dto.response.GrammarResponse;

import java.util.List;

public interface IGrammarService {
    GrammarResponse createGrammar(GrammarRequest request);
    List<GrammarResponse> getAllGrammars();
    GrammarResponse getGrammarById(Long id);
    GrammarResponse updateGrammar(Long id, GrammarRequest request);
    void deleteGrammar(Long id);
    List<GrammarResponse> getGrammarsByLesson(Long lessonId);
}
