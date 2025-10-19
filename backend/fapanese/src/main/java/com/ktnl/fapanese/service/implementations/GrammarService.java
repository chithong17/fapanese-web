package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.GrammarDetailRequest;
import com.ktnl.fapanese.dto.request.GrammarRequest;
import com.ktnl.fapanese.dto.response.GrammarResponse;
import com.ktnl.fapanese.entity.Grammar;
import com.ktnl.fapanese.entity.GrammarDetail;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.entity.LessonPart;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.GrammarDetailMapper;
import com.ktnl.fapanese.mapper.GrammarMapper;
import com.ktnl.fapanese.repository.GrammarRepository;
import com.ktnl.fapanese.repository.LessonPartRepository;
import com.ktnl.fapanese.repository.LessonRepository;
import com.ktnl.fapanese.service.interfaces.IGrammarService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GrammarService implements IGrammarService {

    GrammarRepository grammarRepository;
    LessonPartRepository lessonPartRepository;
    GrammarMapper grammarMapper;
    GrammarDetailMapper detailMapper;

    private LessonPart findLessonPartOrThrow(Long lessonPartId) {
        return lessonPartRepository.findById(lessonPartId)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_PART_NOT_FOUND));
    }

    @Override
    public GrammarResponse createGrammar(GrammarRequest request) {
        LessonPart lessonPart = findLessonPartOrThrow(request.getLessonPartId());

        Grammar newGrammar = grammarMapper.toGrammar(request);

        newGrammar.setLessonPart(lessonPart);

        if (request.getDetails() != null) {
            Set<GrammarDetail> details = request.getDetails().stream()
                    .map(detailRequest -> {
                        GrammarDetail detail = detailMapper.toGrammarDetail(detailRequest);
                        detail.setGrammar(newGrammar);
                        return detail;
                    })
                    .collect(Collectors.toSet());
            newGrammar.setGrammarDetails(details);
        }

        Grammar savedGrammar = grammarRepository.save(newGrammar);
        return grammarMapper.toGrammarResponse(savedGrammar);
    }

    @Override

    public List<GrammarResponse> getAllGrammars() {

        return grammarRepository.findAll().stream()

                .map(grammarMapper::toGrammarResponse)

                .collect(Collectors.toList());

    }



    @Override

    public GrammarResponse getGrammarById(Long id) {

        Grammar grammar = grammarRepository.findById(id)

                .orElseThrow(() -> new AppException(ErrorCode.GRAMMAR_NOT_FOUND));

        return grammarMapper.toGrammarResponse(grammar);

    }

    @Override
    public List<GrammarResponse> getGrammarsByLessonPart(Long lessonPartId) {
        if (!lessonPartRepository.existsById(lessonPartId)) {
            throw new AppException(ErrorCode.LESSON_PART_NOT_FOUND);
        }
        return grammarRepository.findByLessonPart_Id(lessonPartId).stream()
                .map(grammarMapper::toGrammarResponse)
                .collect(Collectors.toList());
    }


    @Override
    public GrammarResponse updateGrammar(Long id, GrammarRequest request) {
        Grammar existingGrammar = grammarRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.GRAMMAR_NOT_FOUND));

        if (request.getLessonPartId() != null &&
                (existingGrammar.getLessonPart() == null || !existingGrammar.getLessonPart().getId().equals(request.getLessonPartId()))) {
            LessonPart newLessonPart = findLessonPartOrThrow(request.getLessonPartId());
            existingGrammar.setLessonPart(newLessonPart);
        }

        grammarMapper.updateGrammar(existingGrammar, request);

        Map<Long, GrammarDetail> existingDetailsMap = existingGrammar.getGrammarDetails().stream()
                .collect(Collectors.toMap(GrammarDetail::getId, Function.identity()));

        Set<GrammarDetail> detailsToKeepOrAdd = new HashSet<>();

        if (request.getDetails() != null) {
            for (GrammarDetailRequest detailRequest : request.getDetails()) {
                if (detailRequest.getId() != null && existingDetailsMap.containsKey(detailRequest.getId())) {
                    GrammarDetail detailToUpdate = existingDetailsMap.get(detailRequest.getId());
                    detailMapper.updateGrammarDetail(detailToUpdate, detailRequest);
                    detailsToKeepOrAdd.add(detailToUpdate);
                } else {
                    GrammarDetail newDetail = detailMapper.toGrammarDetail(detailRequest);
                    newDetail.setGrammar(existingGrammar);
                    detailsToKeepOrAdd.add(newDetail);
                }
            }
        }

        existingGrammar.getGrammarDetails().clear();
        existingGrammar.getGrammarDetails().addAll(detailsToKeepOrAdd);

        Grammar updatedGrammar = grammarRepository.save(existingGrammar);
        return grammarMapper.toGrammarResponse(updatedGrammar);
    }

    @Override
    public void deleteGrammar(Long id) {
        if (!grammarRepository.existsById(id)) {
            throw new AppException(ErrorCode.GRAMMAR_NOT_FOUND);
        }
        grammarRepository.deleteById(id);
    }
}
