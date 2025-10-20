package com.ktnl.fapanese.controller;


import com.ktnl.fapanese.dto.request.SpeakingRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.SpeakingRespone;
import com.ktnl.fapanese.service.implementations.SpeakingService;
import com.ktnl.fapanese.service.interfaces.ISpeakingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/speakings")
@RequiredArgsConstructor
public class SpeakingController {
    private final ISpeakingService speakingService;

    @GetMapping
    public ApiResponse<List<SpeakingRespone>> getAllSpeakings() {
        List<SpeakingRespone> result = speakingService.getAllSpeakings();
        return ApiResponse.<List<SpeakingRespone>>builder()
                .result(result)
                .message("Get all speakings success")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<SpeakingRespone> getSpeakingById(@PathVariable Long id) {
        SpeakingRespone result = speakingService.getSpeakingById(id);
        return ApiResponse.<SpeakingRespone>builder()
                .result(result)
                .message("Get speaking by Id success")
                .build();
    }

    @DeleteMapping
    public ApiResponse<Void> deleteSpeakingById(@PathVariable Long id) {
        speakingService.deleteSpeakingById(id);
        return ApiResponse.<Void>builder()
                .message("Delete speaking success")
                .build();
    }

    @PostMapping
    public ApiResponse<SpeakingRespone> createSpeaking(@RequestBody SpeakingRequest speakingRequest) {
        SpeakingRespone result = speakingService.createSpeaking(speakingRequest);
        return ApiResponse.<SpeakingRespone>builder()
                .result(result)
                .message("Create speaking success")
                .build();
    }

}
