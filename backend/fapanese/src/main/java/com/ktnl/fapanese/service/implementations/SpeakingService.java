package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.SpeakingRequest;
import com.ktnl.fapanese.dto.response.SpeakingRespone;
import com.ktnl.fapanese.entity.Speaking;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.SpeakingMapper;
import com.ktnl.fapanese.repository.SpeakingRepository;
import com.ktnl.fapanese.service.interfaces.ISpeakingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpeakingService implements ISpeakingService {
    private final SpeakingRepository speakingRepository;
    private final SpeakingMapper speakingMapper;


    @Override
    public SpeakingRespone createSpeaking(SpeakingRequest request) {
        Speaking speaking = speakingMapper.toSpeaking(request);
        Speaking saved =  speakingRepository.save(speaking);
        return speakingMapper.toSpeakingResponse(saved);
    }

    @Override
    public SpeakingRespone getSpeakingById(Long id) {
        Speaking speaking = speakingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPEAKING_NOT_FOUND));
        return speakingMapper.toSpeakingResponse(speaking);
    }

    @Override
    public List<SpeakingRespone> getAllSpeakings() {
        return speakingRepository.findAll()
                .stream()
                .map(speakingMapper::toSpeakingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SpeakingRespone updateSpeaking(Long id,SpeakingRequest request) {
        Speaking speaking = speakingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPEAKING_NOT_FOUND));
        speakingMapper.updateSpeaking(speaking, request);
        Speaking saved = speakingRepository.save(speaking);

        return speakingMapper.toSpeakingResponse(saved);
    }

    @Override
    public void deleteSpeakingById(Long id) {
        if (!speakingRepository.existsById(id)){
            throw new AppException(ErrorCode.SPEAKING_NOT_FOUND);
        }
        speakingRepository.deleteById(id);
    }


}
