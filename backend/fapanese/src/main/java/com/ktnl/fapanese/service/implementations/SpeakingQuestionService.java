package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.SpeakingQuestionRequest;
import com.ktnl.fapanese.dto.response.SpeakingQuestionResponse;
import com.ktnl.fapanese.entity.Speaking;
import com.ktnl.fapanese.entity.SpeakingQuestion;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.SpeakingQuestionMapper;
import com.ktnl.fapanese.repository.SpeakingQuestionRepository;
import com.ktnl.fapanese.repository.SpeakingRepository;
import com.ktnl.fapanese.service.interfaces.ISpeakingQuestionService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpeakingQuestionService implements ISpeakingQuestionService {
    // Dependencies
    SpeakingQuestionRepository speakingQuestionRepository;
    SpeakingRepository speakingRepository;
    SpeakingQuestionMapper speakingQuestionMapper; // <-- Đã inject Mapper

    @Override
    @Transactional
    public SpeakingQuestionResponse createQuestion(SpeakingQuestionRequest request) {
        log.info("Creating new speaking question...");
        // 1. Tìm thực thể 'Speaking' cha
        Speaking speaking = speakingRepository.findById(request.getSpeakingId())
                .orElseThrow(() -> new AppException(ErrorCode.SPEAKING_NOT_FOUND));

        // 2. Map DTO -> Entity (dùng Mapper)
        SpeakingQuestion question = speakingQuestionMapper.toSpeakingQuestion(request);
        question.setSpeaking(speaking); // Set quan hệ cha con thủ công

        // 3. Lưu vào DB
        SpeakingQuestion savedQuestion = speakingQuestionRepository.save(question);
        log.info("Created speaking question with id: {}", savedQuestion.getId());

        // 4. Map Entity -> Response DTO (dùng Mapper)
        return speakingQuestionMapper.toSpeakingQuestionResponse(savedQuestion);
    }

    @Override
    public SpeakingQuestionResponse getQuestionById(Long id) {
        log.info("Getting question by id: {}", id);
        SpeakingQuestion question = findQuestionByIdOrThrow(id);

        // Dùng Mapper để chuyển đổi
        return speakingQuestionMapper.toSpeakingQuestionResponse(question);
    }

    @Override
    public List<SpeakingQuestionResponse> getAllQuestions() {
        log.info("Getting all questions");
        return speakingQuestionRepository.findAll()
                .stream()
                // Dùng method reference của Mapper
                .map(speakingQuestionMapper::toSpeakingQuestionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SpeakingQuestionResponse> getQuestionsBySpeakingId(Long speakingId) {
        log.info("Getting questions for speaking id: {}", speakingId);
        if (!speakingRepository.existsById(speakingId)) {
            throw new AppException(ErrorCode.SPEAKING_NOT_FOUND);
        }

        return speakingQuestionRepository.findBySpeakingId(speakingId)
                .stream()
                // Dùng method reference của Mapper
                .map(speakingQuestionMapper::toSpeakingQuestionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SpeakingQuestionResponse updateQuestion(Long id, SpeakingQuestionRequest request) {
        log.info("Updating question with id: {}", id);
        // 1. Tìm câu hỏi hiện có
        SpeakingQuestion existingQuestion = findQuestionByIdOrThrow(id);

        // 2. Kiểm tra xem có thay đổi 'Speaking' cha không
        if (request.getSpeakingId() != null && !request.getSpeakingId().equals(existingQuestion.getSpeaking().getId())) {
            Speaking newSpeaking = speakingRepository.findById(request.getSpeakingId())
                    .orElseThrow(() -> new AppException(ErrorCode.SPEAKING_NOT_FOUND));
            existingQuestion.setSpeaking(newSpeaking); // Cập nhật cha nếu thay đổi
        }

        // 3. Cập nhật các trường (dùng Mapper)
        speakingQuestionMapper.updateSpeakingQuestion(existingQuestion, request);

        // 4. Lưu lại
        SpeakingQuestion updatedQuestion = speakingQuestionRepository.save(existingQuestion);
        log.info("Updated question with id: {}", updatedQuestion.getId());

        // 5. Trả về DTO (dùng Mapper)
        return speakingQuestionMapper.toSpeakingQuestionResponse(updatedQuestion);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        log.warn("Deleting question with id: {}", id);
        if (!speakingQuestionRepository.existsById(id)) {
            throw new AppException(ErrorCode.SPEAKING_QUESTION_NOT_FOUND);
        }
        speakingQuestionRepository.deleteById(id);
        log.info("Deleted question with id: {}", id);
    }

    // ----- Phương thức tiện ích (Helper Methods) -----

    private SpeakingQuestion findQuestionByIdOrThrow(Long id) {
        return speakingQuestionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPEAKING_QUESTION_NOT_FOUND));
    }
}
