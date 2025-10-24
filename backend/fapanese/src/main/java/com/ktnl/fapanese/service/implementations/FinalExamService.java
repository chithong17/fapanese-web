package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.FinalExamRequest;
import com.ktnl.fapanese.dto.response.FinalExamResponse;
import com.ktnl.fapanese.entity.FinalExam;
import com.ktnl.fapanese.entity.OverviewPart;
import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.FinalExamMapper;
import com.ktnl.fapanese.repository.FinalExamRepository;
import com.ktnl.fapanese.repository.OverviewPartRepository;
import com.ktnl.fapanese.repository.QuestionRepository;
import com.ktnl.fapanese.service.interfaces.IFinalExamService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FinalExamService implements IFinalExamService {

    FinalExamRepository finalExamRepository;
    OverviewPartRepository overviewPartRepository;
    QuestionRepository questionRepository;
    FinalExamMapper finalExamMapper;

    // READ (All)
    @Override
    public List<FinalExamResponse> getAllFinalExams() {
        List<FinalExam> exams = finalExamRepository.findAll();
        return finalExamMapper.toFinalExamResponseList(exams);
    }

    // READ (By Id)
    @Override
    public FinalExamResponse getFinalExamById(Long id) {
        FinalExam exam = findExamById(id);
        return finalExamMapper.toFinalExamResponse(exam);
    }

    // CREATE
    @Override
    @Transactional
    public FinalExamResponse createFinalExam(FinalExamRequest request) {
        FinalExam exam = finalExamMapper.toFinalExam(request);

        // Xử lý quan hệ ManyToOne
        OverviewPart overviewPart = overviewPartRepository.findById(request.getOverviewPartId())
                .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND));
        exam.setOverviewPart(overviewPart);

        // Xử lý quan hệ ManyToMany
        if (request.getQuestionIds() != null && !request.getQuestionIds().isEmpty()) {
            Set<Question> questions = new HashSet<>(questionRepository.findAllById(request.getQuestionIds()));
            exam.setQuestions(questions);
        }

        FinalExam savedExam = finalExamRepository.save(exam);
        return finalExamMapper.toFinalExamResponse(savedExam);
    }

    // UPDATE
    @Override
    @Transactional
    public FinalExamResponse updateFinalExam(Long id, FinalExamRequest request) {
        FinalExam existingExam = findExamById(id);

        // Cập nhật các trường cơ bản
        finalExamMapper.updateFinalExam(existingExam, request);

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

        FinalExam updatedExam = finalExamRepository.save(existingExam);
        return finalExamMapper.toFinalExamResponse(updatedExam);
    }

    // DELETE
    @Override
    @Transactional
    public void deleteFinalExam(Long id) {
        FinalExam exam = findExamById(id);
        finalExamRepository.delete(exam);
    }

    // Hàm private helper
    private FinalExam findExamById(Long id) {
        return finalExamRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAM_NOT_FOUND));
    }
}
