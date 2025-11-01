package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.SpeakingExamRequest;
import com.ktnl.fapanese.dto.response.SpeakingExamResponse;
import com.ktnl.fapanese.dto.response.SpeakingRespone;
import com.ktnl.fapanese.dto.response.SpeakingTestItemResponse;
import com.ktnl.fapanese.dto.response.SpeakingTestResponse;
import com.ktnl.fapanese.entity.OverviewPart;
import com.ktnl.fapanese.entity.Speaking;
import com.ktnl.fapanese.entity.SpeakingExam;
import com.ktnl.fapanese.entity.SpeakingQuestion;
import com.ktnl.fapanese.entity.enums.SpeakingType;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.*;
import com.ktnl.fapanese.repository.OverviewPartRepository;
import com.ktnl.fapanese.repository.SpeakingExamRepository;
import com.ktnl.fapanese.repository.SpeakingQuestionRepository;
import com.ktnl.fapanese.repository.SpeakingRepository;
import com.ktnl.fapanese.service.interfaces.ISpeakingExamService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpeakingExamService implements ISpeakingExamService {
    SpeakingExamRepository speakingExamRepository;
    OverviewPartRepository overviewPartRepository; // Dependency cha
    SpeakingExamMapper speakingExamMapper;
    SpeakingRepository speakingRepository;
    SpeakingMapper speakingMapper;
    SpeakingQuestionRepository speakingQuestionRepository;
    SpeakingQuestionMapper speakingQuestionMapper;
    SpeakingTestItemMapper speakingTestItemMapper;
    SpeakingTestQuestionMapper speakingTestQuestionMapper;

    // READ (All)
    @Override
    @Transactional(readOnly = true) // 👈 Quan trọng để load lazy 'speakings'
    public List<SpeakingExamResponse> getAllSpeakingExams() {
        List<SpeakingExam> exams = speakingExamRepository.findAll();
        return speakingExamMapper.toSpeakingExamResponseList(exams);
    }

    // READ (By Id)
    @Override
    @Transactional(readOnly = true) // 👈 Quan trọng để load lazy 'speakings'
    public SpeakingExamResponse getSpeakingExamById(Long id) {
        SpeakingExam exam = findExamById(id);
        return speakingExamMapper.toSpeakingExamResponse(exam);
    }

    // CREATE
    @Override
    @Transactional
    public SpeakingExamResponse createSpeakingExam(SpeakingExamRequest request) {
        SpeakingExam exam = speakingExamMapper.toSpeakingExam(request);

        // Xử lý quan hệ ManyToOne (cha)
        OverviewPart overviewPart = overviewPartRepository.findById(request.getOverviewPartId())
                .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND));
        exam.setOverviewPart(overviewPart);

        SpeakingExam savedExam = speakingExamRepository.save(exam);
        return speakingExamMapper.toSpeakingExamResponse(savedExam);
    }

    // UPDATE
    @Override
    @Transactional
    public SpeakingExamResponse updateSpeakingExam(Long id, SpeakingExamRequest request) {
        SpeakingExam existingExam = findExamById(id);

        // Cập nhật các trường cơ bản (title, type)
        speakingExamMapper.updateSpeakingExam(existingExam, request);

        // Cập nhật quan hệ ManyToOne (nếu ID cha thay đổi)
        if (!existingExam.getOverviewPart().getId().equals(request.getOverviewPartId())) {
            OverviewPart overviewPart = overviewPartRepository.findById(request.getOverviewPartId())
                    .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND));
            existingExam.setOverviewPart(overviewPart);
        }

        SpeakingExam updatedExam = speakingExamRepository.save(existingExam);
        return speakingExamMapper.toSpeakingExamResponse(updatedExam);
    }

    // DELETE
    @Override
    @Transactional
    public void deleteSpeakingExam(Long id) {
        SpeakingExam exam = findExamById(id);

        // Do 'cascade = CascadeType.ALL, orphanRemoval = true'
        // Xóa 'SpeakingExam' sẽ tự động xóa tất cả 'Speaking' liên quan
        speakingExamRepository.delete(exam);
    }

    @Override
    public List<SpeakingExamResponse> getAllSpeakingExamsByOverviewPartId(Long partId) {
        if (!overviewPartRepository.existsById(partId)) {
            throw new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND);
        }

        List<SpeakingExam> speakingExams = speakingExamRepository.findByOverviewPartId(partId);

        // 1. Map sang List DTO như bình thường
        List<SpeakingExamResponse> responseList = speakingExamMapper.toSpeakingExamResponseList(speakingExams);

        // 2. Sắp xếp danh sách 'speakings' bên trong mỗi SpeakingExamResponse
        responseList.forEach(examResponse -> {
            // Kiểm tra xem danh sách speakings có tồn tại và không rỗng không
            if (examResponse.getSpeakings() != null && !examResponse.getSpeakings().isEmpty()) {
                // Sắp xếp trực tiếp danh sách speakings theo ID
                examResponse.getSpeakings().stream().sorted(Comparator.comparing(SpeakingRespone::getId).reversed());
                // Nếu muốn sắp xếp giảm dần, dùng:
                // examResponse.getSpeakings().sort(Comparator.comparing(SpeakingResponse::getId).reversed());
            }
        });

        return speakingExamMapper.toSpeakingExamResponseList(speakingExams);

    }

    @Override
    public SpeakingTestResponse generateRandomSpeakingTest(Long overviewPartId) {
        Speaking passageSpeaking = speakingRepository.findRandomSpeakingByPartIdAndType(overviewPartId, SpeakingType.PASSAGE.name())
                .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND));

        Speaking pictureSpeaking = speakingRepository.findRandomSpeakingByPartIdAndType(overviewPartId, SpeakingType.PICTURE.name())
                .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND));

        Speaking questionSpeaking = speakingRepository.findRandomSpeakingByPartIdAndType(overviewPartId, SpeakingType.QUESTION.name())
                .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND));

        List<SpeakingQuestion> pictureQuestion = speakingQuestionRepository.findRandomQuestionsForSpeaking(pictureSpeaking.getId(), 1);
        List<SpeakingQuestion> noPictureQuestion = speakingQuestionRepository.findRandomQuestionsForSpeaking(questionSpeaking.getId(), 2);

        SpeakingTestItemResponse passageSpeakingRes = speakingTestItemMapper.toSpeakingTestItemResponse(passageSpeaking);

        SpeakingTestItemResponse pictureSpeakingRes = speakingTestItemMapper.toSpeakingTestItemResponse(pictureSpeaking);
        pictureSpeakingRes.setQuestions(
               speakingTestQuestionMapper.toSpeakingQuestionResponseList(pictureQuestion)
        );

        SpeakingTestItemResponse questionSpeakingRes = speakingTestItemMapper.toSpeakingTestItemResponse(questionSpeaking);
        questionSpeakingRes.setQuestions(
                speakingTestQuestionMapper.toSpeakingQuestionResponseList(noPictureQuestion)
        );

        SpeakingTestResponse speakingTest = new SpeakingTestResponse(passageSpeakingRes, pictureSpeakingRes, questionSpeakingRes);
        return speakingTest;
    }

    // Hàm private helper
    private SpeakingExam findExamById(Long id) {
        return speakingExamRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAM_NOT_FOUND));
    }


}
