package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.MiddleExamRequest;
import com.ktnl.fapanese.dto.response.MiddleExamResponse;
import com.ktnl.fapanese.dto.response.SpeakingExamResponse;
import com.ktnl.fapanese.entity.MiddleExam;
import com.ktnl.fapanese.entity.OverviewPart;
import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.entity.SpeakingExam;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.MiddleExamMapper;
import com.ktnl.fapanese.repository.MiddleExamRepository;
import com.ktnl.fapanese.repository.OverviewPartRepository;
import com.ktnl.fapanese.repository.QuestionRepository;
import com.ktnl.fapanese.service.interfaces.IMiddleExamService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MiddleExamService implements IMiddleExamService {

    MiddleExamRepository middleExamRepository;
    OverviewPartRepository overviewPartRepository; // Dependency
    QuestionRepository questionRepository; // Dependency
    MiddleExamMapper middleExamMapper;

    // READ (All)
    @Override
    public List<MiddleExamResponse> getAllMiddleExams() {
        List<MiddleExam> exams = middleExamRepository.findAll();
        return middleExamMapper.toMiddleExamResponseList(exams);
    }

    // READ (By Id)
    @Override
    public MiddleExamResponse getMiddleExamById(Long id) {
        MiddleExam exam = middleExamRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAM_NOT_FOUND));
        return middleExamMapper.toMiddleExamResponse(exam);
    }

    // CREATE
    @Override
    @Transactional
    public MiddleExamResponse createMiddleExam(MiddleExamRequest request) {
        MiddleExam exam = middleExamMapper.toMiddleExam(request);

        // Xử lý quan hệ ManyToOne
        OverviewPart overviewPart = overviewPartRepository.findById(request.getOverviewPartId())
                .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND));
        exam.setOverviewPart(overviewPart);

        // Xử lý quan hệ ManyToMany
        if (request.getQuestionIds() != null && !request.getQuestionIds().isEmpty()) {
            Set<Question> questions = new HashSet<>(questionRepository.findAllById(request.getQuestionIds()));
            exam.setQuestions(questions);
        }

        MiddleExam savedExam = middleExamRepository.save(exam);
        return middleExamMapper.toMiddleExamResponse(savedExam);
    }

    // UPDATE
    @Override
    @Transactional
    public MiddleExamResponse updateMiddleExam(Long id, MiddleExamRequest request) {
        MiddleExam existingExam = middleExamRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAM_NOT_FOUND));

        // Cập nhật các trường cơ bản (title, type, year, v.v.)
        middleExamMapper.updateMiddleExam(existingExam, request);

        // Cập nhật quan hệ ManyToOne (nếu ID thay đổi)
        if (!existingExam.getOverviewPart().getId().equals(request.getOverviewPartId())) {
            OverviewPart overviewPart = overviewPartRepository.findById(request.getOverviewPartId())
                    .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND));
            existingExam.setOverviewPart(overviewPart);
        }

        // Cập nhật quan hệ ManyToMany
        if (request.getQuestionIds() != null) {
            Set<Question> questions = new HashSet<>(questionRepository.findAllById(request.getQuestionIds()));
            existingExam.setQuestions(questions); // Ghi đè list cũ
        }

        MiddleExam updatedExam = middleExamRepository.save(existingExam);
        return middleExamMapper.toMiddleExamResponse(updatedExam);
    }

    // DELETE
    @Override
    @Transactional
    public void deleteMiddleExam(Long id) {
        MiddleExam exam = middleExamRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAM_NOT_FOUND));
        middleExamRepository.delete(exam);
    }

    @Override
    public List<MiddleExamResponse> getAllMiddleExamsByOverviewPartId(Long partId) {
        if (!overviewPartRepository.existsById(partId)) {
            throw new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND);
        }

        List<MiddleExam> middleExams = middleExamRepository.findByOverviewPartId(partId);

        return middleExamMapper.toMiddleExamResponseList(middleExams);

    }

}
