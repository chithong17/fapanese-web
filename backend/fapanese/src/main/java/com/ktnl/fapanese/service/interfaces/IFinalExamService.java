package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.FinalExamRequest;
import com.ktnl.fapanese.dto.response.FinalExamResponse;

import java.util.List;

public interface IFinalExamService {
    List<FinalExamResponse> getAllFinalExams();

    FinalExamResponse getFinalExamById(Long id);

    FinalExamResponse createFinalExam(FinalExamRequest request);

    FinalExamResponse updateFinalExam(Long id, FinalExamRequest request);

    void deleteFinalExam(Long id);
}
