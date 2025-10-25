package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.OverviewPartRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.LessonPartSimpleResponse;
import com.ktnl.fapanese.dto.response.OverviewPartResponse;
import com.ktnl.fapanese.service.interfaces.IOverviewPartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/overview-parts")
@RequiredArgsConstructor
public class OverviewPartController {

    private final IOverviewPartService overviewPartService;

    @GetMapping
    public ApiResponse<List<OverviewPartResponse>> getAllOverviewParts() {
        List<OverviewPartResponse> result = overviewPartService.getAllOverviewParts();
        return ApiResponse.<List<OverviewPartResponse>>builder()
                .result(result)
                .message("Get all overview parts success")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<OverviewPartResponse> getOverviewPartById(@PathVariable Long id) {
        OverviewPartResponse result = overviewPartService.getOverviewPartById(id);
        return ApiResponse.<OverviewPartResponse>builder()
                .result(result)
                .message("Get overview part by id success")
                .build();
    }

    @PostMapping
    public ApiResponse<OverviewPartResponse> createOverviewPart(@RequestBody OverviewPartRequest request) {
        OverviewPartResponse result = overviewPartService.createOverviewPart(request);
        return ApiResponse.<OverviewPartResponse>builder()
                .result(result)
                .message("Create overview part success")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<OverviewPartResponse> updateOverviewPart(@PathVariable Long id, @RequestBody OverviewPartRequest request) {
        OverviewPartResponse result = overviewPartService.updateOverviewPart(id, request);
        return ApiResponse.<OverviewPartResponse>builder()
                .result(result)
                .message("Update overview part success")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteOverviewPart(@PathVariable Long id) {
        overviewPartService.deleteOverviewPart(id);
        return ApiResponse.<String>builder()
                .message("Delete overview part success")
                .build();
    }

    @GetMapping("/by-overview/{overviewId}")
    public ApiResponse<List<OverviewPartResponse>> getLessonPartsByLesson(@PathVariable Long overviewId) {
        List<OverviewPartResponse> result = overviewPartService.getOverviewPartByOverview(overviewId);
        return ApiResponse.<List<OverviewPartResponse>>builder()
                .message("Overview parts fetched successfully for Overview " + overviewId)
                .result(result)
                .build();
    }
}
