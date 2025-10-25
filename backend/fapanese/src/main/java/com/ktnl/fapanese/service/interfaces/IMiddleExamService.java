package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.MiddleExamRequest;
import com.ktnl.fapanese.dto.response.MiddleExamResponse;
import com.ktnl.fapanese.dto.response.SpeakingExamResponse;

import java.util.List;

public interface IMiddleExamService {
    List<MiddleExamResponse> getAllMiddleExams();

    MiddleExamResponse getMiddleExamById(Long id);

    MiddleExamResponse createMiddleExam(MiddleExamRequest request);

    MiddleExamResponse updateMiddleExam(Long id, MiddleExamRequest request);

    void deleteMiddleExam(Long id);

    List<MiddleExamResponse> getAllMiddleExamsByOverviewPartId(Long partId);
}
