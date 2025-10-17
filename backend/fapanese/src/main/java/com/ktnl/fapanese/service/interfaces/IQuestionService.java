package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.response.QuestionResponse;

import java.util.List;

public interface IQuestionService {
    QuestionResponse createQuestion(QuestionRequest request);
    List<QuestionResponse> getAllQuestions();
    QuestionResponse getQuestionById(Long id);
    QuestionResponse updateQuestion(Long id, QuestionRequest request);
    void deleteQuestion(Long id);

    // ✅ Các hàm mới
    List<QuestionResponse> getQuestionsByType(String questionType);
    List<QuestionResponse> getQuestionsByCategory(String category);
}
