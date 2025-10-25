package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.VocabularyRequest;
import com.ktnl.fapanese.dto.response.VocabularyResponse;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.entity.LessonPart;
import com.ktnl.fapanese.entity.Vocabulary;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.VocabularyMapper;
import com.ktnl.fapanese.repository.LessonPartRepository;
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
    private final LessonPartRepository lessonPartRepository;
    private final VocabularyMapper vocabularyMapper;

    private LessonPart findLessonPartOrThrow(Long lessonPartId) {
        return lessonPartRepository.findById(lessonPartId)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_PART_NOT_FOUND));
    }

    @Override
    public VocabularyResponse createVocabulary(VocabularyRequest request) {
        LessonPart lessonPart = findLessonPartOrThrow(request.getLessonPartId());

        Vocabulary vocabulary = vocabularyMapper.toVocabulary(request);

        vocabulary.setLessonPart(lessonPart);

        Vocabulary saved = vocabularyRepository.save(vocabulary);
        return vocabularyMapper.toVocabularyResponse(saved);
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

        if (request.getLessonPartId() != null &&
                (vocabulary.getLessonPart() == null || !vocabulary.getLessonPart().getId().equals(request.getLessonPartId()))) {
            LessonPart newLessonPart = lessonPartRepository.findById(request.getLessonPartId())
                    .orElseThrow(() -> new AppException(ErrorCode.LESSON_PART_NOT_FOUND));
            vocabulary.setLessonPart(newLessonPart);
        }

        vocabularyMapper.updateVocabulary(vocabulary, request);


        Vocabulary updated = vocabularyRepository.save(vocabulary);
        return vocabularyMapper.toVocabularyResponse(updated);
    }

    @Override
    public void deleteVocabulary(Long id) {
        if (!vocabularyRepository.existsById(id)) {
            throw new AppException(ErrorCode.VOCABULARY_NOT_FOUND);
        }
        vocabularyRepository.deleteById(id);
    }

    @Override
    public List<VocabularyResponse> getVocabulariesByLessonPartId(Long lessonPartId) {
        List<Vocabulary> vocabularies = vocabularyRepository.findByLessonPart_Id(lessonPartId);
        return vocabularyMapper.toVocabularyResponseList(vocabularies);
    }
}
