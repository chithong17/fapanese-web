package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.response.LessonPartSimpleResponse;
import com.ktnl.fapanese.entity.LessonPart;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.LessonPartMapper;
import com.ktnl.fapanese.repository.LessonPartRepository;
import com.ktnl.fapanese.repository.LessonRepository;
import com.ktnl.fapanese.service.interfaces.ILessonPartService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonPartService implements ILessonPartService {

    LessonPartRepository lessonPartRepository;
    LessonRepository lessonRepository; // Inject LessonRepository
    LessonPartMapper lessonPartMapper;

    @Override
    public List<LessonPartSimpleResponse> getLessonPartsByLesson(Long lessonId) {

        if (!lessonRepository.existsById(lessonId)) {
            throw new AppException(ErrorCode.LESSON_NOT_FOUND);
        }

        List<LessonPart> lessonParts = lessonPartRepository.findByLessonId(lessonId);

        return lessonPartMapper.toLessonPartSimpleResponseList(lessonParts);
    }

}
