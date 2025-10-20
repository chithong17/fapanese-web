package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.request.UserAnswer;
import com.ktnl.fapanese.dto.response.QuestionResponse;
import com.ktnl.fapanese.dto.response.SubmitQuizResponse;
import com.ktnl.fapanese.entity.enums.QuestionCategory;
import com.ktnl.fapanese.entity.enums.QuestionType;

import java.util.List;

public interface IQuestionService {
    QuestionResponse createQuestion(QuestionRequest request);
    List<QuestionResponse> getAllQuestions();
    QuestionResponse getQuestionById(Long id);
    QuestionResponse updateQuestion(Long id, QuestionRequest request);
    void deleteQuestion(Long id);

    List<QuestionResponse> getQuestionsByType(QuestionType questionType);
    List<QuestionResponse> getQuestionsByCategory(QuestionCategory category);

    SubmitQuizResponse checkAndSubmitAnswers(List<UserAnswer> userAnswers);
}
