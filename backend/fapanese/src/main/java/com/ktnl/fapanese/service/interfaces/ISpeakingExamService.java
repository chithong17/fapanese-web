package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.SpeakingExamRequest;
import com.ktnl.fapanese.dto.response.SpeakingExamResponse;
import com.ktnl.fapanese.dto.response.SpeakingTestResponse;

import java.util.List;

public interface ISpeakingExamService {
    List<SpeakingExamResponse> getAllSpeakingExams();

    SpeakingExamResponse getSpeakingExamById(Long id);

    SpeakingExamResponse createSpeakingExam(SpeakingExamRequest request);

    SpeakingExamResponse updateSpeakingExam(Long id, SpeakingExamRequest request);

    void deleteSpeakingExam(Long id);

    List<SpeakingExamResponse> getAllSpeakingExamsByOverviewPartId(Long partId);

    SpeakingTestResponse generateRandomSpeakingTest(Long overviewPartId);
}