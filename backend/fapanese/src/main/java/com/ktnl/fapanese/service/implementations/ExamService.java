package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.UserAnswer;
import com.ktnl.fapanese.dto.response.QuestionCheckResponse;
import com.ktnl.fapanese.dto.response.SubmitQuizResponse;
import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.repository.FinalExamRepository;
import com.ktnl.fapanese.repository.MiddleExamRepository;
import com.ktnl.fapanese.repository.QuestionRepository;
import com.ktnl.fapanese.service.interfaces.IExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamService implements IExamService {

    private final QuestionRepository questionRepository;
    private final FinalExamRepository finalExamQuestionRepository;
    private final MiddleExamRepository middleExamQuestionRepository;

    public SubmitQuizResponse checkAndSubmitExamAnswers(List<UserAnswer> userAnswers) {
        int total = userAnswers.size();
        int correct = 0;
        List<QuestionCheckResponse> details = new ArrayList<>();

        for (UserAnswer ans : userAnswers) {
            Question q = questionRepository.findById(ans.getQuestionId())
                    .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));

            boolean isCorrect = q.getCorrectAnswer() != null &&
                    q.getCorrectAnswer().equalsIgnoreCase(ans.getUserAnswer());

            if (isCorrect) correct++;

            details.add(QuestionCheckResponse.builder()
                    .questionId(q.getId())
                    .questionType(q.getQuestionType().name())
                    .isCorrect(isCorrect)
                    .userAnswer(ans.getUserAnswer())
                    .correctAnswer(q.getCorrectAnswer())
                    .build());
        }

        double score = total > 0 ? (correct * 100.0 / total) : 0.0;

        return new SubmitQuizResponse(total, correct, score, details);
    }
}
