package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.VocabularyRequest;
import com.ktnl.fapanese.dto.response.VocabularyResponse;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.entity.Vocabulary;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.VocabularyMapper;
import com.ktnl.fapanese.repository.LessonRepository;
import com.ktnl.fapanese.repository.VocabularyRepository;
import com.ktnl.fapanese.service.interfaces.IVocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VocabularyService implements IVocabularyService {

    private final VocabularyRepository vocabularyRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyMapper vocabularyMapper;

    @Override
    public VocabularyResponse createVocabulary(VocabularyRequest request) {
        Vocabulary vocabulary = vocabularyMapper.toVocabulary(request);

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));
        vocabulary.setLesson(lesson);

        return vocabularyMapper.toVocabularyResponse(vocabularyRepository.save(vocabulary));
    }

    @Override
    public List<VocabularyResponse> getAllVocabularies() {
        return vocabularyMapper.toVocabularyResponseList(vocabularyRepository.findAll());
    }

    @Override
    public VocabularyResponse getVocabularyById(Long id) {
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOCABULARY_NOT_FOUND));
        return vocabularyMapper.toVocabularyResponse(vocabulary);
    }

    @Override
    public VocabularyResponse updateVocabulary(Long id, VocabularyRequest request) {
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOCABULARY_NOT_FOUND));

        vocabularyMapper.updateVocabulary(vocabulary, request);

        if (request.getLessonId() != null) {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));
            vocabulary.setLesson(lesson);
        }

        return vocabularyMapper.toVocabularyResponse(vocabularyRepository.save(vocabulary));
    }

    @Override
    public void deleteVocabulary(Long id) {
        if (!vocabularyRepository.existsById(id)) {
            throw new AppException(ErrorCode.VOCABULARY_NOT_FOUND);
        }
        vocabularyRepository.deleteById(id);
    }

    @Override
    public List<VocabularyResponse> getVocabulariesByLessonId(Long lessonId) {
        return vocabularyMapper.toVocabularyResponseList(vocabularyRepository.findByLesson_Id(lessonId));
    }
}
