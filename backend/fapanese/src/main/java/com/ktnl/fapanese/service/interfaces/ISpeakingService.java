package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.SpeakingRequest;
import com.ktnl.fapanese.dto.response.SpeakingRespone;
import com.ktnl.fapanese.entity.Speaking;

import java.util.List;

public interface ISpeakingService {
    SpeakingRespone createSpeaking(SpeakingRequest request);
    SpeakingRespone getSpeakingById(Long id);
    List<SpeakingRespone> getAllSpeakings();
    SpeakingRespone updateSpeaking(Long id, SpeakingRequest request);
    void deleteSpeakingById(Long id);
}
