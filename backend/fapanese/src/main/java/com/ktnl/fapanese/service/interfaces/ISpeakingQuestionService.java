package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.SpeakingQuestionRequest;
import com.ktnl.fapanese.dto.response.SpeakingQuestionResponse;

import java.util.List;

public interface ISpeakingQuestionService {
    SpeakingQuestionResponse createQuestion(SpeakingQuestionRequest requestDTO);
    SpeakingQuestionResponse getQuestionById(Long id);
    List<SpeakingQuestionResponse> getAllQuestions();
    List<SpeakingQuestionResponse> getQuestionsBySpeakingId(Long speakingId);
    SpeakingQuestionResponse updateQuestion(Long id, SpeakingQuestionRequest requestDTO);
    void deleteQuestion(Long id);

}
