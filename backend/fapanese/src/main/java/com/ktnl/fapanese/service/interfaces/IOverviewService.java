package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.OverviewRequest;
import com.ktnl.fapanese.dto.response.OverviewResponse;

import java.util.List;

public interface IOverviewService {
    List<OverviewResponse> getAllOverviews();

    OverviewResponse getOverviewById(Long id);

    OverviewResponse createOverview(OverviewRequest request);

    OverviewResponse updateOverview(Long id, OverviewRequest request);

    void deleteOverview(Long id);

    List<OverviewResponse> getAllOverviewsByCourseCode(String courseCode);
}
