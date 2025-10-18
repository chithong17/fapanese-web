package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.QuestionRequest;
import com.ktnl.fapanese.dto.request.UserAnswer;
import com.ktnl.fapanese.dto.response.QuestionCheckResponse;
import com.ktnl.fapanese.dto.response.QuestionResponse;
import com.ktnl.fapanese.dto.response.SubmitQuizResponse;
import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.QuestionMapper;
import com.ktnl.fapanese.repository.LessonRepository;
import com.ktnl.fapanese.repository.QuestionRepository;
import com.ktnl.fapanese.service.interfaces.IQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService implements IQuestionService {
    private final QuestionRepository questionRepository;
    private final LessonRepository lessonRepository;
    private final QuestionMapper questionMapper;

    @Override
    public QuestionResponse createQuestion(QuestionRequest request) {
        lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));

        Question question = questionMapper.toQuestion(request);
        Question saved = questionRepository.save(question);
        return questionMapper.toQuestionResponse(saved);
    }

    @Override
    public List<QuestionResponse> getAllQuestions() {
        return questionRepository.findAll()
                .stream()
                .map(questionMapper::toQuestionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QuestionResponse getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
        return questionMapper.toQuestionResponse(question);
    }

    @Override
    public QuestionResponse updateQuestion(Long id, QuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));

        lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));

        questionMapper.updateQuestion(question, request);
        Question updated = questionRepository.save(question);
        return questionMapper.toQuestionResponse(updated);
    }

    @Override
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new AppException(ErrorCode.QUESTION_NOT_FOUND);
        }
        questionRepository.deleteById(id);
    }

    // ✅ Các method mới
    @Override
    public List<QuestionResponse> getQuestionsByType(String questionType) {
        List<Question> questions = questionRepository.findByQuestionType(questionType);
        if (questions.isEmpty()) throw new AppException(ErrorCode.QUESTION_NOT_FOUND);
        return questionMapper.toQuestionResponseList(questions);
    }

    @Override
    public List<QuestionResponse> getQuestionsByCategory(String category) {
        List<Question> questions = questionRepository.findByCategory(category);
        if (questions.isEmpty()) throw new AppException(ErrorCode.QUESTION_NOT_FOUND);
        return questionMapper.toQuestionResponseList(questions);
    }

    @Override
    public SubmitQuizResponse checkAndSubmitAnswers(List<UserAnswer> userAnswers) {
        if (userAnswers == null || userAnswers.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_INPUT);
        }

        List<QuestionCheckResponse> detailedResults = new ArrayList<>();
        int correctCount = 0;

        for (UserAnswer userAnswer : userAnswers) {
            Question question = questionRepository.findById(userAnswer.getQuestionId())
                    .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));

            String questionType = question.getQuestionType().name();
            String storedAnswer;
            boolean isCorrect = false;

            if ("MULTIPLE_CHOICE".equalsIgnoreCase(questionType)) {
                storedAnswer = question.getCorrectAnswer();
                if (storedAnswer != null && storedAnswer.equalsIgnoreCase(userAnswer.getUserAnswer())) {
                    isCorrect = true;
                }
            } else if ("FILL_IN_THE_BLANK".equalsIgnoreCase(questionType)) {
                storedAnswer = question.getFillAnswer();
                if (storedAnswer != null && storedAnswer.trim().equalsIgnoreCase(userAnswer.getUserAnswer().trim())) {
                    isCorrect = true;
                }
            } else {
                storedAnswer = "UNKNOWN_TYPE";
                isCorrect = false;
            }

            if (isCorrect) {
                correctCount++;
            }

            detailedResults.add(QuestionCheckResponse.builder()
                    .questionId(question.getId())
                    .questionType(questionType)
                    .isCorrect(isCorrect)
                    .userAnswer(userAnswer.getUserAnswer())
                    .correctAnswer(storedAnswer)
                    .build());
        }

        double scorePercentage = ((double) correctCount / userAnswers.size()) * 100;

        return SubmitQuizResponse.builder()
                .totalQuestions(userAnswers.size())
                .correctCount(correctCount)
                .scorePercentage(Math.round(scorePercentage * 100.0) / 100.0)
                .detailedResults(detailedResults)
                .build();
    }
}
