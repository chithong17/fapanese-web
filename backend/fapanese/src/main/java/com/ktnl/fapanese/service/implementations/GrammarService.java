//package com.ktnl.fapanese.service.implementations;
//
//import com.ktnl.fapanese.dto.request.GrammarRequest;
//import com.ktnl.fapanese.dto.response.GrammarResponse;
//import com.ktnl.fapanese.entity.Grammar;
//import com.ktnl.fapanese.entity.Lesson;
//import com.ktnl.fapanese.exception.AppException;
//import com.ktnl.fapanese.exception.ErrorCode;
//import com.ktnl.fapanese.mapper.GrammarMapper;
//import com.ktnl.fapanese.repository.GrammarRepository;
//import com.ktnl.fapanese.service.interfaces.IGrammarService;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//public class GrammarService implements IGrammarService {
//
//    GrammarRepository grammarRepository;
//    LessonRepository lessonRepository;
//    GrammarMapper grammarMapper;
//
//    private Lesson findLessonOrThrow(Long lessonId) {
//        return lessonRepository.findById(lessonId)
//                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));
//    }
//
//    @Override
//    public GrammarResponse createGrammar(GrammarRequest request) {
//        Lesson lesson = findLessonOrThrow(request.getLessonId());
//
//        Grammar newGrammar = grammarMapper.toGrammar(request);
//        newGrammar.setLesson(lesson); // Gán Lesson Entity
//
//        Grammar savedGrammar = grammarRepository.save(newGrammar);
//        return grammarMapper.toGrammarResponse(savedGrammar);
//    }
//
//    @Override
//    public List<GrammarResponse> getAllGrammars() {
//        return grammarRepository.findAll().stream()
//                .map(grammarMapper::toGrammarResponse)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public GrammarResponse getGrammarById(Long id) {
//        Grammar grammar = grammarRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.GRAMMAR_NOT_FOUND));
//        return grammarMapper.toGrammarResponse(grammar);
//    }
//
//    @Override
//    public List<GrammarResponse> getGrammarsByLesson(Long lessonId) {
//        if (!lessonRepository.existsById(lessonId)) {
//            throw new AppException(ErrorCode.LESSON_NOT_FOUND);
//        }
//
//        return grammarRepository.findByLessonId(lessonId).stream()
//                .map(grammarMapper::toGrammarResponse)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public GrammarResponse updateGrammar(Long id, GrammarRequest request) {
//        Grammar existingGrammar = grammarRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.GRAMMAR_NOT_FOUND));
//
//        if (!existingGrammar.getLesson().getId().equals(request.getLessonId())) {
//            Lesson newLesson = findLessonOrThrow(request.getLessonId());
//            existingGrammar.setLesson(newLesson);
//        }
//
//        grammarMapper.updateGrammar(existingGrammar, request);
//
//        Grammar updatedGrammar = grammarRepository.save(existingGrammar);
//        return grammarMapper.toGrammarResponse(updatedGrammar);
//    }
//
//    @Override
//    public void deleteGrammar(Long id) {
//        if (!grammarRepository.existsById(id)) {
//            throw new AppException(ErrorCode.GRAMMAR_NOT_FOUND);
//        }
//        grammarRepository.deleteById(id);
//    }
//}
