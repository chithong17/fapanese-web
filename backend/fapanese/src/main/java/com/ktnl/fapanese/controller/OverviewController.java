package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.OverviewRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.OverviewResponse;
import com.ktnl.fapanese.service.interfaces.IOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/overviews")
@RequiredArgsConstructor
public class OverviewController {

    private final IOverviewService overviewService;

    @GetMapping
    public ApiResponse<List<OverviewResponse>> getAllOverviews() {
        List<OverviewResponse> result = overviewService.getAllOverviews();
        return ApiResponse.<List<OverviewResponse>>builder()
                .result(result)
                .message("Get all overviews success")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<OverviewResponse> getOverviewById(@PathVariable Long id) {
        OverviewResponse result = overviewService.getOverviewById(id);
        return ApiResponse.<OverviewResponse>builder()
                .result(result)
                .message("Get overview by id success")
                .build();
    }

    @PostMapping
    public ApiResponse<OverviewResponse> createOverview(@RequestBody OverviewRequest request) {
        OverviewResponse result = overviewService.createOverview(request);
        return ApiResponse.<OverviewResponse>builder()
                .result(result)
                .message("Create overview success")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<OverviewResponse> updateOverview(@PathVariable Long id, @RequestBody OverviewRequest request) {
        OverviewResponse result = overviewService.updateOverview(id, request);
        return ApiResponse.<OverviewResponse>builder()
                .result(result)
                .message("Update overview success")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteOverview(@PathVariable Long id) {
        overviewService.deleteOverview(id);
        return ApiResponse.<String>builder()
                .message("Delete overview success")
                .build();
    }

    @GetMapping("/by-course/{courseCode}")
    public ApiResponse<List<OverviewResponse>> getAllOverviews(@PathVariable String courseCode) {
        List<OverviewResponse> result = overviewService.getAllOverviewsByCourseCode(courseCode);
        return ApiResponse.<List<OverviewResponse>>builder()
                .result(result)
                .message("Get all overviews by CourseCode success")
                .build();
    }


}
